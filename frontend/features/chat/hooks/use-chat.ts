"use client";

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import type { MessageRow, ChannelRow, SectionRow, ReactionRow } from "@/features/chat/services/chat";
import type { ChatAttachmentRow } from "@/features/chat/services/chat-attachments";
import { getAttachmentsByMessageIds } from "@/features/chat/services/chat-attachments";
import {
  getChannels,
  getChannelsWithMembers,
  getBrowsableChannels,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  createChannel,
  updateChannel,
  archiveChannel,
  unarchiveChannel,
  deleteChannelPermanently,
  getArchivedChannels,
  addChannelMembers,
  removeChannelMember,
  updateMemberRole,
  getChannelMembers,
  addReaction,
  removeReaction,
  updateLastRead,
  getUnreadCounts,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  togglePinMessage,
  getPinnedMessages,
  getReactions,
  getThreadMessages,
  getThreadReplyCount,
  forwardMessage,
  getScheduledMessages,
  cancelScheduledMessage,
  joinChannel,
} from "@/features/chat/services/chat";

const MSG_PAGE_SIZE = 50;

// ── Channels ─────────────────────────────────────────────────────────

export function useChannels() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-channels", tenantId],
    queryFn: () => getChannels(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useChannelsWithMembers() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  // Realtime subscription for channel changes (create, update, archive)
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("chat-channels-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_channels",
        },
        () => {
          // Any channel change → refetch both channel queries
          qc.invalidateQueries({ queryKey: ["chat-channels"] });
          qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_channel_members",
        },
        () => {
          // Member changes → refetch channel list + member queries
          qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
          qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return useQuery({
    queryKey: ["chat-channels-members", tenantId],
    queryFn: () => getChannelsWithMembers(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Messages (Infinite Query + Full Realtime) ────────────────────────

export function useMessages(channelId: string | null) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["chat-messages", channelId, tenantId],
    queryFn: ({ pageParam }) =>
      getMessages(supabase, channelId!, {
        limit: MSG_PAGE_SIZE,
        before: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // If fewer than page size, no more older messages
      if (lastPage.length < MSG_PAGE_SIZE) return undefined;
      // Oldest message in this page (chronological order, [0] = oldest)
      return lastPage[0]?.created_at ?? undefined;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!channelId && !!tenantId,
  });

  // Full Realtime subscription: INSERT + UPDATE + DELETE
  useEffect(() => {
    if (!channelId || !tenantId) return;

    const qk = ["chat-messages", channelId, tenantId];

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as MessageRow;
            if (newMsg.deleted_at) return;

            qc.setQueryData<InfiniteData<MessageRow[], string | undefined>>(
              qk,
              (old) => {
                if (!old) return old;
                const firstPage = old.pages[0] ?? [];
                // Deduplicate: skip if real ID already exists
                if (firstPage.some((m) => m.id === newMsg.id)) return old;
                // Remove optimistic entries from same sender with same content
                const cleaned = firstPage.filter(
                  (m) =>
                    !m.id.startsWith("optimistic-") ||
                    m.sender_id !== newMsg.sender_id ||
                    m.content !== newMsg.content,
                );
                const pages = [...old.pages];
                pages[0] = [...cleaned, newMsg];
                return { ...old, pages };
              },
            );
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as MessageRow;

            qc.setQueryData<InfiniteData<MessageRow[], string | undefined>>(
              qk,
              (old) => {
                if (!old) return old;
                // Soft-deleted: remove from view
                if (updated.deleted_at) {
                  return {
                    ...old,
                    pages: old.pages.map((page) =>
                      page.filter((m) => m.id !== updated.id),
                    ),
                  };
                }
                // Update in-place (e.g. edited_at changed)
                return {
                  ...old,
                  pages: old.pages.map((page) =>
                    page.map((m) => (m.id === updated.id ? updated : m)),
                  ),
                };
              },
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;

            qc.setQueryData<InfiniteData<MessageRow[], string | undefined>>(
              qk,
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page) =>
                    page.filter((m) => m.id !== deletedId),
                  ),
                };
              },
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, tenantId]);

  return query;
}

/** Flatten infinite pages into a single chronological array */
export function flattenMessages(
  data: InfiniteData<MessageRow[], unknown> | undefined,
): MessageRow[] {
  if (!data?.pages) return [];
  // pages[0] = latest batch, pages[N] = oldest batch
  // Reverse page order then flatten for chronological display
  return [...data.pages].reverse().flat();
}

// ── Message Attachments ──────────────────────────────────────────────

export function useMessageAttachments(messageIds: string[]) {
  const supabase = createClient();
  const stableKey = messageIds.join(",");

  return useQuery({
    queryKey: ["chat-attachments", stableKey],
    queryFn: () => getAttachmentsByMessageIds(supabase, messageIds),
    staleTime: 1000 * 60 * 5,
    enabled: messageIds.length > 0,
  });
}

/** Build a map of messageId -> ChatAttachmentRow[] */
export function buildAttachmentMap(
  attachments: ChatAttachmentRow[] | undefined,
): Record<string, ChatAttachmentRow[]> {
  if (!attachments) return {};
  const map: Record<string, ChatAttachmentRow[]> = {};
  for (const a of attachments) {
    const mid = a.message_id;
    if (!mid) continue;
    if (!map[mid]) map[mid] = [];
    map[mid].push(a);
  }
  return map;
}

// ── Send Message (with optimistic insert) ────────────────────────────

export function useSendMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onMutate: async (newMsg) => {
      const qk = ["chat-messages", newMsg.channel_id, tenantId];
      await qc.cancelQueries({ queryKey: qk });
      const previous = qc.getQueryData<InfiniteData<MessageRow[], string | undefined>>(qk);

      // Optimistic message for instant feedback
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        channel_id: newMsg.channel_id,
        sender_id: newMsg.sender_id,
        content: newMsg.content ?? null,
        message_type: newMsg.message_type ?? "text",
        metadata: null,
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        reply_to: null,
      } as unknown as MessageRow;

      qc.setQueryData<InfiniteData<MessageRow[], string | undefined>>(
        qk,
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = [...(pages[0] ?? []), optimistic];
          return { ...old, pages };
        },
      );

      return { previous, qk };
    },
    onError: (_err, _msg, context) => {
      if (context?.previous) {
        qc.setQueryData(context.qk, context.previous);
      }
    },
    // Realtime INSERT will replace optimistic with real message
  });
}

