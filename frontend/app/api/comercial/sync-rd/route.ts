import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  rdFetchAll,
  rdFetchDealActivities,
  rdFetchDealNotes,
  rdFetchDealTasks,
  mapStage,
  inferWonLost,
  type RdDeal,
  type RdPipeline,
} from "../_rd-shared";

export const maxDuration = 300;

// ── Sync core ────────────────────────────────────────────────────────────────

interface SyncResult {
  deals_synced: number;
  deals_created: number;
  deals_updated: number;
  activities_synced: number;
  pipelines_synced: number;
  errors: string[];
}

async function runSync(
  db: ReturnType<typeof createServiceClient>,
  tenantId: string,
  token: string,
  lastSync: string | null,
  userId: string | null,
): Promise<SyncResult> {
  const results: SyncResult = {
    deals_synced: 0,
    deals_created: 0,
    deals_updated: 0,
    activities_synced: 0,
    pipelines_synced: 0,
    errors: [],
  };

  // ── 1. Fetch pipelines (always full) ─────────────────────────────────────
  const rdPipelines = await rdFetchAll<RdPipeline>("/deal_pipelines", token).catch(() => [] as RdPipeline[]);

  const pipelineMap = new Map<string, { name: string; stages: Array<{ id: string; name: string }> }>();
  for (const p of rdPipelines) {
    const pid = p._id ?? p.id;
    pipelineMap.set(pid, { name: p.name, stages: p.stages ?? [] });
    const { error } = await db.from("rd_pipelines" as never).upsert({
      tenant_id: tenantId,
      rd_pipeline_id: pid,
      name: p.name,
      stages: (p.stages ?? []).map((s, idx) => ({ id: s.id, name: s.name, order: idx })),
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "tenant_id,rd_pipeline_id" });
    if (error) results.errors.push(`Pipeline ${p.name}: ${error.message}`);
    else results.pipelines_synced++;
  }

  // ── 2. Fetch deals (incremental if lastSync available) ───────────────────
  const dealsEndpoint = lastSync
    ? `/deals?order_by=updated_at&sort=desc&updated_since=${lastSync}`
    : "/deals";
  const rdDeals = await rdFetchAll<RdDeal>(dealsEndpoint, token);

  if (rdDeals.length === 0) {
    return results;
  }

  // ── 3. Find existing deals by rd_deal_id ─────────────────────────────────
  const rdDealIds = rdDeals.map((d) => d.id);
  const { data: existingDeals } = await db
    .from("crm_deals")
    .select("id, rd_deal_id")
    .eq("tenant_id", tenantId)
    .in("rd_deal_id", rdDealIds);

  const existingMap = new Map((existingDeals ?? []).map((d: { id: string; rd_deal_id: string }) => [d.rd_deal_id, d.id]));

  const toInsert: Record<string, unknown>[] = [];
  const toUpdate: { dbId: string; data: Record<string, unknown> }[] = [];
  const dealIdMap = new Map<string, string>();
  const newDealRdIds = new Set<string>();

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
        newDealRdIds.add(rd.id);
      }
    } catch (err) {
      results.errors.push(`Deal "${rd.name}": ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  // Batch insert
  const BATCH = 100;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { data: inserted, error: insertErr } = await db
      .from("crm_deals")
      .insert(batch as never)
      .select("id, rd_deal_id");

    if (insertErr) {
      results.errors.push(`Batch insert: ${insertErr.message}`);
    } else {
      results.deals_created += batch.length;
      for (const row of (inserted ?? []) as Array<{ id: string; rd_deal_id: string }>) {
        dealIdMap.set(row.rd_deal_id, row.id);
      }
    }
  }

  // Batch update
  for (const item of toUpdate) {
    const { error } = await db.from("crm_deals").update(item.data as never).eq("id", item.dbId);
    if (error) results.errors.push(`Update ${item.dbId}: ${error.message}`);
    else results.deals_updated++;
  }

  results.deals_synced = results.deals_created + results.deals_updated;

  // ── 4. Fetch activities for NEW deals only ───────────────────────────────
  const activityBatch: Record<string, unknown>[] = [];

  for (const rd of rdDeals) {
    if (!newDealRdIds.has(rd.id)) continue;

    const dbDealId = dealIdMap.get(rd.id) ?? null;
    const [activities, notes, tasks] = await Promise.all([
      rdFetchDealActivities(rd.id, token),
      rdFetchDealNotes(rd.id, token),
      rdFetchDealTasks(rd.id, token),
    ]);

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
    }

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
        metadata: { rd_note_id: n._id ?? n.id },
        occurred_at: n.created_at ?? new Date().toISOString(),
      });
    }

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
    }
  }

  // Insert activities
  for (let i = 0; i < activityBatch.length; i += BATCH) {
    const batch = activityBatch.slice(i, i + BATCH);
    const { error } = await db.from("crm_deal_activities" as never).insert(batch as never);
    if (error) results.errors.push(`Activities batch: ${error.message}`);
    else results.activities_synced += batch.length;
  }

  // Update activity counts for new deals
  for (const rdId of Array.from(newDealRdIds)) {
    const dbId = dealIdMap.get(rdId);
    if (!dbId) continue;
    const count = activityBatch.filter((a) => a.rd_deal_id === rdId).length;
    const lastActivity = activityBatch
      .filter((a) => a.rd_deal_id === rdId)
      .map((a) => a.occurred_at as string)
      .sort()
      .pop();
    await db.from("crm_deals").update({
      activities_count: count,
      last_activity_at: lastActivity ?? null,
    } as never).eq("id", dbId);
  }

  return results;
}

// ── POST: Manual trigger (authenticated user) ────────────────────────────────

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

    const rdConfig = rdConfigRaw as { api_token: string; last_sync: string | null } | null;
    if (!rdConfig?.api_token) {
      return NextResponse.json({ error: "RD Station não configurado ou desabilitado" }, { status: 400 });
    }

    // Create running log
    await db.from("rd_sync_log" as never).insert({
      tenant_id: tenantId,
      status: "running",
      triggered_by: user.id,
      trigger_source: "manual",
      deals_synced: 0,
      contacts_synced: 0,
      organizations_synced: 0,
    } as never);

    const results = await runSync(db as never, tenantId, rdConfig.api_token, rdConfig.last_sync, user.id);

    // Update rd_config.last_sync
    await db.from("rd_config" as never).update({
      last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never).eq("tenant_id", tenantId);

    // Log result
    await db.from("rd_sync_log" as never).insert({
      tenant_id: tenantId,
      status: results.errors.length > 0 ? "partial" : "success",
      triggered_by: user.id,
      trigger_source: "manual",
      deals_synced: results.deals_synced,
      contacts_synced: 0,
      organizations_synced: 0,
      errors: results.errors.length > 0 ? results.errors : null,
    } as never);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 },
    );
  }
}

// ── GET: Cron trigger (Vercel Cron with CRON_SECRET) ─────────────────────────
// Configure in Vercel: GET /api/comercial/sync-rd every 4 hours (0 */4 * * *)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const serviceDb = createServiceClient(supabaseUrl, serviceKey);

  // Fetch all active RD configs
  const { data: configs, error: cfgErr } = await serviceDb
    .from("rd_config" as never)
    .select("*")
    .eq("enabled", true);

  if (cfgErr || !configs || configs.length === 0) {
    return NextResponse.json({ message: "No active RD configs", synced: 0 });
  }

  const allResults: Array<{ tenant_id: string; result: SyncResult }> = [];

  for (const cfg of configs as Array<{ tenant_id: string; api_token: string; last_sync: string | null }>) {
    if (!cfg.api_token) continue;

    try {
      const result = await runSync(serviceDb as never, cfg.tenant_id, cfg.api_token, cfg.last_sync, null);

      // Update last_sync
      await serviceDb.from("rd_config" as never).update({
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never).eq("tenant_id", cfg.tenant_id);

      // Log
      await serviceDb.from("rd_sync_log" as never).insert({
        tenant_id: cfg.tenant_id,
        status: result.errors.length > 0 ? "partial" : "success",
        triggered_by: null,
        trigger_source: "cron",
        deals_synced: result.deals_synced,
        contacts_synced: 0,
        organizations_synced: 0,
        errors: result.errors.length > 0 ? result.errors : null,
      } as never);

      allResults.push({ tenant_id: cfg.tenant_id, result });
    } catch (err) {
      await serviceDb.from("rd_sync_log" as never).insert({
        tenant_id: cfg.tenant_id,
        status: "error",
        triggered_by: null,
        trigger_source: "cron",
        deals_synced: 0,
        contacts_synced: 0,
        organizations_synced: 0,
        errors: [err instanceof Error ? err.message : "unknown"],
      } as never);
    }
  }

  return NextResponse.json({
    message: `Synced ${allResults.length} tenant(s)`,
    results: allResults,
  });
}
