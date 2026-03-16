"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getAwaySettings,
  setAwaySettings,
  type AwaySettings,
} from "@/features/chat/services/chat-dnd";
import { toast } from "sonner";

export type PresenceStatus = "online" | "away";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"] as const;

/**
 * Tracks user activity and broadcasts "away" status via Realtime Presence
 * when the user has been inactive for the configured timeout.
 *
 * Returns the current presence status so components can display it.
 */
export function useAwayTimer(
  onStatusChange?: (status: PresenceStatus) => void,
) {
  const userId = useAuthStore((s) => s.user?.id);
  const supabase = createClient();
  const statusRef = useRef<PresenceStatus>("online");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: settings } = useAwaySettings();

  const timeoutMs = (settings?.timeoutMinutes ?? 10) * 60 * 1000;

  const setStatus = useCallback(
    (next: PresenceStatus) => {
      if (statusRef.current === next) return;
      statusRef.current = next;
      onStatusChange?.(next);
    },
    [onStatusChange],
  );

  const resetTimer = useCallback(() => {
    // User is active — mark online
    if (statusRef.current === "away") {
      setStatus("online");
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setStatus("away");
    }, timeoutMs);
  }, [timeoutMs, setStatus]);

  useEffect(() => {
    if (!userId) return;

    // Start timer immediately
    resetTimer();

    // Bind activity listeners
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    // Also update last_seen_at in DB periodically (every 2 min while active)
    const heartbeatInterval = setInterval(async () => {
      if (statusRef.current === "online") {
        await supabase.rpc("update_last_seen" as never).then(null, () => null);
      }
    }, 2 * 60 * 1000);

    // Initial last_seen update
    supabase.rpc("update_last_seen" as never).then(null, () => null);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(heartbeatInterval);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [userId, resetTimer, supabase]);

  return { currentStatus: statusRef.current };
}

// ── Settings hooks ────────────────────────────────────────────────

export function useAwaySettings() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["away-settings", userId],
    queryFn: () => getAwaySettings(supabase, userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSetAwaySettings() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (settings: AwaySettings) => {
      if (!userId) throw new Error("Not authenticated");
      return setAwaySettings(supabase, userId, settings);
    },
    onMutate: async (settings) => {
      await qc.cancelQueries({ queryKey: ["away-settings", userId] });
      const prev = qc.getQueryData<AwaySettings>(["away-settings", userId]);
      qc.setQueryData(["away-settings", userId], settings);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["away-settings", userId], ctx.prev);
      toast.error("Erro ao salvar configuração de ausência");
    },
    onSuccess: () => {
      toast.success("Configuração de ausência salva");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["away-settings", userId] });
    },
  });
}
