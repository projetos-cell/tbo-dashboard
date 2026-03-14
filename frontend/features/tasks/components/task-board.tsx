"use client";

import { Badge } from "@/components/ui/badge";
import { TASK_STATUS } from "@/lib/constants";
import { TaskCard } from "./task-card";
import { SortableTaskCard } from "./sortable-task-card";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useCallback } from "react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

const BOARD_COLUMNS = ["pendente", "em_andamento", "revisao", "concluida", "bloqueada"] as const;

interface TaskBoardProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
}

export function TaskBoard({ tasks, onSelect }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const undo = useUndoStack();
  const { toast } = useToast();

  // Sync when props change (unless mid-mutation)
  if (tasks !== localTasks && !updateTask.isPending) {
    setLocalTasks(tasks);
  }

  const tasksByStatus = BOARD_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = localTasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<string, TaskRow[]>
  );

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    let targetStatus = over.id as string;

    if (!BOARD_COLUMNS.includes(targetStatus as (typeof BOARD_COLUMNS)[number])) {
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

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((status) => {
          const cfg = TASK_STATUS[status as keyof typeof TASK_STATUS];
          const columnTasks = tasksByStatus[status] ?? [];

          return (
            <div key={status} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cfg?.color }}
                />
                <h3 className="text-sm font-semibold">{cfg?.label ?? status}</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              <SortableContext
                id={status}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[100px] space-y-2 rounded-lg bg-gray-100/30 p-2">
                  {columnTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-500">
                      Nenhuma tarefa
                    </p>
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
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