// ── Edit Message ─────────────────────────────────────────────────────

export function useEditMessage() {
  const supabase = createClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(supabase, messageId, content),
    // Realtime UPDATE event patches cache automatically
  });
}

// ── Delete Message ───────────────────────────────────────────────────

export function useDeleteMessage() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      deleteMessage(supabase, messageId),
    onSuccess: (_data, { messageId }) => {
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_messages",
          recordId: messageId,
        });
      }
    },
  });
}

// ── Pin Messages ────────────────────────────────────────────────────

export function usePinnedMessages(channelId: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["chat-pinned", channelId],
    queryFn: () => getPinnedMessages(supabase, channelId!),
    enabled: !!channelId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTogglePin() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, pinned }: { messageId: string; pinned: boolean }) =>
      togglePinMessage(supabase, messageId, pinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-pinned"] });
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}

// ── Create Channel ───────────────────────────────────────────────────

export function useCreateChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      type?: string;
      memberIds?: string[];
    }) => {
      if (!tenantId || !userId) {
        throw new Error("Usuário não autenticado");
      }
      const channel = await createChannel(supabase, {
        tenant_id: tenantId,
        name: input.name,
        description: input.description ?? null,
        type: input.type ?? "channel",
        created_by: userId,
      });
      // Add creator + selected members
      const allMembers = [...new Set([userId, ...(input.memberIds ?? [])])];
      await addChannelMembers(supabase, channel.id, allMembers, "member");
      // Promote creator to admin
      await updateMemberRole(supabase, channel.id, userId, "admin");
      return channel;
    },
    onSuccess: (channel) => {
      // Invalidate BOTH channel queries so sidebar updates immediately
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success(`Canal "${channel.name}" criado com sucesso`);
      if (userId) {
        logAuditTrail({
          userId,
          action: "create",
          table: "chat_channels",
          recordId: channel.id,
          after: { name: channel.name, type: channel.type },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Update Channel ───────────────────────────────────────────────────

export function useUpdateChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["chat_channels"]["Update"];
    }) => updateChannel(supabase, id, updates),
    onSuccess: (channel) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success("Canal atualizado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channel.id,
          after: { name: channel.name },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao atualizar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Archive Channel ──────────────────────────────────────────────────

export function useArchiveChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) => archiveChannel(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success("Canal arquivado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channelId,
          after: { is_archived: true },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao arquivar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Unarchive Channel ────────────────────────────────────────────────

export function useUnarchiveChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) => unarchiveChannel(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      qc.invalidateQueries({ queryKey: ["chat-archived-channels"] });
      toast.success("Canal desarquivado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channelId,
          after: { is_archived: false },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao desarquivar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Delete Channel Permanently ──────────────────────────────────────

export function useDeleteChannelPermanently() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) =>
      deleteChannelPermanently(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      qc.invalidateQueries({ queryKey: ["chat-archived-channels"] });
      toast.success("Canal deletado permanentemente");
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_channels",
          recordId: channelId,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao deletar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Archived Channels ───────────────────────────────────────────────

export function useArchivedChannels() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-archived-channels", tenantId],
    queryFn: () => getArchivedChannels(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Browse Channels (#30) ─────────────────────────────────────────────

export function useBrowsableChannels(enabled: boolean) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-browsable-channels", tenantId],
    queryFn: () => getBrowsableChannels(supabase),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && enabled,
  });
}

export function useJoinChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await joinChannel(supabase, channelId, userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-channels-members", tenantId] });
      qc.invalidateQueries({ queryKey: ["chat-channels", tenantId] });
      qc.invalidateQueries({ queryKey: ["chat-browsable-channels", tenantId] });
      toast.success("Canal adicionado à sua lista");
    },
    onError: () => {
      toast.error("Erro ao entrar no canal");
    },
  });
}

// ── Channel Members ──────────────────────────────────────────────────

export function useChannelMembers(channelId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-channel-members", channelId],
    queryFn: () => getChannelMembers(supabase, channelId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!channelId,
  });
}

