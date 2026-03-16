"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDndSettings,
  setDndSettings,
  isDndActiveNow,
  type DndSettings,
} from "@/features/chat/services/chat-dnd";
import { toast } from "sonner";

/** Load and cache DND settings for the current user */
export function useDndSettings() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["dnd-settings", userId],
    queryFn: () => getDndSettings(supabase, userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/** Whether DND is currently active (checks schedule client-side) */
export function useIsDndActive(): boolean {
  const { data } = useDndSettings();
  if (!data) return false;
  return isDndActiveNow(data);
}

/** Save DND settings with optimistic update */
export function useSetDndSettings() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const qk = ["dnd-settings", userId];

  return useMutation({
    mutationFn: (settings: DndSettings) => {
      if (!userId) throw new Error("Not authenticated");
      return setDndSettings(supabase, userId, settings);
    },
    onMutate: async (settings) => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<DndSettings>(qk);
      qc.setQueryData(qk, settings);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
      toast.error("Erro ao salvar modo Não Perturbe");
    },
    onSuccess: (_, vars) => {
      if (vars.enabled) {
        const isActive = isDndActiveNow(vars);
        toast.success(
          isActive
            ? "Não Perturbe ativado — notificações silenciadas"
            : `Não Perturbe agendado: ${vars.startTime} às ${vars.endTime}`,
        );
      } else {
        toast.success("Não Perturbe desativado");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk });
    },
  });
}

/**
 * Hook that ticks every minute to re-evaluate DND window boundaries.
 * Useful for components that need to react to DND state changes over time.
 */
export function useDndWatcher(onActivate?: () => void, onDeactivate?: () => void) {
  const { data: settings } = useDndSettings();
  const wasActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!settings) return;

    function check() {
      if (!settings) return;
      const isActive = isDndActiveNow(settings);
      if (wasActiveRef.current === null) {
        wasActiveRef.current = isActive;
        return;
      }
      if (isActive && !wasActiveRef.current) {
        wasActiveRef.current = true;
        onActivate?.();
      } else if (!isActive && wasActiveRef.current) {
        wasActiveRef.current = false;
        onDeactivate?.();
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [settings, onActivate, onDeactivate]);

  return { isActive: settings ? isDndActiveNow(settings) : false };
}
