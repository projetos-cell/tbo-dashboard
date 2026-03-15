"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";

export type NotifSetting = "all" | "mentions" | "nothing";

interface UsePushNotificationsOptions {
  channelNames: Record<string, string>;
  senderNames: Record<string, string>;
  notifPrefs?: Record<string, NotifSetting>;
}

/**
 * Feature #7 — Browser push notifications via the Notification API.
 * Shows a notification for new messages when the tab is not focused
 * or the user is viewing a different channel.
 */
export function usePushNotifications({
  channelNames,
  senderNames,
  notifPrefs = {},
}: UsePushNotificationsOptions) {
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  // Use ref to avoid re-subscribing on every channel switch
  const selectedChannelIdRef = useRef<string | null>(null);
  const selectedChannelId = useChatStore((s) => s.selectedChannelId);
  useEffect(() => {
    selectedChannelIdRef.current = selectedChannelId;
  }, [selectedChannelId]);

  // Keep latest maps in ref so subscription closure always has fresh data
  const channelNamesRef = useRef(channelNames);
  useEffect(() => { channelNamesRef.current = channelNames; }, [channelNames]);
  const senderNamesRef = useRef(senderNames);
  useEffect(() => { senderNamesRef.current = senderNames; }, [senderNames]);
  const notifPrefsRef = useRef(notifPrefs);
  useEffect(() => { notifPrefsRef.current = notifPrefs; }, [notifPrefs]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!userId || !tenantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`push-notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          if (typeof window === "undefined" || !("Notification" in window)) return;
          if (Notification.permission !== "granted") return;

          const msg = payload.new as {
            id: string;
            channel_id: string;
            sender_id: string;
            content: string | null;
          };

          // Skip own messages
          if (msg.sender_id === userId) return;

          const pref: NotifSetting = notifPrefsRef.current[msg.channel_id] ?? "all";
          if (pref === "nothing") return;

          // For "mentions" pref, only notify if content contains @userId
          if (pref === "mentions") {
            const mentionsMe = msg.content?.includes(`<@${userId}>`) || msg.content?.includes("<@channel>") || msg.content?.includes("<@here>");
            if (!mentionsMe) return;
          }

          // Skip if page is visible AND viewing this channel
          const isVisible = document.visibilityState === "visible";
          const isCurrentChannel = msg.channel_id === selectedChannelIdRef.current;
          if (isVisible && isCurrentChannel) return;

          const channelName = channelNamesRef.current[msg.channel_id] ?? "Chat";
          const senderName = senderNamesRef.current[msg.sender_id] ?? "Alguém";
          // Strip HTML tags from content for notification body
          const rawBody = msg.content ?? "";
          const body = rawBody
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim()
            .slice(0, 120) || "Enviou um arquivo";

          try {
            new Notification(`#${channelName} — ${senderName}`, {
              body,
              icon: "/favicon.ico",
              tag: `chat-${msg.channel_id}`,
            });
          } catch {
            // Notification API may fail silently in some contexts
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, tenantId]);
}
