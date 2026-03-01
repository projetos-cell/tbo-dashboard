"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import type { Database } from "@/lib/supabase/types";
import {
  getTasks,
  getTaskById,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/tasks";

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
    queryFn: () => getTasks(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useTask(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskById(supabase, id!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!tenantId,
  });
}

export function useSubtasks(parentId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => getSubtasks(supabase, parentId!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!parentId && !!tenantId,
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Database["public"]["Tables"]["os_tasks"]["Insert"]) =>
      createTask(supabase, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["os_tasks"]["Update"];
    }) => updateTask(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      const action = variables.updates.status ? "status_change" : "update";
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action,
        table: "tasks",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(supabase, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "tasks",
        recordId: id,
        before: { id },
      });
    },
  });
}
