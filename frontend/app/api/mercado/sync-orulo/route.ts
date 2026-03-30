// ---------------------------------------------------------------------------
// API Route — Sincronização Órulo → Supabase
// ---------------------------------------------------------------------------
// POST /api/mercado/sync-orulo
// Fluxo para Inteligência de Mercado (conforme docs Órulo):
//   1. Buscar todos os IDs ativos (paginado)
//   2. Para cada empreendimento novo/atualizado: buscar detalhes
//   3. Upsert no Supabase (orulo_buildings + orulo_typologies)
//   4. Buscar IDs removidos e marcar como indisponível
//   5. Log de sync
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  getOruloToken,
  fetchActiveBuildingIds,
  fetchBuildingById,
  fetchRemovedBuildingIds,
  fetchAllPages,
} from "@/features/mercado/services/orulo";
import type {
  OruloBuilding,
  OruloActiveBuildingIdsResponse,
  OruloRemovedBuildingIdsResponse,
} from "@/features/mercado/types/orulo";

// Vercel max duration: 5 min
export const maxDuration = 300;

const BATCH_SIZE = 50;

function getEnvCredentials() {
  const clientId = process.env.ORULO_CLIENT_ID;
  const clientSecret = process.env.ORULO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ORULO_CLIENT_ID e ORULO_CLIENT_SECRET não configurados");
  }
  return { clientId, clientSecret };
}

/** Converte date string DD/MM/AAAA HH:MM:SS → ISO string */
function parseOruloDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  // DD/MM/YYYY HH:MM:SS
  const match = dateStr.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );
  if (!match) {
    // Try DD/MM/YYYY
    const dateOnly = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateOnly) {
      return `${dateOnly[3]}-${dateOnly[2]}-${dateOnly[1]}T00:00:00.000Z`;
    }
    return null;
  }
  return `${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:${match[6]}.000Z`;
}

