import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface DndSettings {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface AwaySettings {
  timeoutMinutes: number; // 5, 10, 15, 30
}

export const AWAY_TIMEOUT_OPTIONS = [
  { label: "5 minutos", value: 5 },
  { label: "10 minutos", value: 10 },
  { label: "15 minutos", value: 15 },
  { label: "30 minutos", value: 30 },
] as const;

// ── DND ──────────────────────────────────────────────────────────

export async function getDndSettings(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DndSettings> {
  const { data, error } = await supabase
    .from("profiles")
    .select("dnd_enabled, dnd_start_time, dnd_end_time")
    .eq("id", userId)
    .single();

  if (error) throw error;
  const row = data as unknown as {
    dnd_enabled: boolean | null;
    dnd_start_time: string | null;
    dnd_end_time: string | null;
  };

  return {
    enabled: row.dnd_enabled ?? false,
    startTime: row.dnd_start_time?.slice(0, 5) ?? "22:00",
    endTime: row.dnd_end_time?.slice(0, 5) ?? "08:00",
  };
}

export async function setDndSettings(
  supabase: SupabaseClient<Database>,
  userId: string,
  settings: DndSettings,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      dnd_enabled: settings.enabled,
      dnd_start_time: settings.startTime,
      dnd_end_time: settings.endTime,
    } as never)
    .eq("id", userId);

  if (error) throw error;
}

/** Client-side check — mirrors DB function logic for instant feedback */
export function isDndActiveNow(settings: DndSettings): boolean {
  if (!settings.enabled) return false;

  const now = new Date();
  const [startH, startM] = settings.startTime.split(":").map(Number);
  const [endH, endM] = settings.endTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + (startM ?? 0);
  const endMinutes = endH * 60 + (endM ?? 0);

  if (startMinutes > endMinutes) {
    // Overnight: e.g., 22:00 - 08:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same-day: e.g., 12:00 - 14:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

// ── Away ─────────────────────────────────────────────────────────

export async function getAwaySettings(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AwaySettings> {
  const { data, error } = await supabase
    .from("profiles")
    .select("away_timeout_minutes")
    .eq("id", userId)
    .single();

  if (error) throw error;
  const row = data as unknown as { away_timeout_minutes: number | null };

  return { timeoutMinutes: row.away_timeout_minutes ?? 10 };
}

export async function setAwaySettings(
  supabase: SupabaseClient<Database>,
  userId: string,
  settings: AwaySettings,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ away_timeout_minutes: settings.timeoutMinutes } as never)
    .eq("id", userId);

  if (error) throw error;
}

// ── Last Seen ─────────────────────────────────────────────────────

export interface LastSeenInfo {
  userId: string;
  lastSeenAt: string | null;
}

export async function getLastSeen(
  supabase: SupabaseClient<Database>,
  userIds: string[],
): Promise<LastSeenInfo[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, last_seen_at")
    .in("id", userIds);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as { id: string; last_seen_at: string | null };
    return { userId: r.id, lastSeenAt: r.last_seen_at };
  });
}

export async function updateLastSeen(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  const { error } = await supabase.rpc("update_last_seen" as never);
  if (error) throw error;
}

/** Format last seen timestamp for display */
export function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "Nunca visto";

  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
