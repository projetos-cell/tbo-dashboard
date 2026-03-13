"use client";

import { useState, useRef, useCallback } from "react";
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
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconCircleCheck,
  IconCircle,
  IconPlus,
  IconX,
  IconGripVertical,
  IconExternalLink,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useSubtasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { reorderSubtasks } from "@/features/tasks/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Sortable Row ──────────────────────────────────────────

interface SubtaskRowProps {
  sub: TaskRow;
  onToggle: (sub: TaskRow) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  isDeleting: boolean;
}

function SubtaskRow({ sub, onToggle, onDelete, onOpen, isDeleting }: SubtaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sub.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none"
        aria-label="Reordenar subtarefa"
        tabIndex={-1}
      >
        <IconGripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Status checkbox */}
      <button
        type="button"
        onClick={() => onToggle(sub)}
        className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-colors"
        aria-label={sub.is_completed ? "Reabrir subtarefa" : "Concluir subtarefa"}
      >
        {sub.is_completed ? (
          <IconCircleCheck className="h-4 w-4 text-green-600" />
        ) : (
          <IconCircle className="h-4 w-4 text-muted-foreground/50" />
        )}
      </button>

      {/* Title → abre detail sheet */}
      <button
        type="button"
        className={`flex-1 text-left text-sm truncate transition-colors hover:text-primary ${
          sub.is_completed ? "line-through text-muted-foreground/60" : ""
        }`}
        onClick={() => onOpen(sub.id)}
      >
        {sub.title}
      </button>

      {/* Open icon (explicit) */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
        aria-label="Abrir subtarefa"
        onClick={() => onOpen(sub.id)}
      >
        <IconExternalLink className="h-3 w-3" />
      </Button>

      {/* Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
        aria-label="Excluir subtarefa"
        onClick={() => onDelete(sub.id)}
        disabled={isDeleting}
      >
        <IconX className="h-3 w-3" />
      </Button>
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────

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
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bloqueio de profundidade >1: se esta tarefa já é subtarefa, não permite criar sub-subtarefa
  const isSubtask = !!task.parent_id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed || !tenantId) {
      setAdding(false);
      setTitle("");
      return;
    }
    setTitle("");
    try {
      await createTask.mutateAsync({
        title: trimmed,
        parent_id: task.id,
        tenant_id: tenantId,
        status: "pendente",
        priority: task.priority ?? "media",
        project_id: task.project_id,
        is_completed: false,
      } as never);
      inputRef.current?.focus();
    } catch {
      toast({ title: "Erro ao criar subtarefa", variant: "destructive" });
    }
  }, [title, tenantId, task, createTask, toast]);

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
      {subtasks.length === 0 && !adding && (
        <p className="text-[11px] text-muted-foreground pl-1">Nenhuma subtarefa</p>
      )}

      {/* Inline create — bloqueado se é subtarefa (profundidade >1) */}
      {!isSubtask && (
        <>
          {adding ? (
            <div className="flex items-center gap-2 px-1 py-1">
              <IconCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da subtarefa..."
                className="h-6 text-sm border-0 border-b rounded-none px-0 focus-visible:ring-0 shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAdd();
                  }
                  if (e.key === "Escape") {
                    setAdding(false);
                    setTitle("");
                  }
                }}
                onBlur={() => {
                  if (!title.trim()) setAdding(false);
                }}
                disabled={createTask.isPending}
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              onClick={() => setAdding(true)}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Adicionar subtarefa
            </button>
          )}
        </>
      )}
    </div>
  );
}
