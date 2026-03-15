"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import {
  useProjectTasks,
  useProjectSections,
  useProjectDependencies,
  useMoveProjectTask,
  useReorderProjectTasks,
} from "@/features/projects/hooks/use-project-tasks";
import { useUpdateTask, useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getGanttBaseline,
  saveGanttBaseline,
  deleteGanttBaseline,
  type GanttBaselineSnapshot,
} from "@/features/projects/services/gantt-baselines";
import {
  GanttControls,
  DEFAULT_GANTT_OPTIONS,
  type GanttOptions,
  type GanttColorBy,
} from "./gantt-controls";
import { GanttTaskList, type GanttTaskItem } from "./gantt-task-list";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Constants ────────────────────────────────────────────

const GANTT_ROW_H = 48; // frappe-gantt default row height
const GANTT_HEADER_H = 85; // frappe-gantt header area height
const MIN_GANTT_ROWS = 14;

// ─── Color maps ───────────────────────────────────────────

const SECTION_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#22c55e", "#06b6d4", "#ef4444", "#6366f1",
];

const ASSIGNEE_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#22c55e", "#06b6d4", "#ef4444", "#f97316",
];

function getBarColor(
  task: TaskRow,
  colorBy: GanttColorBy,
  sectionColorMap: Map<string, string>,
  assigneeColorMap: Map<string, string>
): string {
  switch (colorBy) {
    case "status": {
      const cfg = TASK_STATUS[task.status as TaskStatusKey];
      return cfg?.color ?? "#6b7280";
    }
    case "priority": {
      const cfg = TASK_PRIORITY[task.priority as TaskPriorityKey];
      return cfg?.color ?? "#6b7280";
    }
    case "section":
      return sectionColorMap.get(task.section_id ?? "") ?? "#6b7280";
    case "assignee":
      return assigneeColorMap.get(task.assignee_id ?? "") ?? "#6b7280";
    default:
      return "#6b7280";
  }
}

// ─── Props ────────────────────────────────────────────────

interface ProjectGanttProps {
  projectId: string;
  onSelectTask?: (taskId: string) => void;
}

// ─── Component ────────────────────────────────────────────

