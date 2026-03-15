"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getProjectTasks,
  getProjectSections,
  getProjectTaskStats,
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
