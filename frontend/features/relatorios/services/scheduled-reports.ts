import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReportFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";
export type ReportType = "projects" | "finance" | "commercial" | "people" | "custom";
export type ReportFormat = "pdf" | "csv" | "xlsx";

export interface ScheduledReport {
  id: string;
  tenant_id: string;
  created_by: string;
  name: string;
  report_type: ReportType;
  frequency: ReportFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  recipients: string[];
  filters: Record<string, unknown>;
  template: string;
  format: ReportFormat;
  is_active: boolean;
  last_sent_at: string | null;
  next_send_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledReportInput {
  tenant_id: string;
  created_by: string;
  name: string;
  report_type: ReportType;
  frequency: ReportFrequency;
  day_of_week?: number;
  day_of_month?: number;
  recipients: string[];
  filters?: Record<string, unknown>;
  template?: string;
  format?: ReportFormat;
  is_active?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Computes the next send timestamp based on frequency and optional day parameters.
 */
export function computeNextSendAt(
  frequency: ReportFrequency,
  dayOfWeek?: number,
  dayOfMonth?: number
): string {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case "daily": {
      // Next day at 7:00 AM
      next.setDate(now.getDate() + 1);
      next.setHours(7, 0, 0, 0);
      break;
    }

    case "weekly": {
      // Next occurrence of dayOfWeek (0=Sunday..6=Saturday), defaults to Monday
      const targetDay = dayOfWeek ?? 1;
      const currentDay = now.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      next.setDate(now.getDate() + daysUntil);
      next.setHours(7, 0, 0, 0);
      break;
    }

    case "biweekly": {
      const targetDay = dayOfWeek ?? 1;
      const currentDay = now.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      next.setDate(now.getDate() + daysUntil + 7);
      next.setHours(7, 0, 0, 0);
      break;
    }

    case "monthly": {
      // Next occurrence of dayOfMonth, defaults to 1st
      const targetDom = dayOfMonth ?? 1;
      next.setDate(1);
      next.setMonth(now.getMonth() + 1);
      next.setDate(Math.min(targetDom, daysInMonth(next.getFullYear(), next.getMonth())));
      next.setHours(7, 0, 0, 0);
      break;
    }

    case "quarterly": {
      // First day of next quarter at 7 AM
      const currentMonth = now.getMonth(); // 0-indexed
      const currentQuarterStart = Math.floor(currentMonth / 3) * 3;
      const nextQuarterStartMonth = currentQuarterStart + 3;
      if (nextQuarterStartMonth >= 12) {
        next.setFullYear(now.getFullYear() + 1, 0, 1);
      } else {
        next.setFullYear(now.getFullYear(), nextQuarterStartMonth, 1);
      }
      next.setHours(7, 0, 0, 0);
      break;
    }
  }

  return next.toISOString();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getScheduledReports(
  supabase: SupabaseClient<Database>
): Promise<ScheduledReport[]> {
  const { data, error } = await supabase
    .from("scheduled_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ScheduledReport[];
}

export async function createScheduledReport(
  supabase: SupabaseClient<Database>,
  report: CreateScheduledReportInput
): Promise<ScheduledReport> {
  const nextSendAt = computeNextSendAt(
    report.frequency,
    report.day_of_week,
    report.day_of_month
  );

  const { data, error } = await supabase
    .from("scheduled_reports")
    .insert({
      tenant_id: report.tenant_id,
      created_by: report.created_by,
      name: report.name,
      report_type: report.report_type,
      frequency: report.frequency,
      day_of_week: report.day_of_week ?? null,
      day_of_month: report.day_of_month ?? null,
      recipients: report.recipients,
      filters: report.filters ?? {},
      template: report.template ?? "default",
      format: report.format ?? "pdf",
      is_active: report.is_active ?? true,
      next_send_at: nextSendAt,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ScheduledReport;
}

export async function updateScheduledReport(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<Omit<ScheduledReport, "id" | "tenant_id" | "created_by" | "created_at" | "updated_at">>
): Promise<ScheduledReport> {
  // Recompute next_send_at if frequency or day changed
  const needsRecompute =
    updates.frequency || updates.day_of_week !== undefined || updates.day_of_month !== undefined;

  let nextSendAt: string | undefined;
  if (needsRecompute) {
    const { data: existing } = await supabase
      .from("scheduled_reports")
      .select("frequency, day_of_week, day_of_month")
      .eq("id", id)
      .single();

    const freq = (updates.frequency ?? existing?.frequency ?? "weekly") as ReportFrequency;
    const dow = updates.day_of_week ?? existing?.day_of_week ?? undefined;
    const dom = updates.day_of_month ?? existing?.day_of_month ?? undefined;
    nextSendAt = computeNextSendAt(freq, dow ?? undefined, dom ?? undefined);
  }

  const { data, error } = await supabase
    .from("scheduled_reports")
    .update({
      ...updates,
      ...(nextSendAt ? { next_send_at: nextSendAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ScheduledReport;
}

export async function deleteScheduledReport(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("scheduled_reports")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleReportActive(
  supabase: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<ScheduledReport> {
  const { data, error } = await supabase
    .from("scheduled_reports")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ScheduledReport;
}
