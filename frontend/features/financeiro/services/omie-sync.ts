import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OmieSyncLog {
  id: string;
  tenant_id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "partial" | "error";
  current_phase: string | null;
  vendors_synced: number;
  clients_synced: number;
  payables_synced: number;
  receivables_synced: number;
  categories_synced: number;
  bank_accounts_synced: number;
  extrato_synced: number;
  duration_ms: number | null;
  trigger_source: "manual" | "cron" | "webhook";
  errors: { entity: string; message: string }[];
  triggered_by: string | null;
}

export interface OmieSyncResult {
  message: string;
  results?: Record<string, unknown>;
  duration_ms?: number;
  error?: string;
}

export interface OmieTestResult {
  ok: boolean;
  message?: string;
  total?: number;
  error?: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** Trigger a manual Omie sync */
export async function triggerOmieSync(): Promise<OmieSyncResult> {
  const res = await fetch("/api/finance/sync-omie", { method: "POST" });
  return res.json();
}

/** Test Omie API connection */
export async function testOmieConnection(): Promise<OmieTestResult> {
  const res = await fetch("/api/omie-sync/test");
  return res.json();
}

// ── Supabase queries ─────────────────────────────────────────────────────────

/** Get recent Omie sync logs (last 20) */
export async function getOmieSyncLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<OmieSyncLog[]> {
  const { data, error } = await supabase
    .from("omie_sync_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as OmieSyncLog[];
}

/** Get the latest Omie sync log */
export async function getLatestOmieSync(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<OmieSyncLog | null> {
  const { data, error } = await supabase
    .from("omie_sync_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as OmieSyncLog | null;
}

/** Check if a sync log is stale (running for more than 5 minutes) */
export function isStaleSyncLog(log: OmieSyncLog | null): boolean {
  if (!log || log.status !== "running") return false;
  const threshold = 5 * 60 * 1000; // 5 minutes
  const elapsed = Date.now() - new Date(log.started_at).getTime();
  return elapsed > threshold;
}
