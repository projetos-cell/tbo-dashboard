import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type SyncLogRow = Database["public"]["Tables"]["sync_logs"]["Row"];
type FirefliesSyncRow = Database["public"]["Tables"]["fireflies_sync_log"]["Row"];
type OmieSyncRow = Database["public"]["Tables"]["omie_sync_log"]["Row"];
type ReporteiSyncRow = Database["public"]["Tables"]["reportei_sync_runs"]["Row"];
type IntegrationConfigRow = Database["public"]["Tables"]["integration_configs"]["Row"];

export interface IntegrationStatus {
  provider: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
}

export interface RecentSyncError {
  id: string;
  provider: string;
  status: string | null;
  errorDetails: string | null;
  createdAt: string | null;
}

/** Get integration configs for the tenant */
export async function getIntegrationConfigs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<IntegrationConfigRow[]> {
  const { data, error } = await supabase
    .from("integration_configs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("provider", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get recent sync_logs (last 50) */
export async function getRecentSyncLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<SyncLogRow[]> {
  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

/** Get recent sync errors from sync_logs */
export async function getRecentSyncErrors(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<SyncLogRow[]> {
  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "error")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

/** Get the latest Fireflies sync log */
export async function getLatestFirefliesSync(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<FirefliesSyncRow | null> {
  const { data, error } = await supabase
    .from("fireflies_sync_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Get the latest Omie sync log */
export async function getLatestOmieSync(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<OmieSyncRow | null> {
  const { data, error } = await supabase
    .from("omie_sync_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Get the latest Reportei sync run */
export async function getLatestReporteiSync(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<ReporteiSyncRow | null> {
  const { data, error } = await supabase
    .from("reportei_sync_runs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Aggregate system health data */
export async function getSystemHealthSummary(
  supabase: SupabaseClient<Database>,
  tenantId: string
) {
  const [configs, errors, fireflies, omie, reportei, recentLogs] =
    await Promise.all([
      getIntegrationConfigs(supabase, tenantId),
      getRecentSyncErrors(supabase, tenantId),
      getLatestFirefliesSync(supabase, tenantId),
      getLatestOmieSync(supabase, tenantId),
      getLatestReporteiSync(supabase, tenantId),
      getRecentSyncLogs(supabase, tenantId),
    ]);

  const integrations: IntegrationStatus[] = configs.map((c) => ({
    provider: c.provider,
    isActive: c.is_active ?? false,
    lastSyncAt: c.last_sync_at,
    lastSyncStatus: c.last_sync_status,
    lastSyncError: c.last_sync_error,
  }));

  const totalSyncs = recentLogs.length;
  const errorCount = errors.length;
  const successCount = recentLogs.filter((l) => l.status === "success").length;

  return {
    integrations,
    errors,
    fireflies,
    omie,
    reportei,
    totalSyncs,
    errorCount,
    successRate: totalSyncs > 0 ? Math.round((successCount / totalSyncs) * 100) : 100,
  };
}
