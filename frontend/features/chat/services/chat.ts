import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ChannelRow = Database["public"]["Tables"]["chat_channels"]["Row"];
export type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
export type MemberRow = Database["public"]["Tables"]["chat_channel_members"]["Row"];
export type ReactionRow = Database["public"]["Tables"]["chat_reactions"]["Row"];
export type SectionRow = Database["public"]["Tables"]["chat_channel_sections"]["Row"];

// ── Channels ─────────────────────────────────────────────────────────

export async function getChannels(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
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

export async function updateChannel(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["chat_channels"]["Update"],
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ChannelRow;
}

export async function archiveChannel(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("chat_channels")
    .update({ is_archived: true } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function unarchiveChannel(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("chat_channels")
    .update({ is_archived: false } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteChannelPermanently(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  // Delete members first (FK constraint)
  await supabase.from("chat_channel_members").delete().eq("channel_id", id);
  // Delete messages + attachments
  const { data: msgs } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("channel_id", id);
  if (msgs && msgs.length > 0) {
    const msgIds = msgs.map((m) => m.id);
    await supabase.from("chat_reactions").delete().in("message_id", msgIds);
    await supabase.from("chat_attachments").delete().in("message_id", msgIds);
    await supabase.from("chat_messages").delete().eq("channel_id", id);
  }
  // Delete channel
  const { error } = await supabase.from("chat_channels").delete().eq("id", id);
  if (error) throw error;
}

/** Get archived channels for sidebar display */
export async function getArchivedChannels(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*, chat_channel_members(user_id, role)")
    .eq("is_archived", true)
    .order("name");
  if (error) throw error;
  return data as (ChannelRow & { chat_channel_members: { user_id: string; role: string }[] })[];
}

/** Channels with member join for DM display names */
export async function getChannelsWithMembers(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*, chat_channel_members(user_id, role)")
    .eq("is_archived", false)
    .order("name");
  if (error) throw error;
  return data as (ChannelRow & { chat_channel_members: { user_id: string; role: string }[] })[];
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

export async function addChannelMembers(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userIds: string[],
  role: "admin" | "member" = "member",
) {
  const rows = userIds.map((uid) => ({
    channel_id: channelId,
    user_id: uid,
    role,
  }));
  const { error } = await supabase
    .from("chat_channel_members")
    .upsert(rows as never[]);
  if (error) throw error;
}

export async function removeChannelMember(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userId: string,
) {
  const { error } = await supabase
    .from("chat_channel_members")
    .delete()
    .eq("channel_id", channelId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateMemberRole(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userId: string,
  role: "admin" | "member",
) {
  const { error } = await supabase
    .from("chat_channel_members")
    .update({ role } as never)
    .eq("channel_id", channelId)
    .eq("user_id", userId);
  if (error) throw error;
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
  opts: { limit?: number; before?: string } = {},
) {
  const limit = opts.limit ?? 50;

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .is("reply_to", null)
    .is("scheduled_at" as never, null)
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

export async function editMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .update({ content, edited_at: new Date().toISOString() } as never)
    .eq("id", messageId)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as MessageRow;
}

export async function deleteMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", messageId);
  if (error) throw error;
}

// ── Search ───────────────────────────────────────────────────────────

export async function searchMessages(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  query: string,
  opts: { limit?: number; offset?: number } = {},
) {
  const { data, error } = await supabase.rpc("search_chat_messages" as never, {
    p_tenant_id: tenantId,
    p_user_id: userId,
    p_query: query,
    p_limit: opts.limit ?? 50,
    p_offset: opts.offset ?? 0,
  } as never);
  if (error) throw error;
  return (data ?? []) as MessageRow[];
}

// ── Unread Counts ────────────────────────────────────────────────────

export async function getUnreadCounts(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
) {
  const { data, error } = await supabase.rpc("get_unread_counts" as never, {
    p_user_id: userId,
    p_tenant_id: tenantId,
  } as never);
  if (error) throw error;
  return ((data ?? []) as { channel_id: string; unread_count: number }[]).reduce(
    (acc, row) => {
      acc[row.channel_id] = Number(row.unread_count);
      return acc;
    },
    {} as Record<string, number>,
  );
}

// ── DMs / Groups ─────────────────────────────────────────────────────

export async function findOrCreateDirectChannel(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  targetUserId: string,
): Promise<ChannelRow> {
  // Find existing DM between these two users
  const { data: existing } = await supabase
    .from("chat_channels")
    .select("*, chat_channel_members(user_id)")
    .eq("type", "direct")
    .eq("is_archived", false);

  const match = existing?.find((ch) => {
    const members = (ch as Record<string, unknown>).chat_channel_members as { user_id: string }[];
    return (
      members.length === 2 &&
      members.some((m) => m.user_id === userId) &&
      members.some((m) => m.user_id === targetUserId)
    );
  });

  if (match) return match as unknown as ChannelRow;

  // Create new DM
  const channel = await createChannel(supabase, {
    tenant_id: tenantId,
    name: `dm-${[userId, targetUserId].sort().join("-").slice(0, 20)}`,
    type: "direct",
    created_by: userId,
  });
  await addChannelMembers(supabase, channel.id, [userId, targetUserId]);
  return channel;
}

export async function createGroupDM(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  memberIds: string[],
  name?: string,
): Promise<ChannelRow> {
  const channel = await createChannel(supabase, {
    tenant_id: tenantId,
    name: name ?? `Grupo (${memberIds.length + 1})`,
    type: "group",
    created_by: userId,
  });
  await addChannelMembers(supabase, channel.id, [userId, ...memberIds]);
  return channel;
}

// ── Sections ────────────────────────────────────────────────────────

export async function getSections(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("chat_channel_sections")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order");
  if (error) throw error;
  return data as SectionRow[];
}

export async function createSection(
  supabase: SupabaseClient<Database>,
  section: Database["public"]["Tables"]["chat_channel_sections"]["Insert"],
) {
  const { data, error } = await supabase
    .from("chat_channel_sections")
    .insert(section as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as SectionRow;
}

export async function updateSection(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["chat_channel_sections"]["Update"],
) {
  const { data, error } = await supabase
    .from("chat_channel_sections")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as SectionRow;
}

export async function deleteSection(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("chat_channel_sections")
    .delete()
    .eq("id", id);
  if (error) throw error;
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
) {
  const { error } = await supabase
    .from("chat_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .eq("emoji", emoji);
  if (error) throw error;
}

// ── Pin Messages ──────────────────────────────────────────────────────

export async function togglePinMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  pinned: boolean,
) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ is_pinned: pinned } as never)
    .eq("id", messageId);
  if (error) throw error;
}

// ── Thread Messages ──────────────────────────────────────────────────

export async function getThreadMessages(
  supabase: SupabaseClient<Database>,
  parentMessageId: string,
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("reply_to", parentMessageId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as MessageRow[];
}

export async function getThreadReplyCount(
  supabase: SupabaseClient<Database>,
  messageIds: string[],
): Promise<Record<string, number>> {
  if (messageIds.length === 0) return {};
  const { data, error } = await supabase
    .from("chat_messages")
    .select("reply_to")
    .in("reply_to", messageIds)
    .is("deleted_at", null);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.reply_to) counts[row.reply_to] = (counts[row.reply_to] ?? 0) + 1;
  }
  return counts;
}

// ── Forward Message ──────────────────────────────────────────────────

export async function forwardMessage(
  supabase: SupabaseClient<Database>,
  targetChannelId: string,
  senderId: string,
  original: MessageRow,
  originalSenderName: string,
) {
  return sendMessage(supabase, {
    channel_id: targetChannelId,
    sender_id: senderId,
    content: original.content ?? "",
    message_type: "text",
    metadata: {
      forwarded_from: {
        message_id: original.id,
        sender_name: originalSenderName,
        content: original.content ?? "",
        original_created_at: original.created_at ?? "",
      },
    } as never,
  });
}

// ── Scheduled Messages ───────────────────────────────────────────────

export async function getScheduledMessages(
  supabase: SupabaseClient<Database>,
  channelId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .eq("sender_id", userId)
    .is("deleted_at", null)
    .not("scheduled_at" as never, "is", null)
    .order("scheduled_at" as never, { ascending: true });
  if (error) throw error;
  return data as MessageRow[];
}

export async function cancelScheduledMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", messageId);
  if (error) throw error;
}

export async function getPinnedMessages(
  supabase: SupabaseClient<Database>,
  channelId: string,
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .eq("is_pinned", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as MessageRow[];
}