export function useAddChannelMembers() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      userIds,
      role,
    }: {
      channelId: string;
      userIds: string[];
      role?: "admin" | "member";
    }) => addChannelMembers(supabase, channelId, userIds, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
    },
  });
}

export function useRemoveChannelMember() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      channelId,
      memberId,
    }: {
      channelId: string;
      memberId: string;
    }) => removeChannelMember(supabase, channelId, memberId),
    onSuccess: (_data, { channelId, memberId }) => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_channel_members",
          recordId: `${channelId}:${memberId}`,
        });
      }
    },
  });
}

export function useUpdateMemberRole() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      channelId,
      memberId,
      role,
    }: {
      channelId: string;
      memberId: string;
      role: "admin" | "member";
    }) => updateMemberRole(supabase, channelId, memberId, role),
    onSuccess: (_data, { channelId, memberId, role }) => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
      if (userId) {
        logAuditTrail({
          userId,
          action: "permission_change",
          table: "chat_channel_members",
          recordId: `${channelId}:${memberId}`,
          after: { role },
        });
      }
    },
  });
}

// ── Reactions ────────────────────────────────────────────────────────

export function useAddReaction() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reaction: Database["public"]["Tables"]["chat_reactions"]["Insert"]) =>
      addReaction(supabase, reaction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-messages"] }),
  });
}

export function useRemoveReaction() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      userId,
      emoji,
    }: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => removeReaction(supabase, messageId, userId, emoji),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-messages"] }),
  });
}

// ── Mark as Read ─────────────────────────────────────────────────────

export function useMarkAsRead() {
  const supabase = createClient();
  const qc = useQueryClient();
  const clearUnread = useChatStore.getState().clearUnread;

  return useMutation({
    mutationFn: ({
      channelId,
      userId,
    }: {
      channelId: string;
      userId: string;
    }) => updateLastRead(supabase, channelId, userId),
    onMutate: ({ channelId }) => {
      // Optimistic: clear badge immediately
      clearUnread(channelId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-unread-counts"] });
    },
  });
}

// ── Reactions per message batch ──────────────────────────────────────

export type ReactionGroup = {
  emoji: string;
  count: number;
  userIds: string[];
  hasCurrentUser: boolean;
};

export type ReactionMap = Record<string, ReactionGroup[]>;

export function buildReactionMap(
  reactions: ReactionRow[] | undefined,
  currentUserId: string | undefined,
): ReactionMap {
  if (!reactions) return {};
  const map: Record<string, Record<string, { count: number; userIds: string[] }>> = {};
  for (const r of reactions) {
    if (!map[r.message_id]) map[r.message_id] = {};
    if (!map[r.message_id][r.emoji]) map[r.message_id][r.emoji] = { count: 0, userIds: [] };
    map[r.message_id][r.emoji].count++;
    map[r.message_id][r.emoji].userIds.push(r.user_id);
  }
  const result: ReactionMap = {};
  for (const [msgId, emojiMap] of Object.entries(map)) {
    result[msgId] = Object.entries(emojiMap).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userIds: data.userIds,
      hasCurrentUser: currentUserId ? data.userIds.includes(currentUserId) : false,
    }));
  }
  return result;
}

