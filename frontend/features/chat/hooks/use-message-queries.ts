"use client";

import { useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ChatAttachmentRow } from "@/features/chat/services/chat-attachments";
import { getMessages } from "@/features/chat/services/chat";
import { getAttachmentsByMessageIds } from "@/features/chat/services/chat-attachments";

const MSG_PAGE_SIZE = 50;

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
      if (lastPage.length < MSG_PAGE_SIZE) return undefined;
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
                if (firstPage.some((m) => m.id === newMsg.id)) return old;
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
                if (updated.deleted_at) {
                  return {
                    ...old,
                    pages: old.pages.map((page) =>
                      page.filter((m) => m.id !== updated.id),
                    ),
                  };
                }
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
