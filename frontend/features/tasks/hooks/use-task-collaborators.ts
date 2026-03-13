"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  type CollaboratorWithProfile,
} from "@/features/tasks/services/task-collaborators";

// ─── Query Keys ───────────────────────────────────────

export const collaboratorKeys = {
  byTask: (taskId: string) => ["task-collaborators", taskId] as const,
};

// ─── Query ────────────────────────────────────────────

export function useTaskCollaborators(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: collaboratorKeys.byTask(taskId),
    queryFn: () => getCollaborators(supabase, taskId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!taskId,
  });
}

// ─── Add Collaborator ─────────────────────────────────

export function useAddCollaborator() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      addCollaborator(supabase, taskId, userId),

    onMutate: async ({ taskId, userId }) => {
      await queryClient.cancelQueries({
        queryKey: collaboratorKeys.byTask(taskId),
      });

      const previous = queryClient.getQueryData<CollaboratorWithProfile[]>(
        collaboratorKeys.byTask(taskId)
      );

      // Optimistic: add placeholder
      queryClient.setQueryData<CollaboratorWithProfile[]>(
        collaboratorKeys.byTask(taskId),
        (old = []) => [
          ...old,
          {
            task_id: taskId,
            user_id: userId,
            added_at: new Date().toISOString(),
            full_name: "...",
            avatar_url: null,
            role: "colaborador",
          },
        ]
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(
          collaboratorKeys.byTask(ctx.taskId),
          ctx.previous
        );
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: collaboratorKeys.byTask(variables.taskId),
      });
    },
  });
}

// ─── Remove Collaborator ──────────────────────────────

export function useRemoveCollaborator() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      removeCollaborator(supabase, taskId, userId),

    onMutate: async ({ taskId, userId }) => {
      await queryClient.cancelQueries({
        queryKey: collaboratorKeys.byTask(taskId),
      });

      const previous = queryClient.getQueryData<CollaboratorWithProfile[]>(
        collaboratorKeys.byTask(taskId)
      );

      queryClient.setQueryData<CollaboratorWithProfile[]>(
        collaboratorKeys.byTask(taskId),
        (old = []) => old.filter((c) => c.user_id !== userId)
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(
          collaboratorKeys.byTask(ctx.taskId),
          ctx.previous
        );
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: collaboratorKeys.byTask(variables.taskId),
      });
    },
  });
}
