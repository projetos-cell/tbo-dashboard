"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getAssignees,
  addAssignee,
  removeAssignee,
  getAssigneesByProject,
} from "@/features/tasks/services/task-assignees";
import type { Database } from "@/lib/supabase/types";

type AssigneeRow = Database["public"]["Tables"]["task_assignees"]["Row"];

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
    queryFn: () => getAssignees(supabase, taskId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!taskId,
  });
}

/** Bulk-load all assignees for a project, returns Map<taskId, AssigneeRow[]>. */
export function useProjectTaskAssignees(projectId: string | undefined) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  const query = useQuery({
    queryKey: ["project-task-assignees", projectId, tenantId],
    queryFn: () => getAssigneesByProject(supabase, projectId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });

  const assigneeMap = useMemo(() => {
    const map = new Map<string, AssigneeRow[]>();
    for (const row of query.data ?? []) {
      const list = map.get(row.task_id) ?? [];
      list.push(row);
      map.set(row.task_id, list);
    }
    return map;
  }, [query.data]);

  return { ...query, assigneeMap };
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
      queryClient.invalidateQueries({
        queryKey: ["project-task-assignees"],
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
      queryClient.invalidateQueries({
        queryKey: ["project-task-assignees"],
      });
    },
  });
}
