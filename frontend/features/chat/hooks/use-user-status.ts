"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getUserStatus, setUserStatus, clearUserStatus, type UserStatus } from "@/features/chat/services/user-status";
import { toast } from "sonner";

export function useUserStatus(userId?: string | null) {
  const supabase = createClient();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const targetId = userId ?? currentUserId;

  return useQuery({
    queryKey: ["user-status", targetId],
    queryFn: () => getUserStatus(supabase, targetId!),
    staleTime: 1000 * 60 * 2, // 2 min
    enabled: !!targetId,
  });
}

export function useSetUserStatus() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (status: UserStatus) => {
      if (!userId) throw new Error("Not authenticated");
      return setUserStatus(supabase, userId, status);
    },
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: ["user-status", userId] });
      const prev = qc.getQueryData<UserStatus>(["user-status", userId]);
      qc.setQueryData(["user-status", userId], status);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(["user-status", userId], ctx.prev);
      }
      toast.error("Erro ao atualizar status");
    },
    onSuccess: () => {
      toast.success("Status atualizado");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["user-status", userId] });
    },
  });
}

export function useClearUserStatus() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("Not authenticated");
      return clearUserStatus(supabase, userId);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["user-status", userId] });
      const prev = qc.getQueryData<UserStatus>(["user-status", userId]);
      qc.setQueryData(["user-status", userId], { emoji: null, text: null, expiresAt: null });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(["user-status", userId], ctx.prev);
      }
      toast.error("Erro ao limpar status");
    },
    onSuccess: () => {
      toast.success("Status removido");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["user-status", userId] });
    },
  });
}