export function useReactionsForMessages(messageIds: string[], channelId: string | null) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  const stableKey = messageIds.join(",");

  // Realtime: react to reaction inserts/deletes in this channel
  useEffect(() => {
    if (!channelId || !tenantId || messageIds.length === 0) return;

    const ch = supabase
      .channel(`chat-reactions:${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_reactions" },
        () => {
          qc.invalidateQueries({ queryKey: ["chat-reactions"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, tenantId, stableKey]);

  return useQuery({
    queryKey: ["chat-reactions", stableKey],
    queryFn: () => getReactions(supabase, messageIds),
    staleTime: 1000 * 30,
    enabled: messageIds.length > 0,
  });
}

// ── Unread Counts ────────────────────────────────────────────────────

export function useUnreadCounts() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-unread-counts", userId, tenantId],
    queryFn: () => getUnreadCounts(supabase, userId!, tenantId!),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    enabled: !!userId && !!tenantId,
  });
}

// ── Sections ────────────────────────────────────────────────────────

export function useSections() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-sections", tenantId],
    queryFn: () => getSections(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateSection() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: { name: string; sortOrder?: number }) => {
      if (!tenantId || !userId) throw new Error("Usuário não autenticado");
      return createSection(supabase, {
        tenant_id: tenantId,
        name: input.name,
        sort_order: input.sortOrder ?? 0,
        created_by: userId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
      toast.success("Seção criada");
    },
    onError: (error) => {
      toast.error("Erro ao criar seção", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

export function useUpdateSection() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; sort_order?: number };
    }) => updateSection(supabase, id, updates as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
    },
  });
}

export function useDeleteSection() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) => deleteSection(supabase, sectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
      toast.success("Seção removida");
    },
  });
}

// ── Thread Messages ──────────────────────────────────────────────────

export function useThreadMessages(parentMessageId: string | null) {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!parentMessageId || !tenantId) return;

    const ch = supabase
      .channel(`chat-thread:${parentMessageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const msg = (payload.new ?? payload.old) as MessageRow;
          if (msg && (msg as Record<string, unknown>).reply_to === parentMessageId) {
            qc.invalidateQueries({ queryKey: ["chat-thread", parentMessageId] });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentMessageId, tenantId]);

  return useQuery({
    queryKey: ["chat-thread", parentMessageId],
    queryFn: () => getThreadMessages(supabase, parentMessageId!),
    staleTime: 1000 * 30,
    enabled: !!parentMessageId,
  });
}

export function useThreadReplyCount(messageIds: string[]) {
  const supabase = createClient();
  const stableKey = messageIds.join(",");

  return useQuery({
    queryKey: ["chat-thread-counts", stableKey],
    queryFn: () => getThreadReplyCount(supabase, messageIds),
    staleTime: 1000 * 30,
    enabled: messageIds.length > 0,
  });
}

export function useSendThreadReply() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["chat-thread", variables.reply_to] });
    },
  });
}

// ── Forward Message ──────────────────────────────────────────────────

// ── Scheduled Messages ────────────────────────────────────────────────

export function useScheduledMessages(channelId: string | null) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-scheduled", channelId, userId],
    queryFn: () => getScheduledMessages(supabase, channelId!, userId!),
    staleTime: 1000 * 30,
    enabled: !!channelId && !!userId,
  });
}

export function useSendScheduledMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["chat-scheduled", variables.channel_id, userId] });
      toast.success("Mensagem agendada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao agendar mensagem");
    },
  });
}

export function useCancelScheduledMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ messageId, channelId }: { messageId: string; channelId: string }) =>
      cancelScheduledMessage(supabase, messageId),
    onSuccess: (_data, { channelId }) => {
      qc.invalidateQueries({ queryKey: ["chat-scheduled", channelId, userId] });
      toast.success("Agendamento cancelado");
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento");
    },
  });
}

export function useForwardMessage() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetChannelId,
      senderId,
      originalMessage,
      originalSenderName,
    }: {
      targetChannelId: string;
      senderId: string;
      originalMessage: MessageRow;
      originalSenderName: string;
    }) => forwardMessage(supabase, targetChannelId, senderId, originalMessage, originalSenderName),
    onSuccess: (_data, { targetChannelId }) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", targetChannelId] });
      toast.success("Mensagem encaminhada");
    },
    onError: () => {
      toast.error("Erro ao encaminhar mensagem");
    },
  });
}
