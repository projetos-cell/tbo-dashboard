"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { taskKeys } from "@/lib/query/task-keys";
import {
  getTaskDependencies,
  createTaskDependency,
  deleteTaskDependency,
  checkCircularDependency,
} from "@/features/tasks/services/task-dependencies";
import type { TaskDependency, CreateDependencyInput } from "@/schemas/task-dependency";

// ─── Query ─────────────────────────────────────────────

export function useTaskDependencies(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: taskKeys.dependencies(taskId),
    queryFn: () => getTaskDependencies(supabase, taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && !!taskId,
  });
}

// ─── Add Dependency ────────────────────────────────────

export function useAddDependency(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDependencyInput) => {
      const circular = await checkCircularDependency(
        supabase,
        input.predecessor_id,
        input.successor_id
      );
      if (circular) {
        throw new Error("Dependência criaria um ciclo");
      }
      return createTaskDependency(supabase, input);
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.dependencies(taskId),
      });

      const previous = queryClient.getQueryData<TaskDependency[]>(
        taskKeys.dependencies(taskId)
      );

      // Optimistic insert
      const optimistic: TaskDependency = {
        id: `optimistic-${Date.now()}`,
        predecessor_id: input.predecessor_id,
        successor_id: input.successor_id,
        dependency_type: input.dependency_type ?? "finish_to_start",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<TaskDependency[]>(
        taskKeys.dependencies(taskId),
        (old = []) => [...old, optimistic]
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(taskKeys.dependencies(taskId), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.dependencies(taskId) });
    },
  });
}

// ─── Remove Dependency ─────────────────────────────────

export function useRemoveDependency(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (depId: string) => deleteTaskDependency(supabase, depId),

    onMutate: async (depId) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.dependencies(taskId),
      });

      const previous = queryClient.getQueryData<TaskDependency[]>(
        taskKeys.dependencies(taskId)
      );

      queryClient.setQueryData<TaskDependency[]>(
        taskKeys.dependencies(taskId),
        (old = []) => old.filter((d) => d.id !== depId)
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(taskKeys.dependencies(taskId), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.dependencies(taskId) });
    },
  });
}
