"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useProjectTasks,
  useProjectSections,
  useProjectDependencies,
} from "@/features/projects/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
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
import { GanttTaskList } from "./gantt-task-list";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

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

  // UI state
  const [options, setOptions] = useState<GanttOptions>(DEFAULT_GANTT_OPTIONS);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<unknown>(null);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleSelectTask = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
      onSelectTask?.(taskId);
    },
    [onSelectTask]
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

  // Build Gantt chart data
  const ganttData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sectionOrder = new Map((sections ?? []).map((s, i) => [s.id, i]));

    const sortedParents = [...filteredParents]
      .filter((t) => t.start_date || t.due_date)
      .sort((a, b) => {
        const sa = sectionOrder.get(a.section_id ?? "") ?? 999;
        const sb = sectionOrder.get(b.section_id ?? "") ?? 999;
        if (sa !== sb) return sa - sb;
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      });

    const items: Array<{
      id: string;
      name: string;
      start: string;
      end: string;
      progress: number;
      dependencies: string;
      custom_class: string;
    }> = [];

    for (const task of sortedParents) {
      const color = getBarColor(task, options.colorBy, sectionColorMap, assigneeColorMap);
      items.push(buildGanttItem(task, depsMap, today, false, color));

      let subs = (subtasksMap.get(task.id) ?? []).filter(
        (s) => s.start_date || s.due_date
      );
      if (options.filter === "incomplete") {
        subs = subs.filter((s) => !s.is_completed);
      } else if (options.filter === "complete") {
        subs = subs.filter((s) => s.is_completed);
      }

      for (const sub of subs) {
        const subColor = getBarColor(sub, options.colorBy, sectionColorMap, assigneeColorMap);
        items.push(buildGanttItem(sub, depsMap, today, true, subColor));
      }
    }

    return items;
  }, [filteredParents, subtasksMap, sections, depsMap, options.colorBy, options.filter, sectionColorMap, assigneeColorMap]);

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
          `.bar-wrapper[data-id="${item.id}"] .bar-progress { fill: ${item.custom_class} !important; }
           .bar-wrapper[data-id="${item.id}"] .bar { fill: ${item.custom_class} !important; opacity: 0.3; }`
      )
      .join("\n");

    const compactRule = options.compact
      ? `.gantt .bar-wrapper .bar { height: 14px !important; } .gantt .bar-wrapper .bar-progress { height: 14px !important; }`
      : "";

    style.textContent = `${colorRules}\n${compactRule}`;
  }, [ganttData, options.compact]);

  // Init / update frappe-gantt
  useEffect(() => {
    if (!containerRef.current || ganttData.length === 0) return;
    let mounted = true;

    async function initGantt() {
      try {
        const { default: Gantt } = await import("frappe-gantt");
        if (!mounted || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const gantt = new Gantt(containerRef.current, ganttData, {
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
  }, [ganttData.length, options.viewMode, options.compact, options.showBaseline, baselineMap.size]);

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
  if (ganttData.length === 0 && filteredParents.length === 0) {
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

      {/* Split view: task list (left) + gantt chart (right) */}
      <div
        className="flex"
        style={{
          height: Math.max(
            400,
            ganttData.length * (options.compact ? 28 : 38) + 80
          ),
        }}
      >
        {/* Left panel */}
        <div className="w-[280px] shrink-0">
          <GanttTaskList
            sections={sections ?? []}
            parents={filteredParents}
            subtasksMap={subtasksMap}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            compact={options.compact}
          />
        </div>

        {/* Right panel — Gantt diagram */}
        <CardContent className="flex-1 overflow-x-auto overflow-y-auto p-0">
          <div ref={containerRef} className="min-h-[300px]" />
        </CardContent>
      </div>
    </Card>
  );
}

// ─── Helpers ──────────────────────────────────────────────

function buildGanttItem(
  task: TaskRow,
  depsMap: Map<string, string[]>,
  today: string,
  isSubtask: boolean,
  color: string
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
    custom_class: color,
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
