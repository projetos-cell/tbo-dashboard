"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTaskProjects,
  addTaskToProject,
  removeTaskFromProject,
  type TaskProject,
} from "@/features/tasks/services/task-projects";

// ─── Query Keys ───────────────────────────────────────

export const taskProjectKeys = {
  list: (taskId: string) => ["task-projects", taskId] as const,
};

// ─── Hooks ────────────────────────────────────────────

export function useTaskProjects(taskId: string | undefined) {
  return useQuery<TaskProject[]>({
    queryKey: taskProjectKeys.list(taskId!),
    queryFn: () => fetchTaskProjects(taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddTaskToProject(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => addTaskToProject(taskId, projectId),

    onMutate: async (projectId) => {
      const key = taskProjectKeys.list(taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskProject[]>(key);

      // Optimistic: add placeholder
      queryClient.setQueryData<TaskProject[]>(key, (old = []) => [
        ...old,
        {
          task_id: taskId,
          project_id: projectId,
          added_at: new Date().toISOString(),
          project: { id: projectId } as TaskProject["project"],
        },
      ]);

      return { previous };
    },

    onError: (_err, _projectId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(taskProjectKeys.list(taskId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskProjectKeys.list(taskId) });
    },
  });
}

export function useRemoveTaskFromProject(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => removeTaskFromProject(taskId, projectId),

    onMutate: async (projectId) => {
      const key = taskProjectKeys.list(taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskProject[]>(key);

      // Optimistic: remove
      queryClient.setQueryData<TaskProject[]>(key, (old = []) =>
        old.filter((tp) => tp.project_id !== projectId)
      );

      return { previous };
    },

    onError: (_err, _projectId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(taskProjectKeys.list(taskId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskProjectKeys.list(taskId) });
    },
  });
}
