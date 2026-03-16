"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAwayTimer } from "@/features/chat/hooks/use-away-timer";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PresenceStatus } from "@/features/chat/hooks/use-away-timer";

/**
 * Supabase Realtime Presence hook.
 * Tracks who is online for the entire tenant via `presence:{tenantId}` channel.
 * Integrates with away timer (#35) — broadcasts "away" status on inactivity.
 * "online" users have status:"online", away users have status:"away".
 * Both are included in onlineUsers (not removed) so clients can show away state.
 */
export function useChatPresence() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.user_metadata?.full_name) as
    | string
    | undefined;
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const statusRef = useRef<PresenceStatus>("online");

  const retrack = useCallback(async (status: PresenceStatus) => {
    statusRef.current = status;
    if (channelRef.current) {
      await channelRef.current.track({
        name: userName ?? "Alguém",
        online_at: new Date().toISOString(),
        status,
      });
    }
  }, [userName]);

  // #35 — Away timer: re-broadcast presence when status flips
  useAwayTimer((status) => void retrack(status));

  useEffect(() => {
    if (!tenantId || !userId) return;

    const supabase = createClient();
    const channel = supabase.channel(`presence:${tenantId}`, {
      config: { presence: { key: userId } },
    });

    channelRef.current = channel;

    function syncPresence() {
      if (!channelRef.current) return;
      const state = channelRef.current.presenceState();
      const users: { userId: string; name: string; avatarUrl?: string; onlineAt: string; status?: string }[] = [];

      for (const [key, presences] of Object.entries(state)) {
        const latest = presences[presences.length - 1] as Record<string, unknown> | undefined;
        if (latest) {
          users.push({
            userId: key,
            name: (latest.name as string) ?? key.slice(0, 8),
            avatarUrl: latest.avatarUrl as string | undefined,
            onlineAt: (latest.online_at as string) ?? new Date().toISOString(),
            status: (latest.status as string) ?? "online",
          });
        }
      }

      setOnlineUsers(users);
    }

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: userName ?? "Alguém",
            online_at: new Date().toISOString(),
            status: statusRef.current,
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, userId]);
}
