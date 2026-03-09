"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Supabase Realtime Presence hook.
 * Tracks who is online for the entire tenant via `presence:{tenantId}` channel.
 * Each user broadcasts their userId, name, and optional avatarUrl.
 * The hook syncs the consolidated presence state into chatStore.onlineUsers.
 */
export function useChatPresence() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.user_metadata?.full_name) as
    | string
    | undefined;
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const channelRef = useRef<RealtimeChannel | null>(null);

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
      const users: { userId: string; name: string; avatarUrl?: string; onlineAt: string }[] = [];

      for (const [key, presences] of Object.entries(state)) {
        // Each key is a userId, presences is an array (usually 1 entry)
        const latest = presences[presences.length - 1] as Record<string, unknown> | undefined;
        if (latest) {
          users.push({
            userId: key,
            name: (latest.name as string) ?? key.slice(0, 8),
            avatarUrl: latest.avatarUrl as string | undefined,
            onlineAt: (latest.online_at as string) ?? new Date().toISOString(),
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
