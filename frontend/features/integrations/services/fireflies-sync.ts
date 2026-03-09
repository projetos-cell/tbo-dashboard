import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface FirefliesSyncLog {
  id: string;
  tenant_id: string;
  status: "running" | "success" | "error";
  meetings_synced: number;
  transcripts_synced: number;
  errors: unknown[];
  triggered_by: string | null;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

export interface FirefliesConfig {
  id: string;
  tenant_id: string;
  api_key: string | null;
  enabled: boolean;
  auto_sync: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export async function getFirefliesSyncLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  limit = 20,
) {
  const { data, error } = await supabase
    .from("fireflies_sync_log" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as FirefliesSyncLog[];
}

export async function triggerFirefliesSync(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("fireflies_sync_log" as never)
    .insert({ tenant_id: tenantId, status: "running", triggered_by: userId } as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as FirefliesSyncLog;
}

export async function getFirefliesConfig(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("fireflies_config" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as FirefliesConfig | null;
}

export async function saveFirefliesConfig(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  config: { api_key?: string; enabled?: boolean; auto_sync?: boolean },
) {
  const { data, error } = await supabase
    .from("fireflies_config" as never)
    .upsert({ tenant_id: tenantId, ...config, updated_at: new Date().toISOString() } as never, { onConflict: "tenant_id" })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as FirefliesConfig;
}
