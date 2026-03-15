"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { getActorName } from "@/services/alerts";
import {
  notifyTaskAssigned,
  notifyTaskUpdated,
} from "@/services/notification-triggers";
import type { Database } from "@/lib/supabase/types";
import {
  getTasks,
  getTaskById,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/features/tasks/services/tasks";
import { addCollaborator } from "@/features/tasks/services/task-collaborators";
import { addTaskToProject } from "@/features/tasks/services/task-projects";

export function useTasks(filters?: {
  status?: string;
  assignee_name?: string;
  project_id?: string;
  priority?: string;
}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["tasks", tenantId, filters],
    queryFn: () => getTasks(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useTask(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskById(supabase, id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!tenantId,
  });
}

export function useSubtasks(parentId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => getSubtasks(supabase, parentId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!parentId && !!tenantId,
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

  return useMutation({
    mutationFn: (task: Database["public"]["Tables"]["os_tasks"]["Insert"]) =>
      createTask(supabase, task),

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["tasks"] });
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueriesData<TaskRow[]>(
        { queryKey: ["tasks"] },
        (old) =>
          old
            ? [
                ...old,
                {
                  ...newTask,
                  id: tempId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as unknown as TaskRow,
              ]
            : old
      );
      return { previousTasks };
    },

    onSuccess: (createdTask, variables) => {
      // Auto-add criador como colaborador
      if (createdTask.created_by) {
        addCollaborator(supabase, createdTask.id, createdTask.created_by).catch(
          () => undefined
        );
      }

      // Auto-link tarefa ao projeto (tabela task_projects)
      if (variables.project_id) {
        addTaskToProject(createdTask.id, variables.project_id).catch(
          () => undefined
        );
      }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        for (const [queryKey, data] of context.previousTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: (createdTask, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (variables.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project-tasks", variables.project_id] });
        queryClient.invalidateQueries({ queryKey: ["project-task-stats", variables.project_id] });
      }
      // Invalidar cache de task-projects para refletir vínculo automático
      if (createdTask?.id) {
        queryClient.invalidateQueries({ queryKey: ["task-projects", createdTask.id] });
      }
    },
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

  return useMutation({
    mutationFn: ({
      id,
      updates,
      previousTask,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["os_tasks"]["Update"];
      previousTask?: TaskRow | null;
    }) => {
      return updateTask(supabase, id, updates);
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["project-tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task-detail", variables.id] });

      const previousTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["tasks"] });
      const previousProjectTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["project-tasks"] });

      // Optimistic update on list caches
      queryClient.setQueriesData<TaskRow[]>(
        { queryKey: ["tasks"] },
        (old) =>
          old?.map((task) =>
            task.id === variables.id ? { ...task, ...variables.updates } : task
          )
      );

      // Optimistic update on project-tasks caches
      queryClient.setQueriesData<TaskRow[]>(
        { queryKey: ["project-tasks"] },
        (old) =>
          old?.map((task) =>
            task.id === variables.id ? { ...task, ...variables.updates } : task
          )
      );

      // Optimistic update on detail cache
      const previousDetail = queryClient.getQueryData<TaskRow>(["task-detail", variables.id]);
      if (previousDetail) {
        queryClient.setQueryData<TaskRow>(
          ["task-detail", variables.id],
          { ...previousDetail, ...variables.updates }
        );
      }

      return { previousTasks, previousProjectTasks, previousDetail };
    },

    onError: (_err, variables, context) => {
      if (context?.previousTasks) {
        for (const [queryKey, data] of context.previousTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousProjectTasks) {
        for (const [queryKey, data] of context.previousProjectTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["task-detail", variables.id], context.previousDetail);
      }
    },

    onSuccess: async (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["task-detail"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      const tenantId = useAuthStore.getState().tenantId;
      const action = variables.updates.status ? "status_change" : "update";

      logAuditTrail({
        userId,
        action,
        table: "tasks",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });

      // ─── Notification triggers (fire-and-forget) ───
      if (!tenantId || userId === "unknown") return;

      try {
        const actorName = await getActorName(supabase, userId);
        const taskTitle = updatedTask?.title ?? variables.previousTask?.title ?? "Tarefa";
        const taskAssignee = updatedTask?.assignee_id ?? variables.previousTask?.assignee_id ?? null;
        const prevAssignee = variables.previousTask?.assignee_id ?? null;

        // Task assigned: assignee changed to a new person
        if (
          variables.updates.assignee_id &&
          variables.updates.assignee_id !== prevAssignee
        ) {
          notifyTaskAssigned(supabase, {
            tenantId,
            actorId: userId,
            actorName,
            taskId: variables.id,
            taskTitle,
            newAssigneeId: variables.updates.assignee_id,
          });
        }

        // Task updated: notify current assignee of relevant field changes
        if (taskAssignee && taskAssignee !== userId) {
          notifyTaskUpdated(supabase, {
            tenantId,
            actorId: userId,
            actorName,
            taskId: variables.id,
            taskTitle,
            assigneeId: taskAssignee,
            changedFields: variables.updates as Record<string, unknown>,
          });
        }
      } catch {
        // Notification errors should never block the main flow
      }
    },
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

  return useMutation({
    mutationFn: (id: string) => deleteTask(supabase, id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["tasks"] });
      queryClient.setQueriesData<TaskRow[]>(
        { queryKey: ["tasks"] },
        (old) => old?.filter((task) => task.id !== id)
      );
      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        for (const [queryKey, data] of context.previousTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSuccess: (_data, id) => {
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "tasks",
        recordId: id,
        before: { id },
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
