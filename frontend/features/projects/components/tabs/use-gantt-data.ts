import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useProjectTasks,
  useProjectSections,
  useProjectDependencies,
} from "@/features/projects/hooks/use-project-tasks";
import {
  getGanttBaseline,
  type GanttBaselineSnapshot,
} from "@/features/projects/services/gantt-baselines";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { GanttTaskItem } from "./gantt-task-list";
import type { GanttOptions } from "./gantt-controls";
import {
  type TaskRow,
  type GanttDataItem,
  SECTION_COLORS,
  ASSIGNEE_COLORS,
  getBarColor,
  buildGanttItem,
} from "./gantt-helpers";

interface UseGanttDataOptions {
  projectId: string;
  supabase: SupabaseClient<Database>;
  options: GanttOptions;
  collapsedSections: Set<string>;
  collapsedTasks: Set<string>;
  /** Optional set of task IDs from shared filters — only these parents will be shown */
  visibleTaskIds?: Set<string>;
}

export function useGanttData({
  projectId,
  supabase,
  options,
  collapsedSections,
  collapsedTasks,
  visibleTaskIds,
}: UseGanttDataOptions) {
  // Core data
  const { parents, subtasksMap, allTasks, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const taskIds = useMemo(() => allTasks.map((t) => t.id), [allTasks]);
  const { data: dependencies } = useProjectDependencies(taskIds);

  // Baseline query
  const { data: baseline } = useQuery({
    queryKey: ["gantt-baseline", projectId],
    queryFn: () => getGanttBaseline(supabase, projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId,
  });

  // Color maps
  const { sectionColorMap, assigneeColorMap } = useMemo(() => {
    const scm = new Map<string, string>();
    (sections ?? []).forEach((s, i) => {
      scm.set(s.id, s.color || SECTION_COLORS[i % SECTION_COLORS.length]);
    });

    const acm = new Map<string, string>();
    const assignees = new Set(allTasks.map((t) => t.assignee_id).filter(Boolean));
    let ai = 0;
    for (const id of assignees) {
      acm.set(id!, ASSIGNEE_COLORS[ai % ASSIGNEE_COLORS.length]);
      ai++;
    }

    return { sectionColorMap: scm, assigneeColorMap: acm };
  }, [sections, allTasks]);

  // Dependency map
  const depsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!dependencies) return map;
    for (const dep of dependencies) {
      const list = map.get(dep.successor_id) ?? [];
      list.push(dep.predecessor_id);
      map.set(dep.successor_id, list);
    }
    return map;
  }, [dependencies]);

  // Baseline snapshot map
  const baselineMap = useMemo(() => {
    const map = new Map<string, GanttBaselineSnapshot>();
    if (!baseline?.snapshot) return map;
    const snap =
      typeof baseline.snapshot === "string"
        ? (JSON.parse(baseline.snapshot) as GanttBaselineSnapshot[])
        : (baseline.snapshot as GanttBaselineSnapshot[]);
    for (const item of snap) {
      map.set(item.taskId, item);
    }
    return map;
  }, [baseline]);

  // Filter tasks (shared filters + gantt-specific complete/incomplete filter)
  const filteredParents = useMemo(() => {
    let filtered = parents;
    // Apply shared toolbar filters first
    if (visibleTaskIds) {
      filtered = filtered.filter((t) => visibleTaskIds.has(t.id));
    }
    if (options.filter === "incomplete") {
      filtered = filtered.filter((t) => !t.is_completed);
    } else if (options.filter === "complete") {
      filtered = filtered.filter((t) => t.is_completed);
    }
    return filtered;
  }, [parents, options.filter, visibleTaskIds]);

  // Build Gantt chart data + task list items (must be in sync)
  const { ganttData, taskListItems } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sectionOrder = new Map((sections ?? []).map((s, i) => [s.id, i]));

    // Group filtered parents by section
    const grouped = new Map<string, TaskRow[]>();
    const noSection: TaskRow[] = [];

    for (const t of filteredParents) {
      if (t.section_id && sectionOrder.has(t.section_id)) {
        const list = grouped.get(t.section_id) ?? [];
        list.push(t);
        grouped.set(t.section_id, list);
      } else {
        noSection.push(t);
      }
    }

    // Sort tasks within groups
    const sortByOrder = (a: TaskRow, b: TaskRow) =>
      (a.order_index ?? 0) - (b.order_index ?? 0);
    noSection.sort(sortByOrder);
    for (const list of grouped.values()) list.sort(sortByOrder);

    const items: GanttDataItem[] = [];
    const listItems: GanttTaskItem[] = [];

    // Helper: add a task + its subtasks
    const addTask = (task: TaskRow, isSubtask: boolean) => {
      if (!(task.start_date || task.due_date)) return;
      const color = getBarColor(task, options.colorBy, sectionColorMap, assigneeColorMap);
      items.push(buildGanttItem(task, depsMap, today, isSubtask, color));

      const hasSubs = (subtasksMap.get(task.id) ?? []).some(
        (s) => s.start_date || s.due_date,
      );
      listItems.push({
        id: task.id,
        name: isSubtask ? `  \u2514 ${task.title}` : task.title || "Sem t\u00edtulo",
        type: "task",
        isSubtask,
        hasSubtasks: !isSubtask && hasSubs,
        parentId: isSubtask ? undefined : undefined,
      });

      // Subtasks (if not collapsed)
      if (!isSubtask && !collapsedTasks.has(task.id)) {
        let subs = (subtasksMap.get(task.id) ?? []).filter(
          (s) => s.start_date || s.due_date,
        );
        if (options.filter === "incomplete") subs = subs.filter((s) => !s.is_completed);
        else if (options.filter === "complete") subs = subs.filter((s) => s.is_completed);
        for (const sub of subs) addTask(sub, true);
      }
    };

    // No-section tasks first
    for (const task of noSection) addTask(task, false);

    // Then each section
    for (const section of (sections ?? []).sort(
      (a, b) => (sectionOrder.get(a.id) ?? 999) - (sectionOrder.get(b.id) ?? 999),
    )) {
      const sColor = sectionColorMap.get(section.id) ?? "#6b7280";

      // Section header row
      items.push({
        id: `section-${section.id}`,
        name: section.title,
        start: today,
        end: today,
        progress: 0,
        dependencies: "",
        custom_class: "gt-section-row",
        _color: "transparent",
      });
      listItems.push({
        id: `section-${section.id}`,
        name: section.title,
        type: "section",
        isSubtask: false,
        sectionId: section.id,
        sectionColor: sColor,
      });

      // Section tasks (if not collapsed)
      if (!collapsedSections.has(section.id)) {
        const sectionTasks = grouped.get(section.id) ?? [];
        for (const task of sectionTasks) addTask(task, false);
      }
    }

    return { ganttData: items, taskListItems: listItems };
  }, [
    filteredParents,
    subtasksMap,
    sections,
    depsMap,
    options.colorBy,
    options.filter,
    sectionColorMap,
    assigneeColorMap,
    collapsedSections,
    collapsedTasks,
  ]);

  // Quick task lookup
  const tasksMap = useMemo(() => {
    const map = new Map<string, TaskRow>();
    for (const t of allTasks) map.set(t.id, t);
    return map;
  }, [allTasks]);

  // Stable key for detecting real ganttData changes
  const ganttDataKey = useMemo(
    () => ganttData.map((d) => `${d.id}:${d.start}:${d.end}`).join("|"),
    [ganttData],
  );

  return {
    parents,
    allTasks,
    isLoading,
    baseline,
    baselineMap,
    ganttData,
    taskListItems,
    tasksMap,
    ganttDataKey,
  };
}
