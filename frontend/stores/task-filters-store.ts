import { create } from "zustand";
import type {
  TaskListFilters,
  TaskSortField,
  TaskSortDir,
  TaskGroupField,
  TaskCustomFilter,
} from "@/features/projects/components/tabs/project-tasks-toolbar";

const DEFAULT_FILTERS: TaskListFilters = {
  search: "",
  status: "all",
  sortField: "order_index",
  sortDir: "asc",
  groupBy: "none",
  customFilters: [],
};

interface TaskFiltersState {
  /** Per-project filter state keyed by projectId */
  filters: Record<string, TaskListFilters>;
  getFilters: (projectId: string) => TaskListFilters;
  setFilters: (projectId: string, filters: TaskListFilters) => void;
  updateFilter: <K extends keyof TaskListFilters>(
    projectId: string,
    key: K,
    value: TaskListFilters[K],
  ) => void;
  resetFilters: (projectId: string) => void;
}

export const useTaskFiltersStore = create<TaskFiltersState>((set, get) => ({
  filters: {},

  getFilters: (projectId) => get().filters[projectId] ?? DEFAULT_FILTERS,

  setFilters: (projectId, filters) =>
    set((s) => ({ filters: { ...s.filters, [projectId]: filters } })),

  updateFilter: (projectId, key, value) =>
    set((s) => {
      const current = s.filters[projectId] ?? DEFAULT_FILTERS;
      return { filters: { ...s.filters, [projectId]: { ...current, [key]: value } } };
    }),

  resetFilters: (projectId) =>
    set((s) => ({ filters: { ...s.filters, [projectId]: DEFAULT_FILTERS } })),
}));

/** Convenience hook — returns [filters, setFilters] tuple for a project */
export function useProjectTaskFilters(projectId: string) {
  const filters = useTaskFiltersStore((s) => s.getFilters(projectId));
  const setFilters = useTaskFiltersStore((s) => s.setFilters);
  return [filters, (f: TaskListFilters) => setFilters(projectId, f)] as const;
}
