"use client";

import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  saveGanttBaseline,
  deleteGanttBaseline,
  type GanttBaselineSnapshot,
} from "@/features/projects/services/gantt-baselines";
import {
  GanttControls,
  DEFAULT_GANTT_OPTIONS,
  type GanttOptions,
} from "./gantt-controls";
import { GanttTaskList } from "./gantt-task-list";
import { GANTT_ROW_H, GANTT_HEADER_H, MIN_GANTT_ROWS } from "./gantt-helpers";
import { useGanttDnd } from "./use-gantt-dnd";
import { useGanttData } from "./use-gantt-data";
import { useGanttRenderer } from "./use-gantt-renderer";

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
  const createTask = useCreateTask();

  // UI state
  const [options, setOptions] = useState<GanttOptions>(DEFAULT_GANTT_OPTIONS);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  // Data hook
  const {
    parents,
    allTasks,
    isLoading,
    baseline,
    baselineMap,
    ganttData,
    taskListItems,
    tasksMap,
    ganttDataKey,
  } = useGanttData({
    projectId,
    supabase,
    options,
    collapsedSections,
    collapsedTasks,
  });

  // DnD hook
  const { ganttActiveId, setGanttActiveId, dndSensors, handleGanttDragEnd } =
    useGanttDnd({ projectId, parents });

  // Task selection callback
  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (taskId.startsWith("section-")) return;
      onSelectTask?.(taskId);
    },
    [onSelectTask],
  );

  // Renderer hook (CSS + frappe-gantt init)
  const { containerRef } = useGanttRenderer({
    ganttData,
    ganttDataKey,
    options,
    baselineMapSize: baselineMap.size,
    onSelectTask: handleSelectTask,
    onError: setError,
  });

  // Baseline mutations
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
      queryClient.invalidateQueries({
        queryKey: ["gantt-baseline", projectId],
      });
      toast({ title: "Baseline salva com sucesso" });
    },
    onError: () =>
      toast({ title: "Erro ao salvar baseline", variant: "destructive" }),
  });

  const deleteBaselineMutation = useMutation({
    mutationFn: () => deleteGanttBaseline(supabase, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gantt-baseline", projectId],
      });
      toast({ title: "Baseline removida" });
    },
    onError: () =>
      toast({ title: "Erro ao remover baseline", variant: "destructive" }),
  });

  // UI callbacks
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
    [projectId, tenantId, createTask],
  );

  const sortableTaskIds = useMemo(
    () =>
      taskListItems
        .filter((i) => i.type === "task" && !i.isSubtask)
        .map((i) => i.id),
    [taskListItems],
  );

  // ─── Render states ──────────────────────────────────────

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
            Adicione datas de in\u00edcio/fim nas tarefas para visualiz\u00e1-las aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
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

      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={(e) => setGanttActiveId(e.active.id as string)}
        onDragEnd={handleGanttDragEnd}
      >
        <div className="flex">
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
              sortableTaskIds={sortableTaskIds}
            />
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div
              ref={containerRef}
              className="gantt-wrapper"
              style={{
                minHeight: Math.max(
                  600,
                  ganttData.length * GANTT_ROW_H + GANTT_HEADER_H + 40,
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
