"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskHistory } from "@/features/tasks/services/task-history";

export function useTaskHistory(taskId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["task-history", taskId],
    queryFn: () => getTaskHistory(taskId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId && enabled,
  });
}
