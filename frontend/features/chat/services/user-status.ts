import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface UserStatus {
  emoji: string | null;
  text: string | null;
  expiresAt: string | null;
}

export const STATUS_EXPIRY_OPTIONS = [
  { label: "Não expirar", value: null },
  { label: "30 minutos", minutes: 30 },
  { label: "1 hora", minutes: 60 },
  { label: "4 horas", minutes: 240 },
  { label: "Hoje", label2: "Fim do dia" },
  { label: "Esta semana", label2: "Fim da semana" },
] as const;

export const SUGGESTED_STATUSES: { emoji: string; text: string }[] = [
  { emoji: "💬", text: "Disponível" },
  { emoji: "🎧", text: "Com foco" },
  { emoji: "📅", text: "Em reunião" },
  { emoji: "🏠", text: "Trabalhando de casa" },
  { emoji: "🚀", text: "No ar" },
  { emoji: "🌴", text: "De férias" },
  { emoji: "🤒", text: "Doente" },
  { emoji: "✈️", text: "Viajando" },
];

export async function getUserStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("status_emoji, status_text, status_expires_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const row = data as unknown as { status_emoji: string | null; status_text: string | null; status_expires_at: string | null };

  // Auto-clear if expired
  if (row.status_expires_at && new Date(row.status_expires_at) < new Date()) {
    return { emoji: null, text: null, expiresAt: null };
  }

  return {
    emoji: row.status_emoji,
    text: row.status_text,
    expiresAt: row.status_expires_at,
  };
}

export async function setUserStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
  status: UserStatus,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      status_emoji: status.emoji,
      status_text: status.text,
      status_expires_at: status.expiresAt,
    } as never)
    .eq("id", userId);
  if (error) throw error;
}

export async function clearUserStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      status_emoji: null,
      status_text: null,
      status_expires_at: null,
    } as never)
    .eq("id", userId);
  if (error) throw error;
}
