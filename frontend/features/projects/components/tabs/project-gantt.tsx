"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTasks, useProjectSections, useProjectDependencies } from "@/features/projects/hooks/use-project-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { GanttControls, type GanttViewMode } from "./gantt-controls";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectGanttProps {
  projectId: string;
  onSelectTask?: (taskId: string) => void;
}

export function ProjectGantt({ projectId, onSelectTask }: ProjectGanttProps) {
  const { parents, subtasksMap, allTasks, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const taskIds = useMemo(() => allTasks.map((t) => t.id), [allTasks]);
  const { data: dependencies } = useProjectDependencies(taskIds);
  const updateTask = useUpdateTask();

  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<unknown>(null);
  const [viewMode, setViewMode] = useState<GanttViewMode>("Week");
  const [error, setError] = useState<string | null>(null);

  // Build dependency map: successorId → [predecessorId, ...]
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

  // Build ordered Gantt data: section → parents → subtasks
  const ganttData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sectionOrder = new Map((sections ?? []).map((s, i) => [s.id, i]));

    // Sort parents by section order then order_index
    const sortedParents = [...parents]
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
      items.push(taskToGanttItem(task, depsMap, today, false));

      // Add subtasks
      const subs = (subtasksMap.get(task.id) ?? []).filter(
        (s) => s.start_date || s.due_date,
      );
      for (const sub of subs) {
        items.push(taskToGanttItem(sub, depsMap, today, true));
      }
    }

    return items;
  }, [parents, subtasksMap, sections, depsMap]);

  // Init / update Gantt
  useEffect(() => {
    if (!containerRef.current || ganttData.length === 0) return;
    let mounted = true;

    async function initGantt() {
      try {
        const { default: Gantt } = await import("frappe-gantt");
        if (!mounted || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const gantt = new Gantt(containerRef.current, ganttData, {
          view_mode: viewMode,
          date_format: "YYYY-MM-DD",
          on_click: (task: { id: string }) => {
            onSelectTask?.(task.id);
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
      } catch (err) {
        if (mounted) setError("Não foi possível carregar o Gantt.");
      }
    }

    initGantt();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttData.length, viewMode]);

  // View mode change (if gantt already initialized)
  const handleViewModeChange = useCallback((mode: GanttViewMode) => {
    setViewMode(mode);
    if (ganttRef.current && typeof (ganttRef.current as Record<string, unknown>).change_view_mode === "function") {
      (ganttRef.current as { change_view_mode: (m: string) => void }).change_view_mode(mode);
    }
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium">Gantt</span>
        <GanttControls activeMode={viewMode} onChange={handleViewModeChange} />
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div ref={containerRef} className="min-h-[300px]" />
      </CardContent>
    </Card>
  );
}

function taskToGanttItem(
  task: TaskRow,
  depsMap: Map<string, string[]>,
  today: string,
  isSubtask: boolean,
) {
  const predecessors = depsMap.get(task.id) ?? [];
  const name = isSubtask ? `  └ ${task.title}` : task.title || "Sem título";
  const classes: string[] = [];
  if (task.is_completed) classes.push("bar-completed");
  if (isSubtask) classes.push("bar-subtask");
  if (!task.is_completed && (task.priority === "alta" || task.priority === "urgente"))
    classes.push("bar-high");

  return {
    id: task.id,
    name,
    start: task.start_date || task.due_date || today,
    end: task.due_date || task.start_date || today,
    progress: task.is_completed ? 100 : 0,
    dependencies: predecessors.join(","),
    custom_class: classes.join(" "),
  };
}
