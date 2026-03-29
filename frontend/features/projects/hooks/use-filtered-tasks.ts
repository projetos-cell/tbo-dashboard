import { useMemo } from "react";
import { useProjectTasks, useProjectSections } from "./use-project-tasks";
import { useProjectTaskFilters } from "@/stores/task-filters-store";
import { sortTasks, groupTasks } from "@/features/projects/components/tabs/task-list-helpers";
import type { TaskListFilters } from "@/features/projects/components/tabs/project-tasks-toolbar";

/**
 * Shared hook: fetches tasks + applies filters from the Zustand store.
 * Used by List, Board, Gantt, and Calendar views.
 */
export function useFilteredTasks(projectId: string) {
  const { parents, subtasksMap, allTasks, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const [filters] = useProjectTaskFilters(projectId);

  const filtered = useMemo(() => {
    let items = parents.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(t.title || "").toLowerCase().includes(q) &&
          !(t.assignee_name || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    if (filters.customFilters.length > 0) {
      items = items.filter((t) =>
        filters.customFilters.every((f) => {
          switch (f.field) {
            case "status":
              return t.status === f.value;
            case "priority":
              return t.priority === f.value;
            default:
              return true;
          }
        }),
      );
    }

    return items;
  }, [parents, filters]);

  const processed = useMemo(() => {
    const sorted = sortTasks(filtered, filters.sortField, filters.sortDir);
    return groupTasks(sorted, filters.groupBy, sections ?? undefined);
  }, [filtered, filters.sortField, filters.sortDir, filters.groupBy, sections]);

  return {
    parents,
    filtered,
    processed,
    subtasksMap,
    allTasks,
    sections,
    isLoading,
    filters,
  };
}
