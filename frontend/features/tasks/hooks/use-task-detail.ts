"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTaskById } from "@/features/tasks/services/tasks";
import { getTaskTags } from "@/features/tasks/services/task-tags";
import type { Database } from "@/lib/supabase/types";
import type { Tag } from "@/schemas/tag";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export const taskDetailKeys = {
  detail: (id: string) => ["task-detail", id] as const,
  tags: (id: string) => ["task-detail-tags", id] as const,
};

/** Fetch a single task by ID for the detail panel */
export function useTaskDetail(taskId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: taskDetailKeys.detail(taskId!),
    queryFn: () => getTaskById(supabase, taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

/** Fetch tags for a task */
export function useTaskDetailTags(taskId: string | undefined) {
  const supabase = createClient();

  return useQuery<Tag[]>({
    queryKey: taskDetailKeys.tags(taskId!),
    queryFn: () => getTaskTags(supabase, taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2,
  });
}

/** URL param sync: read/write ?task=<id> */
export function useTaskDetailParam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const taskId = searchParams.get("task") || undefined;

  const openTask = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("task", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const closeTask = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  return { taskId, openTask, closeTask };
}
