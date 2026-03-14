"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getAcademyProgress,
  markModuleComplete,
  markModuleIncomplete,
} from "@/features/cultura/services/academy";

function useSupabase() {
  return createClient();
}

// ─── Query key factory ───────────────────────────────────────────────────────

function progressKey(userId: string | undefined) {
  return ["academy-progress", userId] as const;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Returns the list of completed module IDs for the current user. */
export function useAcademyProgress() {
  const supabase = useSupabase();
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: progressKey(user?.id),
    queryFn: () => getAcademyProgress(supabase, user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}

/** Mark a module as completed (optimistic). */
export function useMarkModuleComplete() {
  const supabase = useSupabase();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) =>
      markModuleComplete(supabase, user!.id, moduleId),

    onMutate: async (moduleId) => {
      const key = progressKey(user?.id);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<string[]>(key) ?? [];
      qc.setQueryData<string[]>(key, (old) => {
        const next = [...(old ?? [])];
        if (!next.includes(moduleId)) next.push(moduleId);
        return next;
      });
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      qc.setQueryData(progressKey(user?.id), ctx?.prev);
      toast.error("Erro ao salvar progresso. Tente novamente.");
    },

    onSuccess: () => {
      toast.success("Módulo concluído! Progresso salvo.");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: progressKey(user?.id) });
    },
  });
}

/** Remove completion mark from a module (optimistic). */
export function useMarkModuleIncomplete() {
  const supabase = useSupabase();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) =>
      markModuleIncomplete(supabase, user!.id, moduleId),

    onMutate: async (moduleId) => {
      const key = progressKey(user?.id);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<string[]>(key) ?? [];
      qc.setQueryData<string[]>(key, (old) =>
        (old ?? []).filter((id) => id !== moduleId)
      );
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      qc.setQueryData(progressKey(user?.id), ctx?.prev);
      toast.error("Erro ao atualizar progresso.");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: progressKey(user?.id) });
    },
  });
}
