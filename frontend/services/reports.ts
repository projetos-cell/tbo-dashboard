import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ReportScheduleRow = Database["public"]["Tables"]["report_schedules"]["Row"];
type ReportRunRow = Database["public"]["Tables"]["report_runs"]["Row"];

// ── Schedules ─────────────────────────────────────────────────

export async function listSchedules(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<ReportScheduleRow[]> {
  const { data, error } = await supabase
    .from("report_schedules")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as ReportScheduleRow[];
}

export async function createSchedule(
  supabase: SupabaseClient<Database>,
  schedule: Database["public"]["Tables"]["report_schedules"]["Insert"]
): Promise<ReportScheduleRow> {
  const { data, error } = await supabase
    .from("report_schedules")
    .insert(schedule as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReportScheduleRow;
}

export async function updateSchedule(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["report_schedules"]["Update"]
): Promise<ReportScheduleRow> {
  const { data, error } = await supabase
    .from("report_schedules")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReportScheduleRow;
}

export async function deleteSchedule(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("report_schedules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Runs ──────────────────────────────────────────────────────

export async function listRuns(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    scheduleId?: string;
    status?: string;
  }
): Promise<ReportRunRow[]> {
  let query = supabase
    .from("report_runs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("generated_at", { ascending: false });

  if (filters?.scheduleId) query = query.eq("schedule_id", filters.scheduleId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ReportRunRow[];
}

export async function getRunById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ReportRunRow | null> {
  const { data, error } = await supabase
    .from("report_runs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ReportRunRow;
}

// ── KPI helpers (client-side aggregation) ─────────────────────

export interface ReportsKPIs {
  totalSchedules: number;
  activeSchedules: number;
  thisMonthRuns: number;
  failedRuns: number;
}

export function computeReportsKPIs(
  schedules: ReportScheduleRow[],
  runs: ReportRunRow[]
): ReportsKPIs {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const activeSchedules = schedules.filter(
    (s) => s.enabled !== false
  ).length;

  const thisMonthRuns = runs.filter(
    (r) => r.generated_at && r.generated_at >= monthStart
  ).length;

  const failedRuns = runs.filter((r) => r.status === "failed").length;

  return {
    totalSchedules: schedules.length,
    activeSchedules,
    thisMonthRuns,
    failedRuns,
  };
}
