"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import {
  createProjectSection,
  updateProjectSection,
  deleteProjectSection,
  reorderProjectSections,
  moveTaskToSection,
  reorderTasks,
} from "@/features/projects/services/project-tasks";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type SectionRow = Database["public"]["Tables"]["os_sections"]["Row"];

export function useCreateProjectSection(projectId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: { title: string; color?: string; order_index: number }) => {
      const role = useAuthStore.getState().role;
      if (!hasMinRole(role, "lider")) {
        throw new Error("Permissão insuficiente para criar seção.");
      }
      return createProjectSection(supabase, {
        project_id: projectId!,
        tenant_id: tenantId!,
        ...params,
      });
    },

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
          default_assignee_id: null,
          default_priority: null,
          default_status: null,
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
      toast.error("Erro ao criar seção. Tente novamente.");
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<SectionRow, "title" | "color" | "order_index" | "default_status" | "default_priority" | "default_assignee_id">> }) => {
      const role = useAuthStore.getState().role;
      if (!hasMinRole(role, "lider")) {
        throw new Error("Permissão insuficiente para atualizar seção.");
      }
      return updateProjectSection(supabase, id, updates);
    },

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
      toast.error("Erro ao atualizar seção. Tente novamente.");
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
    mutationFn: (id: string) => {
      const role = useAuthStore.getState().role;
      if (!hasMinRole(role, "lider")) {
        throw new Error("Permissão insuficiente para excluir seção.");
      }
      return deleteProjectSection(supabase, id);
    },

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
      toast.error("Erro ao excluir seção. Tente novamente.");
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
      toast.error("Erro ao reordenar seções. Ordem revertida.");
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
    mutationFn: (params: {
      taskId: string;
      sectionId: string | null;
      orderIndex: number;
      sectionDefaults?: {
        default_status?: string | null;
        default_priority?: string | null;
        default_assignee_id?: string | null;
      };
    }) =>
      moveTaskToSection(supabase, params.taskId, params.sectionId, params.orderIndex, params.sectionDefaults),

    onMutate: async (params) => {
      const key = ["project-tasks", projectId, tenantId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskRow[]>(key);

      queryClient.setQueryData<TaskRow[]>(key, (old) =>
        old?.map((t) => {
          if (t.id !== params.taskId) return t;
          const updated = { ...t, section_id: params.sectionId, order_index: params.orderIndex };
          if (params.sectionDefaults?.default_status) {
            (updated as Record<string, unknown>).status = params.sectionDefaults.default_status;
          }
          if (params.sectionDefaults?.default_priority) {
            (updated as Record<string, unknown>).priority = params.sectionDefaults.default_priority;
          }
          if (params.sectionDefaults?.default_assignee_id) {
            (updated as Record<string, unknown>).assignee_id = params.sectionDefaults.default_assignee_id;
          }
          return updated;
        }),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["project-tasks", projectId, tenantId], context.previous);
      }
      toast.error("Erro ao mover tarefa. Posição revertida.");
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
      toast.error("Erro ao reordenar tarefas. Ordem revertida.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId, tenantId] });
    },
  });
}
