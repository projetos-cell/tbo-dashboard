"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useCallback } from "react";
import type {
  MyTasksSection,
  MyTasksOrder,
  MyTaskWithSection,
} from "@/features/tasks/services/my-tasks";
import {
  getMyTasks,
  getMyTasksSections,
  getMyTasksOrder,
  createMyTasksSection,
  updateMyTasksSection,
  deleteMyTasksSection,
  reorderSections,
  upsertMyTaskOrder,
  upsertMyTaskOrders,
  ensureDefaultSection,
  getMyTasksPreferences,
  upsertMyTasksPreferences,
} from "@/features/tasks/services/my-tasks";

// ─── Query Keys ──────────────────────────────────────────────

export const myTasksKeys = {
  all: ["my-tasks"] as const,
  tasks: (userId: string) => ["my-tasks", "tasks", userId] as const,
  sections: (userId: string) => ["my-tasks", "sections", userId] as const,
  order: (userId: string) => ["my-tasks", "order", userId] as const,
  preferences: (userId: string) => ["my-tasks", "preferences", userId] as const,
};

// ─── My Tasks (filtered to user) ─────────────────────────────

export function useMyTasks(showCompleted: boolean = false) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: [...myTasksKeys.tasks(userId ?? ""), showCompleted],
    queryFn: () => getMyTasks(supabase, userId!, showCompleted),
    staleTime: 1000 * 60 * 2,
    enabled: !!userId && !!tenantId,
  });
}

// ─── Sections ─────────────────────────────────────────────────

export function useMyTasksSections() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  // Ensure default section exists on first load
  useEffect(() => {
    if (userId && tenantId) {
      ensureDefaultSection(supabase, userId, tenantId).catch(() => {
        // Ignore — section may already exist
      });
    }
  }, [supabase, userId, tenantId]);

  return useQuery({
    queryKey: myTasksKeys.sections(userId ?? ""),
    queryFn: () => getMyTasksSections(supabase, userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useCreateSection() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (params: { tenant_id: string; name: string; sort_order: number }) =>
      createMyTasksSection(supabase, { ...params, user_id: userId! }),

    onMutate: async (newSection) => {
      const key = myTasksKeys.sections(userId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyTasksSection[]>(key);

      queryClient.setQueryData<MyTasksSection[]>(key, (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          tenant_id: newSection.tenant_id,
          user_id: userId!,
          name: newSection.name,
          sort_order: newSection.sort_order,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(myTasksKeys.sections(userId ?? ""), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.sections(userId ?? "") });
    },
  });
}

export function useUpdateSection() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<MyTasksSection, "name" | "sort_order">> }) =>
      updateMyTasksSection(supabase, id, updates),

    onMutate: async ({ id, updates }) => {
      const key = myTasksKeys.sections(userId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyTasksSection[]>(key);

      queryClient.setQueryData<MyTasksSection[]>(key, (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(myTasksKeys.sections(userId ?? ""), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.sections(userId ?? "") });
    },
  });
}

export function useDeleteSection() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (id: string) => deleteMyTasksSection(supabase, id),

    onMutate: async (id) => {
      const key = myTasksKeys.sections(userId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyTasksSection[]>(key);

      queryClient.setQueryData<MyTasksSection[]>(key, (old) =>
        old?.filter((s) => s.id !== id)
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(myTasksKeys.sections(userId ?? ""), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.all });
    },
  });
}

export function useReorderSections() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (sections: { id: string; sort_order: number }[]) =>
      reorderSections(supabase, sections),

    onMutate: async (newOrder) => {
      const key = myTasksKeys.sections(userId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyTasksSection[]>(key);

      queryClient.setQueryData<MyTasksSection[]>(key, (old) => {
        if (!old) return old;
        const orderMap = new Map(newOrder.map((o) => [o.id, o.sort_order]));
        return old
          .map((s) => ({
            ...s,
            sort_order: orderMap.get(s.id) ?? s.sort_order,
          }))
          .sort((a, b) => a.sort_order - b.sort_order);
      });
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(myTasksKeys.sections(userId ?? ""), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.sections(userId ?? "") });
    },
  });
}

// ─── Task Order (move task between sections) ──────────────────

export function useMyTasksOrder() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: myTasksKeys.order(userId ?? ""),
    queryFn: () => getMyTasksOrder(supabase, userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useMoveTaskToSection() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (params: { task_id: string; section_id: string | null; sort_order: number }) =>
      upsertMyTaskOrder(supabase, {
        user_id: userId!,
        task_id: params.task_id,
        section_id: params.section_id,
        sort_order: params.sort_order,
      }),

    onMutate: async (params) => {
      const tasksKey = myTasksKeys.tasks(userId ?? "");
      await queryClient.cancelQueries({ queryKey: tasksKey });
      const previous = queryClient.getQueryData<MyTaskWithSection[]>(tasksKey);

      queryClient.setQueryData<MyTaskWithSection[]>(tasksKey, (old) =>
        old?.map((t) =>
          t.id === params.task_id
            ? { ...t, my_section_id: params.section_id, my_sort_order: params.sort_order }
            : t
        )
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        const key = myTasksKeys.tasks(userId ?? "");
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.all });
    },
  });
}

export function useBatchUpdateTaskOrder() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (orders: Omit<MyTasksOrder, "user_id">[]) =>
      upsertMyTaskOrders(
        supabase,
        orders.map((o) => ({ ...o, user_id: userId! }))
      ),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myTasksKeys.all });
    },
  });
}

// ─── Preferences ──────────────────────────────────────────────

export function useMyTasksPreferences() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: myTasksKeys.preferences(userId ?? ""),
    queryFn: () => getMyTasksPreferences(supabase, userId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
  });
}

export function useUpdateMyTasksPreferences() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (prefs: Record<string, unknown>) =>
      upsertMyTasksPreferences(supabase, {
        user_id: userId!,
        tenant_id: tenantId!,
        ...prefs,
      } as never),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: myTasksKeys.preferences(userId ?? ""),
      });
    },
  });
}

// ─── Realtime subscription ────────────────────────────────────

export function useMyTasksRealtime() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("my-tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "os_tasks",
          filter: `assignee_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: myTasksKeys.tasks(userId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, userId]);
}

// ─── Utility: group tasks by section ──────────────────────────

export function groupTasksBySection(
  tasks: MyTaskWithSection[],
  sections: MyTasksSection[]
): Map<string, MyTaskWithSection[]> {
  const groups = new Map<string, MyTaskWithSection[]>();

  // Initialize groups for all sections
  for (const section of sections) {
    groups.set(section.id, []);
  }

  // Special "unassigned" group for tasks without a section
  const unassigned: MyTaskWithSection[] = [];

  for (const task of tasks) {
    if (task.my_section_id && groups.has(task.my_section_id)) {
      groups.get(task.my_section_id)!.push(task);
    } else {
      // Task has no section — put in default section
      const defaultSection = sections.find((s) => s.is_default);
      if (defaultSection) {
        groups.get(defaultSection.id)!.push(task);
      } else {
        unassigned.push(task);
      }
    }
  }

  // Sort tasks within each section by sort_order
  for (const [, sectionTasks] of groups) {
    sectionTasks.sort((a, b) => a.my_sort_order - b.my_sort_order);
  }

  // If there are unassigned tasks and no default section, create a virtual group
  if (unassigned.length > 0) {
    groups.set("__unassigned__", unassigned);
  }

  return groups;
}
