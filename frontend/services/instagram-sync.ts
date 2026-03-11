import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/* ── Trigger sync ─────────────────────────────────────────────────────────── */

export async function triggerInstagramSync(tenantId: string, days = 7) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) throw new Error("Not authenticated");

  const res = await fetch("/api/instagram/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tenant_id: tenantId, days }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Sync failed" }));
    throw new Error(err.error ?? `Sync failed (${res.status})`);
  }

  return res.json();
}

/* ── Instagram config (integration_configs) ───────────────────────────────── */

export interface InstagramConfig {
  access_token: string;
  ig_user_id: string;
  app_id?: string;
  app_secret?: string;
}

export async function getInstagramConfig(
  tenantId: string
): Promise<InstagramConfig | null> {
  const { data } = await supabase
    .from("integration_configs")
    .select("settings")
    .eq("tenant_id", tenantId)
    .eq("provider", "instagram")
    .single();

  if (!data?.settings) return null;
  const s = data.settings as Record<string, unknown>;
  return {
    access_token: (s.access_token as string) ?? "",
    ig_user_id: (s.ig_user_id as string) ?? "",
    app_id: (s.app_id as string) ?? "",
    app_secret: (s.app_secret as string) ?? "",
  };
}

export async function saveInstagramConfig(
  tenantId: string,
  config: InstagramConfig
) {
  const { error } = await supabase.from("integration_configs").upsert(
    {
      tenant_id: tenantId,
      provider: "instagram",
      is_active: true,
      settings: {
        access_token: config.access_token,
        ig_user_id: config.ig_user_id,
        app_id: config.app_id ?? "",
        app_secret: config.app_secret ?? "",
      },
    } as never,
    { onConflict: "tenant_id,provider" }
  );

  if (error) throw new Error(error.message);
}

/* ── Last sync status ─────────────────────────────────────────────────────── */

export interface SyncRun {
  id: string;
  status: string;
  accounts_synced: number | null;
  metrics_upserted: number | null;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
}

export async function getLastSyncRun(
  tenantId: string
): Promise<SyncRun | null> {
  const { data } = await supabase
    .from("reportei_sync_runs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data as SyncRun | null;
}
