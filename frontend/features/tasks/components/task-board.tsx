"use client";

import { useState, useCallback, useMemo } from "react";
import { TASK_STATUS } from "@/lib/constants";
import {
  usePropertyOptions,
  useReorderPropertyOptions,
} from "@/features/projects/hooks/use-project-properties";
import { TaskCard } from "./task-card";
import { SortableTaskCard } from "./sortable-task-card";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { IconLayoutKanban } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  AddColumnInline,
  EditableColumnHeader,
  SortableColumn,
  type ColumnDef,
} from "./task-board-column";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface SectionInfo {
  id: string;
  title: string;
  color: string | null;
}

interface TaskBoardProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
  sections?: SectionInfo[];
  groupBy?: string;
}

export function TaskBoard({ tasks, onSelect, sections, groupBy }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const reorderOptions = useReorderPropertyOptions("status");
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [activeDragType, setActiveDragType] = useState<"task" | "column" | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const undo = useUndoStack();
  const { toast } = useToast();

  const { data: statusOptions = [] } = usePropertyOptions("status");

  const columns = useMemo(() => {
    if (statusOptions.length === 0) {
      return Object.entries(TASK_STATUS).map(([key, cfg]) => ({
        id: key, key, label: cfg.label, color: cfg.color,
      }));
    }

    const dynamicCols = statusOptions.map((opt) => ({
      id: opt.id, key: opt.key, label: opt.label, color: opt.color,
    }));

    const dynamicKeys = new Set(dynamicCols.map((c) => c.key));
    const missingCols = Object.entries(TASK_STATUS)
      .filter(([key]) => !dynamicKeys.has(key))
      .map(([key, cfg]) => ({ id: key, key, label: cfg.label, color: cfg.color }));

    return [...missingCols, ...dynamicCols];
  }, [statusOptions]);

  const columnKeys = useMemo(() => new Set(columns.map((c) => c.key)), [columns]);
  const columnSortableIds = useMemo(() => columns.map((c) => `col-${c.id}`), [columns]);

  if (tasks !== localTasks && !updateTask.isPending) {
    setLocalTasks(tasks);
  }

  const tasksByStatus = useMemo(() => {
    const result: Record<string, TaskRow[]> = {};
    for (const col of columns) {
      result[col.key] = localTasks.filter((t) => t.status === col.key);
    }
    return result;
  }, [columns, localTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    if (id.startsWith("col-")) {
      setActiveDragType("column");
      setActiveColumnId(id.replace("col-", ""));
      setActiveTask(null);
    } else {
      setActiveDragType("task");
      setActiveColumnId(null);
      setActiveTask(localTasks.find((t) => t.id === id) ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const prevDragType = activeDragType;
    setActiveTask(null);
    setActiveDragType(null);
    setActiveColumnId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Column reorder
    if (prevDragType === "column" && activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
      const activeColId = activeIdStr.replace("col-", "");
      const overColId = overIdStr.replace("col-", "");
      const oldIndex = columns.findIndex((c) => c.id === activeColId);
      const newIndex = columns.findIndex((c) => c.id === overColId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(columns, oldIndex, newIndex);
      reorderOptions.mutate(reordered.map((c, i) => ({ id: c.id, sort_order: i })));
      return;
    }

    // Task drag
    const taskId = activeIdStr;
    let targetStatus = overIdStr;

    if (targetStatus.startsWith("col-")) {
      const colId = targetStatus.replace("col-", "");
      const col = columns.find((c) => c.id === colId);
      if (col) targetStatus = col.key;
      else return;
    }

    if (!columnKeys.has(targetStatus)) {
      const overTask = localTasks.find((t) => t.id === targetStatus);
      if (overTask) targetStatus = overTask.status;
    }

    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    const oldStatus = task.status;

    undo.push({
      type: "MOVE_TASK",
      payload: { taskId, fromStatus: oldStatus, toStatus: targetStatus },
      inverse: { taskId, fromStatus: targetStatus, toStatus: oldStatus },
    });

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    updateTask.mutate(
      { id: taskId, updates: { status: targetStatus } },
      {
        onError: () => {
          setLocalTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
          );
          toast({
            title: "Erro ao mover tarefa",
            description: "Não foi possível atualizar o status. Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  }

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { taskId, toStatus } = action.inverse as {
      taskId: string;
      fromStatus: string;
      toStatus: string;
    };

    undo.setUndoing(true);

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t))
    );

    updateTask.mutate(
      { id: taskId, updates: { status: toStatus } },
      {
        onSuccess: () => {
          undo.setUndoing(false);
          toast({ title: "Desfeito", description: "Movimento revertido com sucesso." });
        },
        onError: () => {
          undo.setUndoing(false);
          const original = action.payload as { toStatus: string };
          setLocalTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: original.toStatus } : t
            )
          );
          toast({
            title: "Erro ao desfazer",
            description: "Não foi possível reverter o movimento.",
            variant: "destructive",
          });
        },
      }
    );
  }, [undo, updateTask, toast]);

  useUndoKeyboard(handleUndo);

  const activeColumn = activeColumnId ? columns.find((c) => c.id === activeColumnId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4" role="region" aria-label="Board de tarefas">
        <SortableContext items={columnSortableIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => {
            const columnTasks = tasksByStatus[col.key] ?? [];

            return (
              <SortableColumn
                key={col.id}
                col={col}
                dragHandleSlot={(listeners) => (
                  <EditableColumnHeader
                    optionId={col.id}
                    label={col.label}
                    color={col.color}
                    count={columnTasks.length}
                    dragHandleProps={listeners}
                  />
                )}
              >
                <SortableContext
                  id={col.key}
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[100px]">
                    {columnTasks.length === 0 ? (
                      <ColumnEmptyState />
                    ) : groupBy === "section" && sections && sections.length > 0 ? (
                      <SectionGroupedCards
                        tasks={columnTasks}
                        sections={sections}
                        onSelect={onSelect}
                      />
                    ) : (
                      columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => onSelect(task)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </SortableColumn>
            );
          })}
        </SortableContext>

        <AddColumnInline nextOrder={columns.length} />
      </div>
      <DragOverlay>
        {activeDragType === "column" && activeColumn ? (
          <div className="flex w-[280px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-xl opacity-90">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeColumn.color }} />
            <span className="text-sm font-medium">{activeColumn.label}</span>
          </div>
        ) : activeDragType === "task" && activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function ColumnEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/20 py-8 text-center">
      <IconLayoutKanban className="mb-2 h-6 w-6 text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground">Nenhuma tarefa</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/50">Arraste um card para cá</p>
    </div>
  );
}

function SectionGroupedCards({
  tasks,
  sections,
  onSelect,
}: {
  tasks: TaskRow[];
  sections: SectionInfo[];
  onSelect: (task: TaskRow) => void;
}) {
  const bySection = new Map<string | null, TaskRow[]>();
  for (const t of tasks) {
    const key = t.section_id ?? null;
    const list = bySection.get(key) ?? [];
    list.push(t);
    bySection.set(key, list);
  }
  const orderedSections = sections.filter((s) => bySection.has(s.id));
  const noSection = bySection.get(null);

  return (
    <>
      {orderedSections.map((sec) => {
        const secTasks = bySection.get(sec.id) ?? [];
        return (
          <div key={sec.id}>
            <div className="flex items-center gap-1.5 px-1 py-1">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sec.color ?? "#6b7280" }} />
              <span className="text-[11px] font-semibold text-muted-foreground">{sec.title}</span>
              <span className="text-[10px] text-muted-foreground/60">({secTasks.length})</span>
            </div>
            {secTasks.map((task) => (
              <div key={task.id} className="mb-2">
                <SortableTaskCard task={task} onClick={() => onSelect(task)} />
              </div>
            ))}
          </div>
        );
      })}
      {noSection && noSection.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 px-1 py-1">
            <span className="text-[11px] font-semibold text-muted-foreground/60">Sem seção</span>
            <span className="text-[10px] text-muted-foreground/40">({noSection.length})</span>
          </div>
          {noSection.map((task) => (
            <div key={task.id} className="mb-2">
              <SortableTaskCard task={task} onClick={() => onSelect(task)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
