import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  rdFetchAll,
  rdFetchDealActivities,
  rdFetchDealNotes,
  rdFetchDealTasks,
  mapStage,
  inferWonLost,
  type RdDeal,
  type RdPipeline,
  type RdContact,
  type RdOrganization,
} from "../_rd-shared";

/**
 * RD Station → Supabase: Migração final completa
 * Importa deals + activities + notes + contacts + organizations
 * Depois de rodar, o RD Station pode ser esvaziado
 */
export const maxDuration = 300; // 5 min (Vercel Pro) — ajustar para 60 no Hobby

// ── POST Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user }, error: authErr } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }

    // Load RD config
    const { data: rdConfigRaw } = await db
      .from("rd_config" as never)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("enabled", true)
      .maybeSingle();

    const rdConfig = rdConfigRaw as { api_token: string } | null;
    if (!rdConfig?.api_token) {
      return NextResponse.json({ error: "RD Station não configurado" }, { status: 400 });
    }

    const token = rdConfig.api_token;
    const results = {
      deals_synced: 0,
      activities_imported: 0,
      notes_imported: 0,
      tasks_imported: 0,
      contacts_imported: 0,
      organizations_imported: 0,
      pipelines_synced: 0,
      errors: [] as string[],
    };

    // ── 1. Fetch everything from RD Station ─────────────────────────────────

    const [rdDeals, rdPipelines, rdContacts, rdOrganizations] = await Promise.all([
      rdFetchAll<RdDeal>("/deals", token),
      rdFetchAll<RdPipeline>("/deal_pipelines", token).catch(() => [] as RdPipeline[]),
      rdFetchAll<RdContact>("/contacts", token).catch(() => [] as RdContact[]),
      rdFetchAll<RdOrganization>("/organizations", token).catch(() => [] as RdOrganization[]),
    ]);

    results.contacts_imported = rdContacts.length;
    results.organizations_imported = rdOrganizations.length;

    // ── 2. Upsert pipelines ─────────────────────────────────────────────────

    const pipelineMap = new Map<string, { name: string; stages: Array<{ id: string; name: string }> }>();
    for (const p of rdPipelines) {
      const pid = p._id ?? p.id;
      pipelineMap.set(pid, { name: p.name, stages: p.stages ?? [] });
      await db.from("rd_pipelines" as never).upsert({
        tenant_id: tenantId,
        rd_pipeline_id: pid,
        name: p.name,
        stages: (p.stages ?? []).map((s, idx) => ({ id: s.id, name: s.name, order: idx })),
        updated_at: new Date().toISOString(),
      } as never, { onConflict: "tenant_id,rd_pipeline_id" });
      results.pipelines_synced++;
    }

    // ── 3. Sync deals ───────────────────────────────────────────────────────

    const rdDealIds = rdDeals.map((d) => d.id);
    const { data: existingDeals } = await db
      .from("crm_deals")
      .select("id, rd_deal_id")
      .eq("tenant_id", tenantId)
      .in("rd_deal_id", rdDealIds.length > 0 ? rdDealIds : ["__none__"]);

    const existingMap = new Map((existingDeals ?? []).map((d) => [d.rd_deal_id, d.id]));

    const BATCH = 100;
    const toInsert: Record<string, unknown>[] = [];
    const toUpdate: { dbId: string; data: Record<string, unknown> }[] = [];
    const dealIdMap = new Map<string, string>(); // rd_deal_id → db uuid

    for (const rd of rdDeals) {
      try {
        const isClosed = !!rd.closed_at;
        const rawWin: unknown = rd.win;
        const isWon = Boolean(
          rawWin === true || String(rawWin) === "true" || rawWin === 1 ||
          (isClosed && rd.deal_stage?.name && inferWonLost(rd.deal_stage.name) === "won"),
        );

        const stage = mapStage(rd.deal_stage?.name, isWon, isClosed && !isWon);
        const contact = rd.contacts?.[0];
        const rdPipelineId = rd.deal_pipeline_id ?? null;
        const pipelineInfo = rdPipelineId ? pipelineMap.get(rdPipelineId) : null;

        const dealData: Record<string, unknown> = {
          tenant_id: tenantId,
          name: rd.name,
          company: rd.organization?.name ?? null,
          contact: contact?.name ?? null,
          contact_email: contact?.emails?.[0]?.email ?? null,
          contact_phone: contact?.phones?.[0]?.phone ?? null,
          stage,
          value: rd.amount_total ?? null,
          probability: isWon ? 100 : isClosed ? 0 : rd.rating ? rd.rating * 20 : null,
          owner_name: rd.user?.name ?? null,
          source: "rdstation",
          rd_deal_id: rd.id,
          rd_pipeline_id: rdPipelineId,
          rd_pipeline_name: pipelineInfo?.name ?? null,
          rd_stage_id: rd.deal_stage?.id ?? null,
          rd_stage_name: rd.deal_stage?.name ?? null,
          rd_user_id: rd.user ? ((rd.user as Record<string, unknown>)._id as string ?? rd.user.id ?? null) : null,
          expected_close: rd.prediction_date ?? null,
          notes: rd.notes ?? null,
          updated_at: new Date().toISOString(),
        };

        const existingId = existingMap.get(rd.id);
        if (existingId) {
          const { tenant_id: _, ...updates } = dealData;
          toUpdate.push({ dbId: existingId, data: updates });
          dealIdMap.set(rd.id, existingId);
        } else {
          toInsert.push(dealData);
        }
      } catch (err) {
        results.errors.push(`Deal "${rd.name}": ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    // Batch insert
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);
      const { data: inserted, error: insertErr } = await db
        .from("crm_deals")
        .insert(batch as never)
        .select("id, rd_deal_id");

      if (insertErr) {
        results.errors.push(`Batch insert: ${insertErr.message}`);
      } else {
        results.deals_synced += batch.length;
        for (const row of (inserted ?? []) as Array<{ id: string; rd_deal_id: string }>) {
          dealIdMap.set(row.rd_deal_id, row.id);
        }
      }
    }

    // Batch update
    for (const item of toUpdate) {
      const { error } = await db.from("crm_deals").update(item.data as never).eq("id", item.dbId);
      if (error) {
        results.errors.push(`Update ${item.dbId}: ${error.message}`);
      } else {
        results.deals_synced++;
      }
    }

    // ── 4. Import activities, notes, tasks per deal ─────────────────────────

    const activityBatch: Record<string, unknown>[] = [];

    for (const rd of rdDeals) {
      const dbDealId = dealIdMap.get(rd.id) ?? null;

      // Fetch activities + notes + tasks for this deal
      const [activities, notes, tasks] = await Promise.all([
        rdFetchDealActivities(rd.id, token),
        rdFetchDealNotes(rd.id, token),
        rdFetchDealTasks(rd.id, token),
      ]);

      // Activities
      for (const a of activities) {
        activityBatch.push({
          tenant_id: tenantId,
          deal_id: dbDealId,
          rd_deal_id: rd.id,
          type: a.type ?? "activity",
          title: a.subject ?? null,
          content: a.text ?? a.content ?? a.notes ?? null,
          author_name: a.user?.name ?? null,
          author_email: a.user?.email ?? null,
          metadata: {
            rd_activity_id: a._id ?? a.id,
            done: a.done,
            duration: a.duration,
            original_type: a.type,
          },
          occurred_at: a.date ?? a.created_at ?? new Date().toISOString(),
        });
        results.activities_imported++;
      }

      // Notes
      for (const n of notes) {
        activityBatch.push({
          tenant_id: tenantId,
          deal_id: dbDealId,
          rd_deal_id: rd.id,
          type: "note",
          title: null,
          content: n.text ?? n.content ?? null,
          author_name: n.user?.name ?? null,
          author_email: n.user?.email ?? null,
          metadata: {
            rd_note_id: n._id ?? n.id,
          },
          occurred_at: n.created_at ?? new Date().toISOString(),
        });
        results.notes_imported++;
      }

      // Tasks
      for (const t of tasks) {
        activityBatch.push({
          tenant_id: tenantId,
          deal_id: dbDealId,
          rd_deal_id: rd.id,
          type: "task",
          title: t.subject ?? null,
          content: t.text ?? null,
          author_name: t.user?.name ?? null,
          author_email: t.user?.email ?? null,
          metadata: {
            rd_task_id: t._id ?? t.id,
            done: t.done,
            task_type: t.type,
          },
          occurred_at: t.date ?? t.created_at ?? new Date().toISOString(),
        });
        results.tasks_imported++;
      }

      // Also create a "creation" activity for the deal itself
      activityBatch.push({
        tenant_id: tenantId,
        deal_id: dbDealId,
        rd_deal_id: rd.id,
        type: "creation",
        title: `Deal criado: ${rd.name}`,
        content: rd.notes ?? null,
        author_name: rd.user?.name ?? null,
        metadata: {
          value: rd.amount_total,
          company: rd.organization?.name,
          pipeline: rd.deal_pipeline_id,
          stage: rd.deal_stage?.name,
          source: rd.deal_source?.name,
          campaign: rd.campaign?.name,
          custom_fields: rd.custom_fields,
        },
        occurred_at: rd.created_at ?? new Date().toISOString(),
      });

      // If deal was won or lost, add that activity too
      if (rd.closed_at) {
        activityBatch.push({
          tenant_id: tenantId,
          deal_id: dbDealId,
          rd_deal_id: rd.id,
          type: rd.win ? "won" : "lost",
          title: rd.win ? `Deal ganho: ${rd.name}` : `Deal perdido: ${rd.name}`,
          content: null,
          author_name: rd.user?.name ?? null,
          metadata: {
            value: rd.amount_total,
            stage: rd.deal_stage?.name,
          },
          occurred_at: rd.closed_at,
        });
      }
    }

    // Batch insert activities
    for (let i = 0; i < activityBatch.length; i += BATCH) {
      const batch = activityBatch.slice(i, i + BATCH);
      const { error } = await db
        .from("crm_deal_activities" as never)
        .insert(batch as never);
      if (error) {
        results.errors.push(`Activities batch: ${error.message}`);
      }
    }

    // ── 5. Update deal activity counts ──────────────────────────────────────

    for (const [rdId, dbId] of dealIdMap) {
      const count = activityBatch.filter((a) => a.rd_deal_id === rdId).length;
      const lastActivity = activityBatch
        .filter((a) => a.rd_deal_id === rdId)
        .map((a) => a.occurred_at as string)
        .sort()
        .pop();

      await db
        .from("crm_deals")
        .update({
          activities_count: count,
          last_activity_at: lastActivity ?? null,
        } as never)
        .eq("id", dbId);
    }

    // ── 6. Store contacts + orgs snapshot as metadata ───────────────────────

    // Store full contacts/orgs data in a metadata record for future reference
    if (rdContacts.length > 0 || rdOrganizations.length > 0) {
      await db.from("crm_deal_activities" as never).insert({
        tenant_id: tenantId,
        deal_id: null,
        rd_deal_id: "__migration_snapshot__",
        type: "note",
        title: "Snapshot completo RD Station — migração final",
        content: `${rdContacts.length} contatos, ${rdOrganizations.length} organizações exportados.`,
        metadata: {
          contacts: rdContacts.map((c) => ({
            id: c.id,
            name: c.name,
            emails: c.emails,
            phones: c.phones,
            organization: c.organization,
            custom_fields: c.custom_fields,
          })),
          organizations: rdOrganizations.map((o) => ({
            id: o.id,
            name: o.name,
            address: o.address,
            city: o.city,
            state: o.state,
            custom_fields: o.custom_fields,
          })),
        },
        occurred_at: new Date().toISOString(),
      } as never);
    }

    // ── 7. Log sync ─────────────────────────────────────────────────────────

    await db.from("rd_sync_log" as never).insert({
      tenant_id: tenantId,
      status: results.errors.length > 0 ? "error" : "success",
      triggered_by: user.id,
      trigger_source: "final_migration",
      deals_synced: results.deals_synced,
      contacts_synced: results.contacts_imported,
      organizations_synced: results.organizations_imported,
      errors: results.errors,
      finished_at: new Date().toISOString(),
    } as never);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Migração final completa. ${results.deals_synced} deals, ${results.activities_imported} activities, ${results.notes_imported} notes, ${results.tasks_imported} tasks importados.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
