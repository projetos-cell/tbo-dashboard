import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── Types ────────────────────────────────────────────────────────────────────────

interface RdDeal {
  id: string;
  name: string;
  amount_total?: number;
  deal_stage?: { id: string; name: string };
  organization?: { id: string; name: string } | null;
  contacts?: Array<{ id: string; name: string; emails?: Array<{ email: string }> }>;
  user?: { id: string; name: string } | null;
  win?: boolean;
  closed_at?: string;
  created_at?: string;
  updated_at?: string;
  prediction_date?: string;
  campaign?: { id: string; name: string } | null;
  deal_source?: { id: string; name: string } | null;
  rating?: number;
  custom_fields?: Record<string, unknown>;
}

interface StageRow {
  id: string;
  label: string;
  sort_order: number;
}

// ── RD Station API helper ────────────────────────────────────────────────────────

const RD_BASE = "https://crm.rdstation.com/api/v1";

async function rdFetchAll<T>(
  endpoint: string,
  token: string,
  limit = 200,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${RD_BASE}${endpoint}${sep}token=${token}&page=${page}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      break;
    }

    const body = await res.json();

    let items: T[];
    if (Array.isArray(body)) {
      items = body;
    } else {
      const key = Object.keys(body).find((k) => Array.isArray(body[k]));
      items = key ? body[key] : [];
    }

    if (items.length === 0) {
      hasMore = false;
    } else {
      all.push(...items);
      page++;
      if (all.length >= 5000) break;
    }
  }

  return all;
}

// ── Stage mapping ────────────────────────────────────────────────────────────────

const RD_STAGE_MAP: Record<string, string> = {
  // Common RD stage names → our crm_stages labels
  "qualificação": "qualificacao",
  "qualificacao": "qualificacao",
  "qualification": "qualificacao",
  "proposta": "proposta",
  "proposal": "proposta",
  "negociação": "negociacao",
  "negociacao": "negociacao",
  "negotiation": "negociacao",
  "fechamento": "fechamento",
  "closing": "fechamento",
  "ganho": "fechado_ganho",
  "won": "fechado_ganho",
  "fechado ganho": "fechado_ganho",
  "perdido": "fechado_perdido",
  "lost": "fechado_perdido",
  "fechado perdido": "fechado_perdido",
  "prospecção": "prospeccao",
  "prospeccao": "prospeccao",
  "prospecting": "prospeccao",
  "contato inicial": "prospeccao",
  "initial contact": "prospeccao",
};

function mapRdStage(
  rdStageName: string | undefined,
  stages: StageRow[],
  isWon: boolean,
  isClosed: boolean,
): string {
  if (isWon) {
    return stages.find((s) => s.id === "fechado_ganho")?.id ?? "fechado_ganho";
  }
  if (isClosed) {
    return stages.find((s) => s.id === "fechado_perdido")?.id ?? "fechado_perdido";
  }

  if (!rdStageName) {
    return stages[0]?.id ?? "prospeccao";
  }

  const normalized = rdStageName.toLowerCase().trim();

  // Direct match by id
  const directMatch = stages.find((s) => s.id === normalized);
  if (directMatch) return directMatch.id;

  // Match by label
  const labelMatch = stages.find(
    (s) => s.label.toLowerCase() === normalized,
  );
  if (labelMatch) return labelMatch.id;

  // Mapped match
  const mapped = RD_STAGE_MAP[normalized];
  if (mapped) {
    const stageMatch = stages.find((s) => s.id === mapped);
    if (stageMatch) return stageMatch.id;
  }

  // Fuzzy: partial match
  const fuzzy = stages.find(
    (s) =>
      s.label.toLowerCase().includes(normalized) ||
      normalized.includes(s.label.toLowerCase()),
  );
  if (fuzzy) return fuzzy.id;

  // Default: first non-closed stage
  return (
    stages.find(
      (s) => !s.id.startsWith("fechado"),
    )?.id ?? stages[0]?.id ?? "prospeccao"
  );
}