export function ProjectGantt({ projectId, onSelectTask }: ProjectGanttProps) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateTask = useUpdateTask();

  // Data
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

  const saveBaselineMutation = useMutation({
    mutationFn: () => {
      const snapshot: GanttBaselineSnapshot[] = allTasks
        .filter((t) => t.start_date || t.due_date)
        .map((t) => ({
          taskId: t.id,
          startDate: t.start_date || t.due_date || "",
          endDate: t.due_date || t.start_date || "",
        }));
      return saveGanttBaseline(supabase, projectId, tenantId!, snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gantt-baseline", projectId] });
      toast({ title: "Baseline salva com sucesso" });
    },
    onError: () => toast({ title: "Erro ao salvar baseline", variant: "destructive" }),
  });

  const deleteBaselineMutation = useMutation({
    mutationFn: () => deleteGanttBaseline(supabase, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gantt-baseline", projectId] });
      toast({ title: "Baseline removida" });
    },
    onError: () => toast({ title: "Erro ao remover baseline", variant: "destructive" }),
  });

  const createTask = useCreateTask();

  // UI state
  const [options, setOptions] = useState<GanttOptions>(DEFAULT_GANTT_OPTIONS);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<unknown>(null);

  // DnD
  const moveTask = useMoveProjectTask(projectId);
  const reorderTasksMutation = useReorderProjectTasks(projectId);
  const undo = useUndoStack();
  const [ganttActiveId, setGanttActiveId] = useState<string | null>(null);
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleGanttDragEnd = useCallback((event: DragEndEvent) => {
    setGanttActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Skip section items
    if (taskId.startsWith("section-") || overId.startsWith("section-")) return;

    const task = parents.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target section from over item
    const overTask = parents.find((t) => t.id === overId);
    const targetSectionId = overTask?.section_id ?? null;
    const oldSectionId = task.section_id;

    if (targetSectionId !== oldSectionId) {
      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId },
      });

      const targetTasks = parents.filter(
        (t) => t.section_id === targetSectionId && t.id !== taskId,
      );
      const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order_index), 0);

      moveTask.mutate({ taskId, sectionId: targetSectionId, orderIndex: maxOrder + 1 });
      return;
    }

    // Reorder within same section
    const sectionTasks = parents
      .filter((t) => t.section_id === targetSectionId)
      .sort((a, b) => a.order_index - b.order_index);

    const oldIndex = sectionTasks.findIndex((t) => t.id === taskId);
    const newIndex = sectionTasks.findIndex((t) => t.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = [...sectionTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderTasksMutation.mutate(
      reordered.map((t, i) => ({ id: t.id, order_index: i })),
    );
  }, [parents, moveTask, reorderTasksMutation, undo]);

  const handleGanttUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;
    const { taskId, toSection } = action.inverse as { taskId: string; toSection: string | null };
    moveTask.mutate(
      { taskId, sectionId: toSection, orderIndex: 0 },
      {
        onSuccess: () => {
          toast({ title: "Desfeito", description: "Tarefa movida de volta." });
        },
      },
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleGanttUndo);

  const handleSelectTask = useCallback(
    (taskId: string) => {
      // Ignore clicks on section placeholder rows
      if (taskId.startsWith("section-")) return;
      onSelectTask?.(taskId);
    },
    [onSelectTask]
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const toggleTaskExpand = useCallback((taskId: string) => {
    setCollapsedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const handleAddTask = useCallback(
    (sectionId?: string) => {
      const title = "Nova tarefa";
      const today = new Date().toISOString().split("T")[0];
      createTask.mutate({
        title,
        project_id: projectId,
        tenant_id: tenantId!,
        section_id: sectionId ?? null,
        status: "pendente",
        start_date: today,
        due_date: today,
      } as never);
    },
    [projectId, tenantId, createTask]
  );

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
    const snap = typeof baseline.snapshot === "string"
      ? JSON.parse(baseline.snapshot) as GanttBaselineSnapshot[]
      : baseline.snapshot as GanttBaselineSnapshot[];
    for (const item of snap) {
      map.set(item.taskId, item);
    }
    return map;
  }, [baseline]);

  // Filter tasks
  const filteredParents = useMemo(() => {
    let filtered = parents;
    if (options.filter === "incomplete") {
      filtered = filtered.filter((t) => !t.is_completed);
    } else if (options.filter === "complete") {
      filtered = filtered.filter((t) => t.is_completed);
    }
    return filtered;
  }, [parents, options.filter]);

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

    type GanttDataItem = {
      id: string;
      name: string;
      start: string;
      end: string;
      progress: number;
      dependencies: string;
      custom_class: string;
      _color: string;
    };

    const items: GanttDataItem[] = [];
    const listItems: GanttTaskItem[] = [];

    // Helper: add a task + its subtasks
    const addTask = (task: TaskRow, isSubtask: boolean) => {
      if (!(task.start_date || task.due_date)) return;
      const color = getBarColor(task, options.colorBy, sectionColorMap, assigneeColorMap);
      items.push(buildGanttItem(task, depsMap, today, isSubtask, color));

      const hasSubs = (subtasksMap.get(task.id) ?? []).some(
        (s) => s.start_date || s.due_date
      );
      listItems.push({
        id: task.id,
        name: isSubtask ? `  └ ${task.title}` : task.title || "Sem título",
        type: "task",
        isSubtask,
        hasSubtasks: !isSubtask && hasSubs,
        parentId: isSubtask ? undefined : undefined,
      });

      // Subtasks (if not collapsed)
      if (!isSubtask && !collapsedTasks.has(task.id)) {
        let subs = (subtasksMap.get(task.id) ?? []).filter(
          (s) => s.start_date || s.due_date
        );
        if (options.filter === "incomplete") subs = subs.filter((s) => !s.is_completed);
        else if (options.filter === "complete") subs = subs.filter((s) => s.is_completed);
        for (const sub of subs) addTask(sub, true);
      }
    };

    // No-section tasks first
    for (const task of noSection) addTask(task, false);

    // Then each section
    for (const section of (sections ?? []).sort((a, b) =>
      (sectionOrder.get(a.id) ?? 999) - (sectionOrder.get(b.id) ?? 999)
    )) {
      const sColor = sectionColorMap.get(section.id) ?? "#6b7280";

      // Section header row — placeholder in gantt (hidden bar)
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
  }, [filteredParents, subtasksMap, sections, depsMap, options.colorBy, options.filter, sectionColorMap, assigneeColorMap, collapsedSections, collapsedTasks]);

  const tasksMap = useMemo(() => {
    const map = new Map<string, TaskRow>();
    for (const t of allTasks) map.set(t.id, t);
    return map;
  }, [allTasks]);

  // Load frappe-gantt base CSS from public/
  useEffect(() => {
    const id = "frappe-gantt-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/frappe-gantt.css";
    document.head.appendChild(link);
  }, []);

  // Dynamic CSS for bar colors + compact + baseline
  useEffect(() => {
    const styleId = "gantt-dynamic-styles";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const colorRules = ganttData
      .map(
        (item) =>
          `.bar-wrapper.${item.custom_class} .bar-progress { fill: ${item._color} !important; }
           .bar-wrapper.${item.custom_class} .bar { fill: ${item._color} !important; opacity: 0.3; }`
      )
      .join("\n");

    const compactRule = options.compact
      ? `.gantt .bar-wrapper .bar { height: 14px !important; } .gantt .bar-wrapper .bar-progress { height: 14px !important; }`
      : "";

    // Map Tailwind dark mode (.dark class) to frappe-gantt dark variables
    const darkModeOverride = `
html.dark {
  --g-arrow-color: #e5e5e5;
  --g-bar-color: #2a2a2a;
  --g-bar-border: #3a3a3a;
  --g-tick-color-thick: #1a1a1a;
  --g-tick-color: #0a0a0a;
  --g-actions-background: #1a1a1a;
  --g-border-color: #2a2a2a;
  --g-text-muted: #999999;
  --g-text-light: #ffffff;
  --g-text-dark: #f5f5f5;
  --g-progress-color: #4a4a4a;
  --g-handle-color: #d0d0d0;
  --g-weekend-label-color: #3a3a3a;
  --g-expected-progress: #5a5a5a;
  --g-header-background: #0a0a0a;
  --g-row-color: #141414;
  --g-row-border-color: #2a2a2a;
  --g-today-highlight: #999999;
  --g-popup-actions: #1a1a1a;
  --g-weekend-highlight-color: #0f0f0f;
}`;

    // Force minimum grid height + hide built-in side header + hide section placeholder bars
    const layoutRules = `.gantt-wrapper .gantt-container { min-height: 600px; }
.gantt-wrapper .gantt-container svg.gantt { min-height: 600px; }
.gantt-wrapper .gantt-container .side-header { display: none !important; }
.bar-wrapper.gt-section-row { display: none !important; }`;

    style.textContent = `${darkModeOverride}\n${layoutRules}\n${colorRules}\n${compactRule}`;
  }, [ganttData, options.compact]);

  // Stable key for ganttData to detect real changes
  const ganttDataKey = useMemo(
    () => ganttData.map((d) => `${d.id}:${d.start}:${d.end}`).join("|"),
    [ganttData]
  );

  // Init / update frappe-gantt
  useEffect(() => {
    if (!containerRef.current || ganttData.length === 0) return;
    let mounted = true;

    async function initGantt() {
      try {
        const { default: Gantt } = await import("frappe-gantt");
        if (!mounted || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        // frappe-gantt needs items without the extra _color field
        const items = ganttData.map(({ _color, ...rest }) => rest);

        const gantt = new Gantt(containerRef.current, items, {
          view_mode: options.viewMode,
          date_format: "YYYY-MM-DD",
          on_click: (task: { id: string }) => {
            handleSelectTask(task.id);
          },
          on_date_change: (task: { id: string; _start: Date; _end: Date }) => {
            updateTask.mutate({
              id: task.id,
              updates: {
                start_date: task._start.toISOString().split("T")[0],
                due_date: task._end.toISOString().split("T")[0],
              },
            });
          },
          on_progress_change: (task: { id: string; progress: number }) => {
            updateTask.mutate({
              id: task.id,
              updates: {
                is_completed: task.progress >= 100,
                status: task.progress >= 100 ? "concluida" : "em_andamento",
              },
            });
          },
        });

        ganttRef.current = gantt;

        // Expand grid to show more empty rows
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const gc = containerRef.current.querySelector(".gantt-container") as HTMLElement | null;
          const svg = containerRef.current.querySelector("svg.gantt") as SVGElement | null;
          if (!gc || !svg) return;

          const existingRows = svg.querySelectorAll(".grid-row");
          const neededRows = Math.max(0, MIN_GANTT_ROWS - existingRows.length);
          if (neededRows === 0) return;

          // Derive row dimensions from existing rows
          const lastRow = existingRows[existingRows.length - 1];
          const rowH = parseFloat(lastRow?.getAttribute("height") ?? "48");
          const rowW = lastRow?.getAttribute("width") ?? String(svg.getAttribute("width") ?? "1540");
          const lastY = parseFloat(lastRow?.getAttribute("y") ?? "85") + rowH;

          const rowsContainer = lastRow?.parentElement;
          const linesLayer = svg.querySelector(".lines_layer");

          for (let i = 0; i < neededRows; i++) {
            const y = lastY + i * rowH;
            // Add grid row rect
            if (rowsContainer) {
              const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
              rect.setAttribute("x", "0");
              rect.setAttribute("y", String(y));
              rect.setAttribute("width", rowW);
              rect.setAttribute("height", String(rowH));
              rect.classList.add("grid-row");
              rowsContainer.appendChild(rect);
            }
            // Add row line
            if (linesLayer) {
              const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
              line.setAttribute("x1", "0");
              line.setAttribute("y1", String(y + rowH));
              line.setAttribute("x2", rowW);
              line.setAttribute("y2", String(y + rowH));
              line.classList.add("row-line");
              linesLayer.appendChild(line);
            }
          }

          // Extend SVG + ticks + highlights
          const newH = lastY + neededRows * rowH;
          svg.setAttribute("height", String(newH));
          svg.querySelectorAll(".tick").forEach((t) =>
            (t as SVGLineElement).setAttribute("y2", String(newH))
          );
          // Extend holiday highlights
          svg.querySelectorAll(".holiday-highlight").forEach((r) =>
            (r as SVGRectElement).setAttribute("height", String(newH - 85))
          );
          const hl = gc.querySelector(".current-highlight") as HTMLElement | null;
          if (hl) hl.style.height = `${newH}px`;
        });

        // Render baseline overlay
        if (options.showBaseline && baselineMap.size > 0) {
          renderBaselineOverlay(containerRef.current);
        }
      } catch (err) {
        if (mounted) setError("Não foi possível carregar o Gantt.");
      }
    }

    initGantt();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttDataKey, options.viewMode, options.compact, options.showBaseline, baselineMap.size]);

  // Loading
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty
  if (ganttData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Nenhuma tarefa com datas para exibir no Gantt.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Adicione datas de início/fim nas tarefas para visualizá-las aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Controls toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <span className="text-sm font-medium">Gantt</span>
        <GanttControls
          options={options}
          onChange={setOptions}
          hasBaseline={!!baseline}
          onSaveBaseline={() => saveBaselineMutation.mutate()}
          onClearBaseline={() => deleteBaselineMutation.mutate()}
        />
      </div>

      {/* Split: task list + gantt chart */}
      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={(e) => setGanttActiveId(e.active.id as string)}
        onDragEnd={handleGanttDragEnd}
      >
        <div className="flex">
          {/* Left — task list */}
          <div className="w-[260px] shrink-0 overflow-y-auto">
            <GanttTaskList
              items={taskListItems}
              tasksMap={tasksMap}
              selectedTaskId={null}
              onSelectTask={handleSelectTask}
              collapsedTasks={collapsedTasks}
              onToggleExpand={toggleTaskExpand}
              rowHeight={GANTT_ROW_H}
              headerHeight={GANTT_HEADER_H}
              minRows={MIN_GANTT_ROWS}
              onAddTask={handleAddTask}
              sortableTaskIds={taskListItems.filter((i) => i.type === "task" && !i.isSubtask).map((i) => i.id)}
            />
          </div>

          {/* Right — gantt diagram */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div
              ref={containerRef}
              className="gantt-wrapper"
              style={{
                minHeight: Math.max(
                  600,
                  ganttData.length * GANTT_ROW_H + GANTT_HEADER_H + 40
                ),
              }}
            />
          </div>
        </div>

        <DragOverlay>
          {ganttActiveId && !ganttActiveId.startsWith("section-") ? (
            <div className="rounded-md border border-border bg-background px-3 py-1 shadow-lg text-xs opacity-80">
              {tasksMap.get(ganttActiveId)?.title ?? ""}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Card>
  );
}

// ─── Helpers ──────────────────────────────────────────────

function taskCssClass(taskId: string) {
  return `gt-${taskId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
}

function buildGanttItem(
  task: TaskRow,
  depsMap: Map<string, string[]>,
  today: string,
  isSubtask: boolean,
  _color: string
) {
  const predecessors = depsMap.get(task.id) ?? [];
  const name = isSubtask ? `  └ ${task.title}` : task.title || "Sem título";

  return {
    id: task.id,
    name,
    start: task.start_date || task.due_date || today,
    end: task.due_date || task.start_date || today,
    progress: task.is_completed ? 100 : 0,
    dependencies: predecessors.join(","),
    custom_class: taskCssClass(task.id),
    _color,
  };
}

function renderBaselineOverlay(container: HTMLElement) {
  const svg = container.querySelector("svg.gantt");
  if (!svg) return;

  // Add hash pattern for baseline bars
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.prepend(defs);
  }

  if (!defs.querySelector("#baseline-pattern")) {
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "baseline-pattern");
    pattern.setAttribute("width", "6");
    pattern.setAttribute("height", "6");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("patternTransform", "rotate(45)");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "6");
    line.setAttribute("stroke", "#94a3b8");
    line.setAttribute("stroke-width", "1.5");
    pattern.appendChild(line);
    defs.appendChild(pattern);
  }

  // Add baseline ghost bars below each task bar
  const bars = svg.querySelectorAll(".bar-wrapper");
  bars.forEach((barEl) => {
    const barRect = barEl.querySelector(".bar");
    if (!barRect) return;

    const y = parseFloat(barRect.getAttribute("y") ?? "0");
    const height = parseFloat(barRect.getAttribute("height") ?? "20");

    const baselineRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    baselineRect.setAttribute("x", barRect.getAttribute("x") ?? "0");
    baselineRect.setAttribute("y", String(y + height + 2));
    baselineRect.setAttribute("width", barRect.getAttribute("width") ?? "0");
    baselineRect.setAttribute("height", "6");
    baselineRect.setAttribute("rx", "2");
    baselineRect.setAttribute("fill", "url(#baseline-pattern)");
    baselineRect.setAttribute("stroke", "#94a3b8");
    baselineRect.setAttribute("stroke-width", "0.5");
    baselineRect.setAttribute("opacity", "0.6");

    barEl.appendChild(baselineRect);
  });
}
