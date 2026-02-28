import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  location: string | null;
  organizer: string | null;
  googleEventId: string | null;
  source: string;
}

function toCalendarEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    isAllDay: row.is_all_day,
    location: row.location,
    organizer: row.organizer,
    googleEventId: row.google_event_id,
    source: row.source,
  };
}

export async function getCalendarEvents(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select()
    .eq("tenant_id", tenantId)
    .gte("start_at", timeMin)
    .lte("start_at", timeMax)
    .order("start_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as EventRow[]).map(toCalendarEvent);
}

export async function createCalendarEvent(
  supabase: SupabaseClient<Database>,
  event: Database["public"]["Tables"]["calendar_events"]["Insert"]
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(event as never)
    .select()
    .single();

  if (error) throw error;
  return toCalendarEvent(data as unknown as EventRow);
}

export async function deleteCalendarEvent(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// Helpers for date range calculations
export function getMonthRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function getWeekRange(date: Date): { start: string; end: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}
