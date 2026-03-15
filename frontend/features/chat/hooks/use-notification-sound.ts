"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { NotifSetting } from "@/features/chat/services/chat-notification-prefs";

const STORAGE_KEY = "tbo-chat-sound-enabled";

function playPing(): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ac = new Ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.3);
    setTimeout(() => ac.close(), 500);
  } catch {
    // Web Audio API unavailable or blocked
  }
}

/** Read sound preference from localStorage (defaults to true). */
export function getSoundPref(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === null ? true : v === "true";
}

/** Persist sound preference to localStorage. */
export function saveSoundPref(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }
}

interface UseNotificationSoundOptions {
  soundEnabled: boolean;
  notifPrefs?: Record<string, NotifSetting>;
}

/**
 * Feature #10 — Notification sound via Web Audio API.
 * Plays a soft ping for new messages when not on the active channel,
 * respecting per-channel notification preferences and the global sound toggle.
 */
export function useNotificationSound({
  soundEnabled,
  notifPrefs = {},
}: UseNotificationSoundOptions): void {
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  const selectedChannelIdRef = useRef<string | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const notifPrefsRef = useRef(notifPrefs);

  const selectedChannelId = useChatStore((s) => s.selectedChannelId);
  useEffect(() => {
    selectedChannelIdRef.current = selectedChannelId;
  }, [selectedChannelId]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    notifPrefsRef.current = notifPrefs;
  }, [notifPrefs]);

  useEffect(() => {
    if (!userId || !tenantId) return;

    const supabase = createClient();
    const ch = supabase
      .channel(`sound-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          if (!soundEnabledRef.current) return;

          const msg = payload.new as {
            channel_id: string;
            sender_id: string;
            content: string | null;
          };

          if (msg.sender_id === userId) return;

          const pref: NotifSetting = notifPrefsRef.current[msg.channel_id] ?? "all";
          if (pref === "nothing") return;

          if (pref === "mentions") {
            const mentionsMe =
              msg.content?.includes(`<@${userId}>`) ||
              msg.content?.includes("<@channel>") ||
              msg.content?.includes("<@here>");
            if (!mentionsMe) return;
          }

          // Skip if page is visible AND viewing this channel
          if (
            document.visibilityState === "visible" &&
            msg.channel_id === selectedChannelIdRef.current
          ) {
            return;
          }

          playPing();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, tenantId]);
}
