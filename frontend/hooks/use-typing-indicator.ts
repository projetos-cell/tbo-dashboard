"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

const TYPING_BROADCAST_DEBOUNCE_MS = 1_000;
const TYPING_TIMEOUT_MS = 3_000;

/**
 * Manages typing indicators via Supabase Realtime Broadcast.
 * Ephemeral — no DB writes, just channel broadcasts.
 */
export function useTypingIndicator(channelId: string | null) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.user_metadata?.full_name as string | undefined);
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);
  const setTypingUsers = useChatStore((s) => s.setTypingUsers);

  const lastBroadcastRef = useRef(0);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to typing events on the channel
  useEffect(() => {
    if (!channelId || !userId) return;

    // Clear typing users for this channel on mount
    setTypingUsers(channelId, []);

    const channel = supabase.channel(`typing:${channelId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const data = payload.payload as { userId: string; name: string };
        if (data.userId === userId) return; // Ignore own typing

        addTypingUser(channelId, { userId: data.userId, name: data.name });

        // Auto-remove after timeout
        if (timeoutsRef.current[data.userId]) {
          clearTimeout(timeoutsRef.current[data.userId]);
        }
        timeoutsRef.current[data.userId] = setTimeout(() => {
          removeTypingUser(channelId, data.userId);
          delete timeoutsRef.current[data.userId];
        }, TYPING_TIMEOUT_MS);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      // Clear all timeouts
      for (const t of Object.values(timeoutsRef.current)) clearTimeout(t);
      timeoutsRef.current = {};
      setTypingUsers(channelId, []);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, userId]);

  // Debounced broadcast
  const sendTyping = useCallback(() => {
    if (!channelRef.current || !userId) return;

    const now = Date.now();
    if (now - lastBroadcastRef.current < TYPING_BROADCAST_DEBOUNCE_MS) return;
    lastBroadcastRef.current = now;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId, name: userName ?? "Alguém" },
    });
  }, [userId, userName]);

  return { sendTyping };
}
