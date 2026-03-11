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
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import type { MessageRow, ChannelRow } from "@/features/chat/services/chat";
import {
  getChannels,
  getChannelsWithMembers,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  createChannel,
  updateChannel,
  archiveChannel,
  addChannelMembers,
  removeChannelMember,
  updateMemberRole,
  getChannelMembers,
  addReaction,
  removeReaction,
  updateLastRead,
  getUnreadCounts,
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
                // Deduplicate (optimistic update may have added it)
                if (firstPage.some((m) => m.id === newMsg.id)) return old;
                const pages = [...old.pages];
                pages[0] = [...firstPage, newMsg];
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
        message_type: "text",
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

  return useMutation({
    mutationFn: ({
      channelId,
      userId,
    }: {
      channelId: string;
      userId: string;
    }) => updateLastRead(supabase, channelId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-unread-counts"] });
    },
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
