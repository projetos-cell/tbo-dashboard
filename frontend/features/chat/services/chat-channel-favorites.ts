import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const TABLE = "chat_channel_favorites" as never;

export async function getFavoriteChannelIds(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("channel_id")
    .eq("user_id" as never, userId);
  if (error) throw error;
  return ((data ?? []) as { channel_id: string }[]).map((r) => r.channel_id);
}

export async function addFavoriteChannel(
  supabase: SupabaseClient<Database>,
  userId: string,
  channelId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, channel_id: channelId } as never);
  if (error) throw error;
}

export async function removeFavoriteChannel(
  supabase: SupabaseClient<Database>,
  userId: string,
  channelId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id" as never, userId)
    .eq("channel_id" as never, channelId);
  if (error) throw error;
}
