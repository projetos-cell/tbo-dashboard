"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import {
  useSubtasks,
  useUpdateTask,
  useDeleteTask,
} from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { reorderSubtasks } from "@/features/tasks/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase/types";
import { SubtaskRow } from "./task-subtask-row";
import { TaskSubtaskAddForm } from "./task-subtask-add-form";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskSubtasksSectionProps {
  task: TaskRow;
  /** Callback para abrir outra tarefa no detail sheet (navegação) */
  onOpenTask?: (taskId: string) => void;
}

export function TaskSubtasksSection({ task, onOpenTask }: TaskSubtasksSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: subtasks = [] } = useSubtasks(task.id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bloqueio de profundidade >1: se esta tarefa já é subtarefa, não permite criar sub-subtarefa
  const isSubtask = !!task.parent_id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggle = useCallback(
    (sub: TaskRow) => {
      const completing = !sub.is_completed;
      updateTask.mutate({
        id: sub.id,
        updates: {
          status: completing ? "concluida" : "pendente",
          is_completed: completing,
          completed_at: completing ? new Date().toISOString() : null,
        },
      });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    (subId: string) => {
      setDeletingId(subId);
      deleteTask.mutate(subId, {
        onSettled: () => setDeletingId(null),
        onError: () => toast({ title: "Erro ao excluir subtarefa", variant: "destructive" }),
      });
    },
    [deleteTask, toast]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIdx = subtasks.findIndex((s) => s.id === active.id);
      const newIdx = subtasks.findIndex((s) => s.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove(subtasks, oldIdx, newIdx);

      // Optimistic update
      queryClient.setQueryData(["subtasks", task.id], reordered);

      try {
        await reorderSubtasks(supabase, reordered.map((s) => s.id));
      } catch {
        // Rollback
        queryClient.setQueryData(["subtasks", task.id], subtasks);
        toast({ title: "Erro ao reordenar subtarefas", variant: "destructive" });
      }
    },
    [subtasks, queryClient, task.id, supabase, toast]
  );

  const completedCount = subtasks.filter((s) => s.is_completed).length;

  return (
    <div className="space-y-1.5 pt-1">
      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{
                width: `${Math.round((completedCount / subtasks.length) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {completedCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subtasks.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {subtasks.map((sub) => (
            <SubtaskRow
              key={sub.id}
              sub={sub}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpen={(id) => onOpenTask?.(id)}
              isDeleting={deletingId === sub.id}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {subtasks.length === 0 && (
        <p className="text-[11px] text-muted-foreground pl-1">Nenhuma subtarefa</p>
      )}

      {/* Inline create — bloqueado se é subtarefa (profundidade >1) */}
      {!isSubtask && tenantId && (
        <TaskSubtaskAddForm task={task} tenantId={tenantId} />
      )}
    </div>
  );
}
