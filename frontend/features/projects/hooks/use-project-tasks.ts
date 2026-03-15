"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getProjectTasks,
  getProjectSections,
  getProjectTaskStats,
  createProjectSection,
  updateProjectSection,
  deleteProjectSection,
  reorderProjectSections,
  moveTaskToSection,
  reorderTasks,
} from "@/features/projects/services/project-tasks";
import { getDependenciesByTaskIds } from "@/features/tasks/services/task-dependencies";
import type { TaskDependency } from "@/schemas/task-dependency";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

/** All tasks for a project, split into parents + subtasksMap. */
export function useProjectTasks(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const query = useQuery({
    queryKey: ["project-tasks", projectId, tenantId],
    queryFn: () => getProjectTasks(supabase, projectId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });

  const structured = useMemo(() => {
    const allTasks = query.data ?? [];
    const parents: TaskRow[] = [];
    const subtasksMap = new Map<string, TaskRow[]>();

    for (const task of allTasks) {
      if (task.parent_id) {
        const list = subtasksMap.get(task.parent_id) ?? [];
        list.push(task);
        subtasksMap.set(task.parent_id, list);
      } else {
        parents.push(task);
      }
    }

    return { parents, subtasksMap, allTasks };
  }, [query.data]);

  return { ...query, ...structured };
}

/** Sections for a project. */
export function useProjectSections(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["project-sections", projectId, tenantId],
    queryFn: () => getProjectSections(supabase, projectId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });
}

/** All dependencies for tasks in this project (for Gantt arrows). */
export function useProjectDependencies(taskIds: string[]) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const key = taskIds.length > 0 ? taskIds.join(",") : "none";

  return useQuery<TaskDependency[]>({
    queryKey: ["project-dependencies", key, tenantId],
    queryFn: () => getDependenciesByTaskIds(supabase, taskIds),
    staleTime: 1000 * 60 * 3,
    enabled: taskIds.length > 0 && !!tenantId,
  });
}

/** Task statistics for the project overview dashboard. */
export function useProjectTaskStats(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["project-task-stats", projectId, tenantId],
    queryFn: () => getProjectTaskStats(supabase, projectId!),
    staleTime: 1000 * 60 * 3,
    enabled: !!projectId && !!tenantId,
  });
}

// ─── Section Mutations ─────────────────────────────────────────

type SectionRow = Database["public"]["Tables"]["os_sections"]["Row"];

export function useCreateProjectSection(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: { title: string; color?: string; order_index: number }) =>
      createProjectSection(supabase, {
        project_id: projectId!,
        tenant_id: tenantId!,
        ...params,
      }),

    onMutate: async (newSection) => {
      const key = ["project-sections", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SectionRow[]>(key);

      queryClient.setQueryData<SectionRow[]>(key, (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          project_id: projectId!,
          tenant_id: tenantId!,
          title: newSection.title,
          color: newSection.color ?? null,
          order_index: newSection.order_index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-sections", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId, tenantId] });
    },
  });
}

export function useUpdateProjectSection(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<SectionRow, "title" | "color" | "order_index">> }) =>
      updateProjectSection(supabase, id, updates),

    onMutate: async ({ id, updates }) => {
      const key = ["project-sections", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SectionRow[]>(key);

      queryClient.setQueryData<SectionRow[]>(key, (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-sections", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId, tenantId] });
    },
  });
}

export function useDeleteProjectSection(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => deleteProjectSection(supabase, id),

    onMutate: async (id) => {
      const key = ["project-sections", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SectionRow[]>(key);

      queryClient.setQueryData<SectionRow[]>(key, (old) =>
        old?.filter((s) => s.id !== id),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-sections", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId, tenantId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId, tenantId] });
    },
  });
}

export function useReorderProjectSections(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (sections: { id: string; order_index: number }[]) =>
      reorderProjectSections(supabase, sections),

    onMutate: async (newOrder) => {
      const key = ["project-sections", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SectionRow[]>(key);

      queryClient.setQueryData<SectionRow[]>(key, (old) => {
        if (!old) return old;
        const orderMap = new Map(newOrder.map((o) => [o.id, o.order_index]));
        return old
          .map((s) => ({
            ...s,
            order_index: orderMap.get(s.id) ?? s.order_index,
          }))
          .sort((a, b) => a.order_index - b.order_index);
      });
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-sections", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId, tenantId] });
    },
  });
}

export function useMoveProjectTask(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: { taskId: string; sectionId: string | null; orderIndex: number }) =>
      moveTaskToSection(supabase, params.taskId, params.sectionId, params.orderIndex),

    onMutate: async (params) => {
      const key = ["project-tasks", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskRow[]>(key);

      queryClient.setQueryData<TaskRow[]>(key, (old) =>
        old?.map((t) =>
          t.id === params.taskId
            ? { ...t, section_id: params.sectionId, order_index: params.orderIndex }
            : t,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-tasks", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId, tenantId] });
    },
  });
}

export function useReorderProjectTasks(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (tasks: { id: string; order_index: number; section_id?: string | null }[]) =>
      reorderTasks(supabase, tasks),

    onMutate: async (newOrder) => {
      const key = ["project-tasks", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskRow[]>(key);

      queryClient.setQueryData<TaskRow[]>(key, (old) => {
        if (!old) return old;
        const orderMap = new Map(newOrder.map((o) => [o.id, o]));
        return old.map((t) => {
          const update = orderMap.get(t.id);
          if (!update) return t;
          return {
            ...t,
            order_index: update.order_index,
            ...(update.section_id !== undefined ? { section_id: update.section_id } : {}),
          };
        });
      });
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-tasks", projectId, tenantId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId, tenantId] });
    },
  });
}
