"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getTaskFollowers,
  followTask,
  unfollowTask,
} from "@/features/tasks/services/task-followers";

export function useTaskFollowers(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task-followers", taskId],
    queryFn: () => getTaskFollowers(supabase, taskId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId && !!tenantId,
  });
}

export function useFollowTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskId: string) => {
      if (!userId || !tenantId) throw new Error("Not authenticated");
      return followTask(supabase, taskId, userId, tenantId);
    },
    onSuccess: (_data, taskId) => {
      toast({ title: "Seguindo tarefa" });
      queryClient.invalidateQueries({ queryKey: ["task-followers", taskId] });
    },
    onError: () => {
      toast({ title: "Erro ao seguir tarefa", variant: "destructive" });
    },
  });
}

export function useUnfollowTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskId: string) => {
      if (!userId) throw new Error("Not authenticated");
      return unfollowTask(supabase, taskId, userId);
    },
    onSuccess: (_data, taskId) => {
      toast({ title: "Deixou de seguir tarefa" });
      queryClient.invalidateQueries({ queryKey: ["task-followers", taskId] });
    },
    onError: () => {
      toast({ title: "Erro ao deixar de seguir", variant: "destructive" });
    },
  });
}
