import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ChannelRow = Database["public"]["Tables"]["chat_channels"]["Row"];
type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
type MemberRow = Database["public"]["Tables"]["chat_channel_members"]["Row"];
type ReactionRow = Database["public"]["Tables"]["chat_reactions"]["Row"];

// ── Channels ─────────────────────────────────────────────────────────

export async function getChannels(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_archived", false)
    .order("name");
  if (error) throw error;
  return data as ChannelRow[];
}

export async function getChannelById(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ChannelRow;
}

export async function createChannel(
  supabase: SupabaseClient<Database>,
  channel: Database["public"]["Tables"]["chat_channels"]["Insert"],
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .insert(channel as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ChannelRow;
}

// ── Members ──────────────────────────────────────────────────────────

export async function getChannelMembers(
  supabase: SupabaseClient<Database>,
  channelId: string,
) {
  const { data, error } = await supabase
    .from("chat_channel_members")
    .select("*")
    .eq("channel_id", channelId);
  if (error) throw error;
  return data as MemberRow[];
}

export async function joinChannel(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userId: string,
) {
  const { error } = await supabase
    .from("chat_channel_members")
    .upsert({ channel_id: channelId, user_id: userId, role: "member" } as never);
  if (error) throw error;
}

export async function updateLastRead(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userId: string,
) {
  const { error } = await supabase
    .from("chat_channel_members")
    .update({ last_read_at: new Date().toISOString() } as never)
    .eq("channel_id", channelId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Messages ─────────────────────────────────────────────────────────

export async function getMessages(
  supabase: SupabaseClient<Database>,
  channelId: string,
  tenantId: string,
  opts: { limit?: number; before?: string } = {},
) {
  const limit = opts.limit ?? 50;

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.before) query = query.lt("created_at", opts.before);

  const { data, error } = await query;
  if (error) throw error;
  return (data as MessageRow[]).reverse();
}

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  msg: Database["public"]["Tables"]["chat_messages"]["Insert"],
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(msg as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as MessageRow;
}

// ── Reactions ────────────────────────────────────────────────────────

export async function getReactions(
  supabase: SupabaseClient<Database>,
  messageIds: string[],
) {
  if (messageIds.length === 0) return [] as ReactionRow[];
  const { data, error } = await supabase
    .from("chat_reactions")
    .select("*")
    .in("message_id", messageIds);
  if (error) throw error;
  return data as ReactionRow[];
}

export async function addReaction(
  supabase: SupabaseClient<Database>,
  reaction: Database["public"]["Tables"]["chat_reactions"]["Insert"],
) {
  const { error } = await supabase.from("chat_reactions").upsert(reaction as never, {
    onConflict: "message_id,user_id,emoji",
  });
  if (error) throw error;
}

export async function removeReaction(
  supabase: SupabaseClient<Database>,
  messageId: string,
  userId: string,
  emoji: string,
  tenantId: string,
) {
  const { error } = await supabase
    .from("chat_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .eq("emoji", emoji)
    .eq("tenant_id", tenantId);
  if (error) throw error;
}