// ── POST Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const db = await createClient();

    const {
      data: { user },
      error: authErr,
    } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 },
      );
    }

    // 1. Load RD config
    const { data: rdConfigRaw } = await db
      .from("rd_config" as never)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("enabled", true)
      .maybeSingle();

    const rdConfig = rdConfigRaw as { api_token: string; enabled: boolean } | null;

    if (!rdConfig?.api_token) {
      return NextResponse.json(
        { error: "RD Station não configurado ou desabilitado" },
        { status: 400 },
      );
    }

    // 2. Create sync log entry
    const { data: syncLog, error: syncLogErr } = await db
      .from("rd_sync_log" as never)
      .insert({
        tenant_id: tenantId,
        status: "running",
        triggered_by: user.id,
        trigger_source: "manual_comercial",
        deals_synced: 0,
        contacts_synced: 0,
        organizations_synced: 0,
        errors: [],
      } as never)
      .select()
      .single();

    if (syncLogErr) {
      return NextResponse.json(
        { error: `Sync log: ${syncLogErr.message}` },
        { status: 500 },
      );
    }

    const syncId = (syncLog as Record<string, unknown>).id as string;

    // 3. Fetch deals from RD Station
    const token = rdConfig.api_token;
    let rdDeals: RdDeal[] = [];

    try {
      rdDeals = await rdFetchAll<RdDeal>("/deals", token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "RD Station fetch failed";
      await db
        .from("rd_sync_log" as never)
        .update({
          status: "error",
          errors: [msg],
          finished_at: new Date().toISOString(),
        } as never)
        .eq("id", syncId);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // 4. Load our stages for mapping
    const { data: stages } = await db
      .from("crm_stages")
      .select("id, label, sort_order")
      .order("sort_order");

    const stageList = (stages ?? []) as StageRow[];

    // 5. Upsert deals into crm_deals
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const rd of rdDeals) {
      try {
        const isClosed = !!rd.closed_at;
        const isWon = !!rd.win;

        const stage = mapRdStage(
          rd.deal_stage?.name,
          stageList,
          isWon,
          isClosed && !isWon,
        );

        const contact = rd.contacts?.[0];
        const contactEmail = contact?.emails?.[0]?.email ?? null;

        const dealData: Record<string, unknown> = {
          tenant_id: tenantId,
          name: rd.name,
          company: rd.organization?.name ?? null,
          contact: contact?.name ?? null,
          contact_email: contactEmail,
          stage,
          value: rd.amount_total ?? null,
          probability: isWon ? 100 : isClosed ? 0 : rd.rating ? rd.rating * 20 : null,
          owner_name: rd.user?.name ?? null,
          source: "rdstation",
          rd_deal_id: rd.id,
          expected_close: rd.prediction_date ?? null,
          updated_at: new Date().toISOString(),
        };

        // Find existing by rd_deal_id
        const { data: existing } = await db
          .from("crm_deals")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("rd_deal_id", rd.id)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { tenant_id: _, ...updates } = dealData;
          await db
            .from("crm_deals")
            .update(updates as never)
            .eq("id", existing.id);
          results.updated++;
        } else {
          // Insert new
          await db.from("crm_deals").insert(dealData as never);
          results.created++;
        }
      } catch (err) {
        results.errors.push(
          `Deal "${rd.name}": ${err instanceof Error ? err.message : "unknown"}`,
        );
      }
    }

    // 6. Update sync log
    await db
      .from("rd_sync_log" as never)
      .update({
        status: results.errors.length > 0 ? "error" : "success",
        deals_synced: results.created + results.updated,
        errors: results.errors.length > 0 ? results.errors : [],
        finished_at: new Date().toISOString(),
      } as never)
      .eq("id", syncId);

    // 7. Update rd_config.last_sync
    await db
      .from("rd_config" as never)
      .update({ last_sync: new Date().toISOString() } as never)
      .eq("tenant_id", tenantId);

    return NextResponse.json({
      success: true,
      deals_total: rdDeals.length,
      created: results.created,
      updated: results.updated,
      errors: results.errors,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
