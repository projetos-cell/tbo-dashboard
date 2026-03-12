import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { syncExtratoBancario } from "../sync-omie/_sync-extrato";
import { buildBankAccountLookup } from "../sync-omie/_lookups";
import { createSyncLogger } from "../sync-omie/_logger";
import type { OmieCredentials, SupabaseClient } from "../sync-omie/_shared";

const log = createSyncLogger("sync-extrato-cron");

// Dedicated budget for extrato — independent from the main sync
export const maxDuration = 300;

// ── GET /api/finance/sync-extrato (Vercel Cron) ───────────────────────────────
// Also accepts POST for manual trigger from the UI (with user session).

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runExtratoSync("cron");
}

export async function POST() {
  // Manual trigger — same logic, different trigger_source
  return runExtratoSync("manual");
}

// ── Core sync logic ───────────────────────────────────────────────────────────

async function runExtratoSync(triggerSource: "cron" | "manual") {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    log.error("Missing Supabase env vars");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Service role client — bypasses RLS to read integration configs across tenants
  const supabase = createServiceClient(supabaseUrl, serviceRoleKey) as unknown as SupabaseClient;

  // Fetch all tenants with an active Omie integration
  const { data: configs, error: configError } = await (supabase as never as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (c: string, v: string) => {
          eq: (c: string, v: boolean) => Promise<{ data: Array<{ tenant_id: string; settings: { app_key?: string; app_secret?: string } }> | null; error: unknown }>;
        };
      };
    };
  })
    .from("integration_configs")
    .select("tenant_id, settings")
    .eq("provider", "omie")
    .eq("is_active", true);

  if (configError || !configs?.length) {
    log.info("No active Omie integrations found");
    return NextResponse.json({ ok: true, message: "Nenhuma integração Omie ativa" });
  }

  const results: Array<{ tenantId: string; inserted: number; errors: string[] }> = [];

  for (const config of configs) {
    const tenantId = config.tenant_id;
    const appKey = config.settings?.app_key || process.env.OMIE_APP_KEY;
    const appSecret = config.settings?.app_secret || process.env.OMIE_APP_SECRET;

    if (!appKey || !appSecret) {
      log.warn("Skipping tenant — missing credentials", { tenantId });
      continue;
    }

    const creds: OmieCredentials = { app_key: appKey, app_secret: appSecret };

    // Create sync log entry
    const { data: logRow } = await (supabase as never as {
      from: (t: string) => {
        insert: (d: unknown) => {
          select: (s: string) => { single: () => Promise<{ data: { id: string } | null }> };
        };
      };
    })
      .from("omie_sync_log")
      .insert({
        tenant_id: tenantId,
        status: "running",
        trigger_source: triggerSource,
        started_at: startedAt,
        vendors_synced: 0,
        clients_synced: 0,
        bank_accounts_synced: 0,
        categories_synced: 0,
        payables_synced: 0,
        receivables_synced: 0,
        extrato_synced: 0,
        errors: [],
      } as never)
      .select("id")
      .single();

    const syncLogId = logRow?.id ?? null;

    try {
      const baLookup = await buildBankAccountLookup(supabase, tenantId);

      log.info("Extrato cron starting", { tenantId, bankAccounts: baLookup.size });

      const result = await syncExtratoBancario(
        supabase,
        tenantId,
        creds,
        baLookup,
        startTime,
        maxDuration
      );

      results.push({ tenantId, inserted: result.inserted, errors: result.errors });

      if (syncLogId) {
        await (supabase as never as {
          from: (t: string) => {
            update: (d: unknown) => { eq: (c: string, v: string) => Promise<unknown> };
          };
        })
          .from("omie_sync_log")
          .update({
            status: result.errors.length > 0 ? "partial" : "success",
            finished_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
            extrato_synced: result.inserted,
            errors: result.errors.map((e) => ({ entity: "extrato", message: e })),
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", syncLogId);
      }

      log.info("Extrato cron done", { tenantId, inserted: result.inserted, errors: result.errors.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error("Extrato cron error", { tenantId, message });

      if (syncLogId) {
        await (supabase as never as {
          from: (t: string) => {
            update: (d: unknown) => { eq: (c: string, v: string) => Promise<unknown> };
          };
        })
          .from("omie_sync_log")
          .update({
            status: "error",
            finished_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
            errors: [{ entity: "extrato", message }],
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", syncLogId);
      }

      results.push({ tenantId, inserted: 0, errors: [message] });
    }
  }

  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalErrors = results.flatMap((r) => r.errors);

  return NextResponse.json({
    ok: true,
    message: `Extrato sync: ${totalInserted} movimentos sincronizados`,
    tenants: results.length,
    inserted: totalInserted,
    errors: totalErrors.length > 0 ? totalErrors.slice(0, 10) : undefined,
  });
}
