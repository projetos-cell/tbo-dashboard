"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getTasks,
  getTaskById,
  getSubtasks,
} from "@/features/tasks/services/tasks";

// Re-export mutations from split file for backwards compatibility
export { useCreateTask, useUpdateTask, useDeleteTask } from "./use-task-mutations";

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
