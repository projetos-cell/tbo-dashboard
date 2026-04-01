import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RdSyncConfig {
  id: string;
  tenant_id: string;
  api_token: string | null;
  base_url: string;
  enabled: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface RdSyncLog {
  id: string;
  tenant_id: string;
  status: "running" | "success" | "partial" | "error";
  triggered_by: string | null;
  trigger_source: string | null;
  deals_synced: number;
  contacts_synced: number;
  organizations_synced: number;
  errors: string[] | null;
  created_at: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

export async function getRdConfig(
  supabase: SupabaseClient<Database>,
): Promise<RdSyncConfig | null> {
  const { data, error } = await supabase
    .from("rd_config" as never)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as RdSyncConfig | null;
}

export async function saveRdConfig(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  config: { api_token?: string; enabled?: boolean },
): Promise<RdSyncConfig> {
  const { data, error } = await supabase
    .from("rd_config" as never)
    .upsert(
      { tenant_id: tenantId, ...config, updated_at: new Date().toISOString() } as never,
      { onConflict: "tenant_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as unknown as RdSyncConfig;
}

// ── Sync Logs ────────────────────────────────────────────────────────────────

export async function getRdSyncLogs(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<RdSyncLog[]> {
  const { data, error } = await supabase
    .from("rd_sync_log" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as RdSyncLog[];
}

// ── Trigger sync ─────────────────────────────────────────────────────────────

export async function triggerRdSync(
  tenantId: string,
): Promise<{ success: boolean; deals_synced?: number; error?: string }> {
  const res = await fetch("/api/comercial/sync-rd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenant_id: tenantId }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return body;
}

// ── Test connection ──────────────────────────────────────────────────────────

export async function testRdConnection(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`https://crm.rdstation.com/api/v1/deal_pipelines?token=${token}&limit=1`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return { ok: true };
    if (res.status === 401 || res.status === 403) return { ok: false, error: "Token inválido ou sem permissão" };
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro de conexão" };
  }
}
