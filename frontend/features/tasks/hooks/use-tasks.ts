"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { useToast } from "@/hooks/use-toast";
import { getActorName } from "@/services/alerts";
import {
  notifyTaskAssigned,
  notifyTaskUpdated,
} from "@/services/notification-triggers";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
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
  const { toast: toastCreate } = useToast();

  type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

  return useMutation({
    mutationFn: (task: Database["public"]["Tables"]["os_tasks"]["Insert"]) =>
      createTask(supabase, task),

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["project-tasks"] });
      const previousTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["tasks"] });
      const previousProjectTasks = queryClient.getQueriesData<TaskRow[]>({ queryKey: ["project-tasks"] });
      const tempId = `temp-${Date.now()}`;
      const tempRow = {
        ...newTask,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_completed: false,
        order_index: 9999,
      } as unknown as TaskRow;

      queryClient.setQueriesData<TaskRow[]>(
        { queryKey: ["tasks"] },
        (old) => (old ? [...old, tempRow] : [tempRow]),
      );

      // Optimistic update on project-tasks so task appears immediately in project view
      if (newTask.project_id) {
        queryClient.setQueriesData<TaskRow[]>(
          { queryKey: ["project-tasks"] },
          (old) => (old ? [...old, tempRow] : [tempRow]),
        );
      }

      return { previousTasks, previousProjectTasks };
    },

    onSuccess: (createdTask, variables) => {
      toastCreate({
        title: `Tarefa criada — "${createdTask.title}"`,
      });

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
      if (context?.previousProjectTasks) {
        for (const [queryKey, data] of context.previousProjectTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toastCreate({
        title: "Erro ao criar tarefa",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },

    onSettled: (createdTask, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate all project-tasks caches (broad match ensures tenantId variant is hit)
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      if (variables.project_id) {
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
  const { toast: toastUpdate } = useToast();

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
      toastUpdate({
        title: "Erro ao atualizar tarefa",
        description: "As alterações não foram salvas. Tente novamente.",
        variant: "destructive",
      });
    },

    onSuccess: async (updatedTask, variables) => {
      // UX06 — contextual toast based on what changed
      if (variables.updates.status) {
        const statusLabel = TASK_STATUS[variables.updates.status as TaskStatusKey]?.label ?? variables.updates.status;
        toastUpdate({ title: `Tarefa movida para ${statusLabel}` });
      } else if (variables.updates.assignee_name) {
        toastUpdate({ title: `Tarefa atribuída a ${variables.updates.assignee_name}` });
      } else if (variables.updates.is_completed === true) {
        toastUpdate({ title: `Tarefa concluída — "${updatedTask?.title ?? "Tarefa"}"` });
      } else if (variables.updates.priority) {
        toastUpdate({ title: "Prioridade atualizada" });
      } else if (variables.updates.due_date !== undefined) {
        toastUpdate({ title: "Prazo atualizado" });
      }
      // Don't toast for minor field changes (description, etc.) to avoid noise
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["task-detail"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["task-history", variables.id] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      const tenantId = useAuthStore.getState().tenantId;
      const action = variables.updates.status ? "status_change" : "update";

      // Build before state from previousTask for visual diff
      const beforeState: Record<string, unknown> = {};
      if (variables.previousTask) {
        for (const key of Object.keys(variables.updates)) {
          beforeState[key] = (variables.previousTask as Record<string, unknown>)[key];
        }
      }

      logAuditTrail({
        userId,
        action,
        table: "tasks",
        recordId: variables.id,
        before: Object.keys(beforeState).length > 0 ? beforeState : undefined,
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
  const { toast: toastDelete } = useToast();

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
      toastDelete({
        title: "Erro ao excluir tarefa",
        description: "A tarefa não foi removida. Tente novamente.",
        variant: "destructive",
      });
    },

    onSuccess: (_data, id) => {
      toastDelete({ title: "Tarefa excluída" });

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
