"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import type { ReactionRow } from "@/features/chat/services/chat";
import { addReaction, removeReaction, getReactions } from "@/features/chat/services/chat";

// ── Types ────────────────────────────────────────────────────────────

export type ReactionGroup = {
  emoji: string;
  count: number;
  userIds: string[];
  hasCurrentUser: boolean;
};

export type ReactionMap = Record<string, ReactionGroup[]>;

// ── Build Reaction Map ──────────────────────────────────────────────

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

// ── Mutations ────────────────────────────────────────────────────────

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

// ── Query with Realtime ─────────────────────────────────────────────

export function useReactionsForMessages(messageIds: string[], channelId: string | null) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  const stableKey = messageIds.join(",");

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
