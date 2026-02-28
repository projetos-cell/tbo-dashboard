import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];
type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
type MeetingUpdate = Database["public"]["Tables"]["meetings"]["Update"];
type ParticipantRow = Database["public"]["Tables"]["meeting_participants"]["Row"];
type TranscriptionRow = Database["public"]["Tables"]["meeting_transcriptions"]["Row"];

const FULL_COLS = "*";

// ─── Meetings CRUD ───────────────────────────────────────────────────

export async function getMeetings(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<MeetingRow[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMeetingById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<MeetingRow | null> {
  const { data, error } = await supabase
    .from("meetings")
    .select(FULL_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createMeeting(
  supabase: SupabaseClient<Database>,
  meeting: MeetingInsert
): Promise<MeetingRow> {
  const { data, error } = await supabase
    .from("meetings")
    .insert(meeting as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeeting(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: MeetingUpdate
): Promise<MeetingRow> {
  const { data, error } = await supabase
    .from("meetings")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeeting(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) throw error;
}

// ─── Meeting Participants ────────────────────────────────────────────

export async function getMeetingParticipants(
  supabase: SupabaseClient<Database>,
  meetingId: string
): Promise<ParticipantRow[]> {
  const { data, error } = await supabase
    .from("meeting_participants")
    .select(FULL_COLS)
    .eq("meeting_id", meetingId)
    .order("display_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Meeting Transcription ───────────────────────────────────────────

export async function getMeetingTranscription(
  supabase: SupabaseClient<Database>,
  meetingId: string
): Promise<TranscriptionRow[]> {
  const { data, error } = await supabase
    .from("meeting_transcriptions")
    .select(FULL_COLS)
    .eq("meeting_id", meetingId)
    .order("raw_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── KPI computation (pure, no Supabase needed) ─────────────────────

export interface MeetingKPIs {
  total: number;
  thisWeek: number;
  withTranscription: number;
  avgDuration: number;
}

export function computeMeetingKPIs(
  meetings: MeetingRow[],
  transcriptionCounts: Record<string, number>
): MeetingKPIs {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weekStart = startOfWeek.toISOString().split("T")[0];
  const weekEnd = endOfWeek.toISOString().split("T")[0];

  const thisWeek = meetings.filter((m) => {
    if (!m.date) return false;
    return m.date >= weekStart && m.date <= weekEnd;
  }).length;

  const withTranscription = meetings.filter(
    (m) => (transcriptionCounts[m.id] ?? 0) > 0
  ).length;

  const durationsValid = meetings.filter(
    (m) => m.duration_minutes != null && m.duration_minutes > 0
  );
  const avgDuration =
    durationsValid.length > 0
      ? Math.round(
          durationsValid.reduce((sum, m) => sum + (m.duration_minutes ?? 0), 0) /
            durationsValid.length
        )
      : 0;

  return {
    total: meetings.length,
    thisWeek,
    withTranscription,
    avgDuration,
  };
}
