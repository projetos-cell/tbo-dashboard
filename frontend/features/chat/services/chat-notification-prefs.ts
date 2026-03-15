import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type NotifSetting = "all" | "mentions" | "nothing";

const TABLE = "chat_notification_prefs" as never;

export async function getNotificationPref(
  supabase: SupabaseClient<Database>,
  userId: string,
  channelId: string,
): Promise<NotifSetting> {
  const { data } = await supabase
    .from(TABLE)
    .select("setting")
    .eq("user_id" as never, userId)
    .eq("channel_id" as never, channelId)
    .single();
  return ((data as { setting: string } | null)?.setting as NotifSetting) ?? "all";
}

export async function setNotificationPref(
  supabase: SupabaseClient<Database>,
  userId: string,
  channelId: string,
  setting: NotifSetting,
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    { user_id: userId, channel_id: channelId, setting, updated_at: new Date().toISOString() } as never,
    { onConflict: "user_id,channel_id" },
  );
  if (error) throw error;
}

export async function getAllNotificationPrefs(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Record<string, NotifSetting>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("channel_id, setting")
    .eq("user_id" as never, userId);
  if (error) throw error;
  return ((data ?? []) as { channel_id: string; setting: string }[]).reduce(
    (acc, row) => {
      acc[row.channel_id] = row.setting as NotifSetting;
      return acc;
    },
    {} as Record<string, NotifSetting>,
  );
}
