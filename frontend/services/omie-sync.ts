import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────

export interface OmieSyncLog {
  id: string;
  tenant_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  vendors_synced: number;
  clients_synced: number;
  payables_synced: number;
  receivables_synced: number;
  errors: unknown[];
  triggered_by: string | null;
}

export interface OmieSyncResult {
  vendors_synced: number;
  clients_synced: number;
  payables_synced: number;
  receivables_synced: number;
  total: number;
  errors: number;
  duration_ms: number;
  status: string;
}

// ── Test connection via API route ────────────────────────────

export interface OmieTestResult {
  ok: boolean;
  total?: number;
  error?: string;
}

export async function testOmieConnection(): Promise<OmieTestResult> {
  const res = await fetch("/api/omie-sync/test");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Falha ao testar conexao");
  }
  return data as OmieTestResult;
}

// ── Trigger sync via API route ───────────────────────────────

export async function triggerSync(): Promise<OmieSyncResult> {
  const res = await fetch("/api/omie-sync", { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Erro ao sincronizar");
  }
  return data as OmieSyncResult;
}

// ── Queries ──────────────────────────────────────────────────

export async function getOmieSyncLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<OmieSyncLog[]> {
  const { data, error } = await supabase
    .from("omie_sync_log" as never)
    .select("*")
    .eq("tenant_id" as never, tenantId as never)
    .order("started_at" as never, { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as unknown as OmieSyncLog[];
}

// ── Stale sync cleanup ─────────────────────────────────────
// Marks syncs stuck in "running" for more than 30 min as "error"

export async function cleanupStaleSyncs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<void> {
  await supabase
    .from("omie_sync_log" as never)
    .update({
      status: "error",
      finished_at: new Date().toISOString(),
      errors: [{ entity: "sync", message: "Sync travado — timeout de 30 minutos excedido" }],
    } as never)
    .eq("tenant_id" as never, tenantId as never)
    .eq("status" as never, "running" as never)
    .lt("started_at" as never, new Date(Date.now() - 30 * 60 * 1000).toISOString() as never);
}

// ── Last successful sync info ───────────────────────────────

export async function getLastSuccessfulSync(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<OmieSyncLog | null> {
  const { data } = await supabase
    .from("omie_sync_log" as never)
    .select("*")
    .eq("tenant_id" as never, tenantId as never)
    .in("status" as never, ["success", "partial"] as never)
    .order("started_at" as never, { ascending: false })
    .limit(1)
    .single();
  return (data as unknown as OmieSyncLog) ?? null;
}
