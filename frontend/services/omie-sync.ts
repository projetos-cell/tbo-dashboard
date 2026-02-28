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

export async function triggerOmieSync(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string
): Promise<OmieSyncLog> {
  const { data, error } = await supabase
    .from("omie_sync_log" as never)
    .insert({
      tenant_id: tenantId,
      status: "running",
      triggered_by: userId,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as OmieSyncLog;
}