export async function POST() {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();
  let syncLogId: string | null = null;

  const supabase = await createClient();
  // Tables not yet in generated types (orulo_buildings, orulo_sync_logs)
  const db = supabase as unknown as SupabaseClient;

  try {
    // ── Auth ──────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const tenantId = profile.tenant_id;

    // ── Create sync log ──────────────────────────────────────
    const { data: logRow } = await db
      .from("orulo_sync_log")
      .insert({
        tenant_id: tenantId,
        status: "running",
        started_at: startedAt,
        triggered_by: user.id,
      })
      .select("id")
      .single();

    syncLogId = logRow?.id ?? null;

    // ── Get Órulo token ──────────────────────────────────────
    const { clientId, clientSecret } = getEnvCredentials();
    const token = await getOruloToken(clientId, clientSecret);

    // ── Get last sync date ───────────────────────────────────
    const { data: lastSync } = await db
      .from("orulo_sync_log")
      .select("completed_at")
      .eq("tenant_id", tenantId)
      .eq("status", "success")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const lastSyncDate = lastSync?.completed_at ?? undefined;

    // ── 1. Fetch all active building IDs ─────────────────────
    const activeBuildings = (await fetchAllPages(
      (page) =>
        fetchActiveBuildingIds(token, {
          updated_after: lastSyncDate,
          results_per_page: 500,
          page,
        }),
      (r: OruloActiveBuildingIdsResponse) => r.buildings,
    )) as Array<{ id: string; updated_at: string }>;

    let buildingsSynced = 0;
    let typologiesSynced = 0;
    const errors: Array<{ building_id: string; error: string }> = [];

    // ── 2. Fetch details & upsert in batches ─────────────────
    for (let i = 0; i < activeBuildings.length; i += BATCH_SIZE) {
      const batch = activeBuildings.slice(i, i + BATCH_SIZE);

      // Check time remaining (leave 30s buffer for cleanup)
      if (Date.now() - startTime > 270_000) {
        errors.push({
          building_id: "TIMEOUT",
          error: `Sync interrompido por timeout após ${buildingsSynced} empreendimentos`,
        });
        break;
      }

      const details = await Promise.allSettled(
        batch.map(async (b) => {
          const building = await fetchBuildingById(token, b.id, ["not_available"]);
          return building;
        }),
      );

      const buildingRows: Record<string, unknown>[] = [];
      const typologyRows: Record<string, unknown>[] = [];

      for (const result of details) {
        if (result.status === "rejected") {
          errors.push({
            building_id: "unknown",
            error: String(result.reason),
          });
          continue;
        }

        const b: OruloBuilding = result.value;

        buildingRows.push({
          orulo_id: b.id,
          tenant_id: tenantId,
          name: b.name,
          status: b.status,
          stage: b.stage,
          finality: b.finality,
          type: b.type,
          description: b.description,
          // Address
          street_type: b.address?.street_type,
          street: b.address?.street,
          address_number: b.address?.number,
          area: b.address?.area,
          city: b.address?.city,
          state: b.address?.state,
          zip_code: b.address?.zip_code,
          latitude: b.address?.latitude,
          longitude: b.address?.longitude,
          // Prices
          min_price: b.min_price,
          price_per_m2: b.price_per_private_square_meter,
          // Specs
          min_area: b.min_area,
          max_area: b.max_area,
          min_bedrooms: b.min_bedrooms,
          max_bedrooms: b.max_bedrooms,
          min_suites: b.min_suites,
          max_suites: b.max_suites,
          min_parking: b.min_parking,
          max_parking: b.max_parking,
          min_bathrooms: b.min_bathrooms,
          max_bathrooms: b.max_bathrooms,
          total_units: b.total_units,
          stock: b.stock,
          number_of_floors: b.number_of_floors,
          number_of_towers: b.number_of_towers,
          apts_per_floor: b.apts_per_floor,
          total_area: b.total_area,
          floor_area: b.floor_area,
          // Developer / Publisher
          developer_id: b.developer?.id,
          developer_name: b.developer?.name,
          publisher_id: b.publisher?.id,
          publisher_name: b.publisher?.name,
          // URLs & media
          orulo_url: b.orulo_url,
          default_image_url: b.default_image?.["520x280"] ?? b.default_image?.["1024x1024"],
          webpage: b.webpage,
          virtual_tour: b.virtual_tour,
          // Features (stored as JSONB)
          building_features: b.building_features ?? [],
          unit_features: b.unit_features ?? [],
          // Opportunity
          opportunity: b.opportunity ?? {},
          // Dates
          launch_date: parseOruloDate(b.launch_date),
          opening_date: parseOruloDate(b.opening_date),
          orulo_updated_at: parseOruloDate(b.updated_at),
          orulo_created_at: parseOruloDate(b.created_at),
          // Portfolio
          portfolio: b.portfolio ?? [],
          building_permit: b.building_permit,
          payment_conditions: b.payment_conditions ?? [],
          // Availability
          available: true,
        });

        // Typologies
        if (b.typologies) {
          for (const t of b.typologies) {
            typologyRows.push({
              orulo_id: t.id,
              building_orulo_id: b.id,
              tenant_id: tenantId,
              type: t.type,
              original_price: t.original_price,
              discount_price: t.discount_price,
              private_area: t.private_area,
              total_area: t.total_area,
              bedrooms: t.bedrooms,
              bathrooms: t.bathrooms,
              suites: t.suites,
              parking: t.parking,
              solar_position: t.solar_position,
              total_units: t.total_units,
              stock: t.stock,
              condominium_value: t.condominium_value,
              urban_land_tax: t.urban_land_tax,
              rental_price: t.rental_price,
              reference: t.reference,
              orulo_updated_at: parseOruloDate(t.updated_at),
            });
          }
        }
      }

      // Upsert buildings
      if (buildingRows.length > 0) {
        const { error: buildingErr } = await db
          .from("orulo_buildings")
          .upsert(buildingRows, {
            onConflict: "orulo_id,tenant_id",
          });

        if (buildingErr) {
          errors.push({
            building_id: "batch",
            error: `Upsert buildings: ${buildingErr.message}`,
          });
        } else {
          buildingsSynced += buildingRows.length;
        }
      }

      // Upsert typologies
      if (typologyRows.length > 0) {
        const { error: typoErr } = await db
          .from("orulo_typologies")
          .upsert(typologyRows, {
            onConflict: "orulo_id,tenant_id",
          });

        if (typoErr) {
          errors.push({
            building_id: "batch",
            error: `Upsert typologies: ${typoErr.message}`,
          });
        } else {
          typologiesSynced += typologyRows.length;
        }
      }

      // Update sync log progress
      if (syncLogId) {
        await db
          .from("orulo_sync_log")
          .update({
            buildings_synced: buildingsSynced,
            typologies_synced: typologiesSynced,
          })
          .eq("id", syncLogId);
      }
    }

    // ── 3. Mark removed buildings ────────────────────────────
    let buildingsRemoved = 0;
    if (lastSyncDate) {
      try {
        const removedBuildings = (await fetchAllPages(
          (page) =>
            fetchRemovedBuildingIds(token, lastSyncDate, {
              results_per_page: 500,
              page,
            }),
          (r: OruloRemovedBuildingIdsResponse) => r.buildings,
        )) as Array<{ id: string; updated_at: string; reason: string }>;

        if (removedBuildings.length > 0) {
          const removedIds = removedBuildings.map((b) => b.id);
          const { error: removeErr } = await db
            .from("orulo_buildings")
            .update({ available: false })
            .eq("tenant_id", tenantId)
            .in("orulo_id", removedIds);

          if (removeErr) {
            errors.push({
              building_id: "removed",
              error: `Mark removed: ${removeErr.message}`,
            });
          } else {
            buildingsRemoved = removedBuildings.length;
          }
        }
      } catch (err) {
        errors.push({
          building_id: "removed",
          error: `Fetch removed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // ── 4. Complete sync log ─────────────────────────────────
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    if (syncLogId) {
      await db
        .from("orulo_sync_log")
        .update({
          status: errors.length > 0 ? "partial" : "success",
          completed_at: completedAt,
          duration_ms: durationMs,
          buildings_synced: buildingsSynced,
          typologies_synced: typologiesSynced,
          buildings_removed: buildingsRemoved,
          errors: errors.length > 0 ? errors : null,
        })
        .eq("id", syncLogId);
    }

    return NextResponse.json({
      status: errors.length > 0 ? "partial" : "success",
      buildings_synced: buildingsSynced,
      typologies_synced: typologiesSynced,
      buildings_removed: buildingsRemoved,
      errors_count: errors.length,
      duration_ms: durationMs,
      errors: errors.slice(0, 20), // Limita errors no response
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    // Update sync log with error
    if (syncLogId) {
      await db
        .from("orulo_sync_log")
        .update({
          status: "error",
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - Date.parse(startedAt),
          errors: [{ building_id: "fatal", error: message }],
        })
        .eq("id", syncLogId);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
