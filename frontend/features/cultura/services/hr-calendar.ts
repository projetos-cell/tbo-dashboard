import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ──────────────────────────────────────────────────────────────

export type HrEventCategory =
  | "feriado"
  | "ciclo_gestao"
  | "treinamento"
  | "evento"
  | "recesso"
  | "data_comemorativa";

export type HrDisplayCategory = HrEventCategory | "aniversario" | "aniversario_empresa";

export interface HrCalendarItem {
  id: string;
  title: string;
  description: string | null;
  category: HrDisplayCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  isAllDay: boolean;
  color: { bg: string; text: string };
  isComputed: boolean;
  avatarUrl?: string | null;
  recurrenceRule?: string | null;
  visibility?: string;
  profileId?: string;
}

export interface BirthdayEntry {
  id: string;
  fullName: string;
  birthDate: string;
  avatarUrl: string | null;
}

export interface AnniversaryEntry {
  id: string;
  fullName: string;
  startDate: string;
  avatarUrl: string | null;
}

// ── Category Colors ────────────────────────────────────────────────────

export const HR_CATEGORY_COLORS: Record<HrDisplayCategory, { bg: string; text: string; label: string }> = {
  feriado:             { bg: "rgba(220,38,38,0.12)",  text: "#dc2626", label: "Feriado" },
  ciclo_gestao:        { bg: "rgba(37,99,235,0.12)",  text: "#2563eb", label: "Ciclo de Gestão" },
  treinamento:         { bg: "rgba(124,58,237,0.12)", text: "#7c3aed", label: "Treinamento" },
  evento:              { bg: "rgba(234,88,12,0.12)",  text: "#ea580c", label: "Evento" },
  recesso:             { bg: "rgba(185,28,28,0.12)",  text: "#b91c1c", label: "Recesso" },
  data_comemorativa:   { bg: "rgba(194,65,12,0.12)",  text: "#c2410c", label: "Data Comemorativa" },
  aniversario:         { bg: "rgba(202,138,4,0.12)",  text: "#ca8a04", label: "Aniversário" },
  aniversario_empresa: { bg: "rgba(22,163,74,0.12)",  text: "#16a34a", label: "Aniv. de Empresa" },
};

// ── CRUD ───────────────────────────────────────────────────────────────

type HrEventRow = Database["public"]["Tables"]["hr_calendar_events"]["Row"];
type HrEventInsert = Database["public"]["Tables"]["hr_calendar_events"]["Insert"];
type HrEventUpdate = Database["public"]["Tables"]["hr_calendar_events"]["Update"];

export type { HrEventInsert, HrEventUpdate };

function toCalendarItem(row: HrEventRow): HrCalendarItem {
  const cat = row.category as HrEventCategory;
  const colors = HR_CATEGORY_COLORS[cat];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: cat,
    startDate: row.start_date,
    endDate: row.end_date,
    isAllDay: row.is_all_day ?? true,
    color: row.color
      ? { bg: `${row.color}1f`, text: row.color }
      : { bg: colors.bg, text: colors.text },
    isComputed: false,
    recurrenceRule: row.recurrence_rule,
    visibility: row.visibility ?? "all",
  };
}

export async function getHrCalendarEvents(
  supabase: SupabaseClient<Database>,
  startDate: string,
  endDate: string,
): Promise<HrCalendarItem[]> {
  const { data, error } = await supabase
    .from("hr_calendar_events")
    .select()
    .gte("start_date", startDate)
    .lte("start_date", endDate)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as HrEventRow[]).map(toCalendarItem);
}

export async function createHrCalendarEvent(
  supabase: SupabaseClient<Database>,
  event: HrEventInsert,
): Promise<HrCalendarItem> {
  const { data, error } = await supabase
    .from("hr_calendar_events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return toCalendarItem(data as HrEventRow);
}

export async function updateHrCalendarEvent(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: HrEventUpdate,
): Promise<HrCalendarItem> {
  const { data, error } = await supabase
    .from("hr_calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toCalendarItem(data as HrEventRow);
}

export async function deleteHrCalendarEvent(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("hr_calendar_events")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── Computed: Birthdays & Anniversaries ────────────────────────────────

export async function getActiveProfiles(
  supabase: SupabaseClient<Database>,
): Promise<Array<{ id: string; full_name: string | null; birth_date: string | null; start_date: string | null; avatar_url: string | null }>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, birth_date, start_date, avatar_url")
    .eq("is_active", true);

  if (error) throw error;
  return (data ?? []) as Array<{ id: string; full_name: string | null; birth_date: string | null; start_date: string | null; avatar_url: string | null }>;
}

export function filterBirthdaysByMonth(
  profiles: Array<{ id: string; full_name: string | null; birth_date: string | null; avatar_url: string | null }>,
  months: number[],
): BirthdayEntry[] {
  return profiles
    .filter((p) => {
      if (!p.birth_date) return false;
      const m = new Date(p.birth_date + "T12:00:00").getMonth() + 1;
      return months.includes(m);
    })
    .map((p) => ({
      id: p.id,
      fullName: p.full_name ?? "Sem nome",
      birthDate: p.birth_date!,
      avatarUrl: p.avatar_url,
    }));
}

export function filterAnniversariesByMonth(
  profiles: Array<{ id: string; full_name: string | null; start_date: string | null; avatar_url: string | null }>,
  months: number[],
): AnniversaryEntry[] {
  return profiles
    .filter((p) => {
      if (!p.start_date) return false;
      const m = new Date(p.start_date + "T12:00:00").getMonth() + 1;
      return months.includes(m);
    })
    .map((p) => ({
      id: p.id,
      fullName: p.full_name ?? "Sem nome",
      startDate: p.start_date!,
      avatarUrl: p.avatar_url,
    }));
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Project a date string (YYYY-MM-DD) to a target year, keeping month/day */
export function projectToYear(dateStr: string, year: number): string {
  return `${year}-${dateStr.slice(5)}`;
}
