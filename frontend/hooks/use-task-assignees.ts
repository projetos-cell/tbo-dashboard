"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getAssignees,
  addAssignee,
  removeAssignee,
} from "@/services/task-assignees";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useTaskAssignees(taskId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["task-assignees", taskId],
    queryFn: () => getAssignees(supabase, taskId, tenantId!),
    enabled: !!tenantId && !!taskId,
  });
}

export function useAddAssignee() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignee: Database["public"]["Tables"]["task_assignees"]["Insert"]) =>
      addAssignee(supabase, assignee),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-assignees", variables.task_id],
      });
    },
  });
}

export function useRemoveAssignee() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      removeAssignee(supabase, taskId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-assignees", variables.taskId],
      });
    },
  });
}
