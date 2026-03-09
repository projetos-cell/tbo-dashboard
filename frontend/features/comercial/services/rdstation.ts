import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface RdSyncLog {
  id: string;
  tenant_id: string;
  status: "running" | "success" | "error";
  deals_synced: number;
  contacts_synced: number;
  organizations_synced: number;
  errors: unknown[];
  triggered_by: string | null;
  trigger_source: string;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

export interface RdConfig {
  id: string;
  tenant_id: string;
  api_token: string | null;
  base_url: string;
  enabled: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export async function getRdSyncLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  limit = 20,
) {
  const { data, error } = await supabase
    .from("rd_sync_log" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as RdSyncLog[];
}

export async function triggerRdSync(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("rd_sync_log" as never)
    .insert({ tenant_id: tenantId, status: "running", triggered_by: userId, trigger_source: "manual" } as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as RdSyncLog;
}

export async function getRdConfig(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("rd_config" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as RdConfig | null;
}

export async function saveRdConfig(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  config: { api_token?: string; enabled?: boolean; base_url?: string },
) {
  const { data, error } = await supabase
    .from("rd_config" as never)
    .upsert({ tenant_id: tenantId, ...config, updated_at: new Date().toISOString() } as never, { onConflict: "tenant_id" })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as RdConfig;
}
