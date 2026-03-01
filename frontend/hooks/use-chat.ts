"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getChannels,
  getMessages,
  sendMessage,
  addReaction,
  removeReaction,
  updateLastRead,
} from "@/services/chat";

// ── Channels ─────────────────────────────────────────────────────────

export function useChannels() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-channels", tenantId],
    queryFn: () => getChannels(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Messages (with Realtime) ─────────────────────────────────────────

export function useMessages(channelId: string | null) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-messages", channelId, tenantId],
    queryFn: () => getMessages(supabase, channelId!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!channelId && !!tenantId,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          qc.setQueryData(
            ["chat-messages", channelId, tenantId],
            (old: Database["public"]["Tables"]["chat_messages"]["Row"][] | undefined) =>
              old
                ? [...old, payload.new as Database["public"]["Tables"]["chat_messages"]["Row"]]
                : [payload.new as Database["public"]["Tables"]["chat_messages"]["Row"]],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, tenantId, supabase, qc]);

  return query;
}

// ── Send Message ─────────────────────────────────────────────────────

export function useSendMessage() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-messages"] }),
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
    }) => removeReaction(supabase, messageId, userId, emoji, tenantId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-messages"] }),
  });
}

// ── Mark as read ─────────────────────────────────────────────────────

export function useMarkAsRead() {
  const supabase = createClient();

  return useMutation({
    mutationFn: ({
      channelId,
      userId,
    }: {
      channelId: string;
      userId: string;
    }) => updateLastRead(supabase, channelId, userId),
  });
}
