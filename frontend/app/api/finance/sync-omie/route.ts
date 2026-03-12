import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OmieCredentials, SyncLogError } from "./_shared";
import { INTER_PHASE_DELAY_MS, sleep, hasTimeRemaining, updateSyncProgress } from "./_shared";
import { syncVendors, syncClients, syncBankAccounts, syncCategories, syncCostCenters } from "./_sync-entities";
import {
  buildCategoryLookup,
  buildCostCenterLookup,
  buildCostCenterInfoLookup,
  buildBankAccountLookup,
  buildClientNameLookup,
} from "./_lookups";
import { syncContasPagar, syncContasReceber } from "./_sync-transactions";
import { syncExtratoBancario } from "./_sync-extrato";
import { createSyncLogger } from "./_logger";

const log = createSyncLogger("sync-omie");

// Allow up to 5 minutes for full historical sync on Vercel
export const maxDuration = 300;

// ── POST /api/finance/sync-omie ───────────────────────────────────────────────

export async function POST() {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  let vendorsSynced = 0;
  let clientsSynced = 0;
  let bankAccountsSynced = 0;
  let categoriesSynced = 0;
  let payablesSynced = 0;
  let receivablesSynced = 0;
  let extratoSynced = 0;
  const syncErrors: SyncLogError[] = [];

  let syncLogId: string | null = null;
  let responsePayload: Record<string, unknown> = {};
  let responseStatus = 200;

  const supabase = await createClient();

  try {
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

    // Fetch Omie credentials
    const { data: config } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => { eq: (c: string, v: boolean) => { maybeSingle: () => Promise<{ data: { settings: { app_key?: string; app_secret?: string } } | null }> } } } } } })
      .from("integration_configs")
      .select("settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "omie")
      .eq("is_active", true)
      .maybeSingle();

    const appKey = config?.settings?.app_key || process.env.OMIE_APP_KEY;
    const appSecret = config?.settings?.app_secret || process.env.OMIE_APP_SECRET;

    if (!appKey || !appSecret) {
      return NextResponse.json(
        { ok: false, error: "Credenciais Omie nao configuradas" },
        { status: 400 }
      );
    }

    const creds: OmieCredentials = { app_key: appKey, app_secret: appSecret };

    // INSERT sync log with status 'running'
    const { data: logRow } = await (supabase as never as { from: (t: string) => { insert: (d: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null }> } } } })
      .from("omie_sync_log")
      .insert({
        tenant_id: tenantId,
        status: "running",
        trigger_source: "manual",
        triggered_by: user.id,
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

    syncLogId = (logRow as { id: string } | null)?.id ?? null;

    log.info("Starting full sync", { tenantId });

    // ── Phase 0: Vendors + Clients ──────────────────────────────────────────
    log.info("Phase 0a: Vendors");
    const vendorResult = await syncVendors(supabase, tenantId, creds);
    vendorsSynced = vendorResult.inserted;
    vendorResult.errors.forEach((e) => syncErrors.push({ entity: "vendors", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      vendors_synced: vendorsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    log.info("Phase 0b: Clients");
    const clientResult = await syncClients(supabase, tenantId, creds);
    clientsSynced = clientResult.inserted;
    clientResult.errors.forEach((e) => syncErrors.push({ entity: "clients", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      clients_synced: clientsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 1: Categories ─────────────────────────────────────────────────
    log.info("Phase 1: Categories");
    const catResult = await syncCategories(supabase, tenantId, creds);
    categoriesSynced = catResult.inserted;
    catResult.errors.forEach((e) => syncErrors.push({ entity: "categories", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      categories_synced: categoriesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 2: Cost Centers ───────────────────────────────────────────────
    log.info("Phase 2: Cost Centers");
    const ccResult = await syncCostCenters(supabase, tenantId, creds);
    ccResult.errors.forEach((e) => syncErrors.push({ entity: "cost_centers", message: e }));
    await updateSyncProgress(supabase, syncLogId, { errors: syncErrors });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 3: Bank Accounts ──────────────────────────────────────────────
    log.info("Phase 3: Bank Accounts");
    const baResult = await syncBankAccounts(supabase, tenantId, creds);
    bankAccountsSynced = baResult.inserted;
    baResult.errors.forEach((e) => syncErrors.push({ entity: "bank_accounts", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      bank_accounts_synced: bankAccountsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Build lookup maps ───────────────────────────────────────────────────
    log.info("Building lookup maps");
    const catLookup = await buildCategoryLookup(supabase, tenantId);
    const ccLookup = await buildCostCenterLookup(supabase, tenantId);
    const ccInfoLookup = await buildCostCenterInfoLookup(supabase, tenantId);
    const baLookup = await buildBankAccountLookup(supabase, tenantId);
    const clientNameMap = await buildClientNameLookup(supabase, tenantId);
    log.info("Lookups built", { categories: catLookup.size, costCenters: ccLookup.size, bankAccounts: baLookup.size, clients: clientNameMap.size });

    // ── Phase 4: Contas a Pagar ─────────────────────────────────────────────
    log.info("Phase 4: Contas a Pagar");
    const cpResult = await syncContasPagar(
      supabase, tenantId, creds, user.id,
      catLookup, ccLookup, ccInfoLookup, baLookup, startTime, maxDuration
    );
    payablesSynced = cpResult.inserted;
    cpResult.errors.forEach((e) => syncErrors.push({ entity: "payables", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      payables_synced: payablesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 5: Contas a Receber ───────────────────────────────────────────
    log.info("Phase 5: Contas a Receber");
    const crResult = await syncContasReceber(
      supabase, tenantId, creds, user.id,
      catLookup, ccLookup, ccInfoLookup, baLookup, clientNameMap, startTime, maxDuration
    );
    receivablesSynced = crResult.inserted;
    crResult.errors.forEach((e) => syncErrors.push({ entity: "receivables", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      receivables_synced: receivablesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 6: Extrato Bancário ───────────────────────────────────────────
    // Extrato runs as a separate cron job (/api/finance/sync-extrato).
    // If time allows, run it opportunistically; skipping is NOT an error.
    if (hasTimeRemaining(startTime, maxDuration)) {
      log.info("Phase 6: Extrato Bancario (opportunistic)");
      const extResult = await syncExtratoBancario(
        supabase, tenantId, creds, baLookup, startTime, maxDuration
      );
      extratoSynced = extResult.inserted;
      extResult.errors.forEach((e) => syncErrors.push({ entity: "extrato", message: e }));
      await updateSyncProgress(supabase, syncLogId, {
        extrato_synced: extratoSynced,
        errors: syncErrors,
      });
    } else {
      log.info("Phase 6: Extrato skipped (will run via cron)");
    }

    const totalInserted =
      vendorsSynced + clientsSynced + bankAccountsSynced +
      categoriesSynced + ccResult.inserted + payablesSynced +
      receivablesSynced + extratoSynced;

    log.info("Sync complete", { totalUpserted: totalInserted, errors: syncErrors.length });

    responsePayload = {
      ok: true,
      message: `Sync concluido: ${totalInserted} registros sincronizados`,
      totals: {
        vendors: vendorsSynced,
        clients: clientsSynced,
        bankAccounts: bankAccountsSynced,
        categories: categoriesSynced,
        costCenters: ccResult.inserted,
        payables: payablesSynced,
        receivables: receivablesSynced,
        extrato: extratoSynced,
      },
      errors: syncErrors.length > 0 ? syncErrors.slice(0, 20) : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    log.error("Sync handler error", { message });
    syncErrors.push({ entity: "handler", message });
    responsePayload = { ok: false, error: message };
    responseStatus = 500;
  } finally {
    if (syncLogId) {
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - new Date(startedAt).getTime();

      await updateSyncProgress(supabase, syncLogId, {
        status:
          responseStatus >= 500
            ? "error"
            : syncErrors.length > 0
            ? "partial"
            : "success",
        finished_at: finishedAt,
        duration_ms: durationMs,
        vendors_synced: vendorsSynced,
        clients_synced: clientsSynced,
        bank_accounts_synced: bankAccountsSynced,
        categories_synced: categoriesSynced,
        payables_synced: payablesSynced,
        receivables_synced: receivablesSynced,
        extrato_synced: extratoSynced,
        errors: syncErrors,
      });
    }
  }

  return NextResponse.json(responsePayload, { status: responseStatus });
}
