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
import { IconSparkles, IconCheck, IconX, IconLoader } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

  const createTask = useCreateTask();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCreating, setAiCreating] = useState(false);

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

  const handleSuggestSubtasks = useCallback(async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    setAiSelected(new Set());
    try {
      const res = await fetch("/api/ai/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description ?? undefined,
        }),
      });
      const data = (await res.json()) as { subtasks?: string[]; error?: string };
      if (data.subtasks && data.subtasks.length > 0) {
        setAiSuggestions(data.subtasks);
        setAiSelected(new Set(data.subtasks.map((_, i) => i)));
      } else {
        toast({ title: data.error ?? "Nenhuma sugestao gerada", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao gerar sugestoes", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }, [task.title, task.description, toast]);

  const handleAcceptSuggestions = useCallback(async () => {
    if (!tenantId) return;
    setAiCreating(true);
    const selected = aiSuggestions.filter((_, i) => aiSelected.has(i));
    try {
      for (const title of selected) {
        await createTask.mutateAsync({
          title,
          parent_id: task.id,
          tenant_id: tenantId,
          status: "pendente",
          priority: task.priority ?? "media",
          project_id: task.project_id,
          is_completed: false,
        } as never);
      }
      toast({ title: `${selected.length} subtarefas criadas com IA` });
      setAiSuggestions([]);
      setAiSelected(new Set());
    } catch {
      toast({ title: "Erro ao criar subtarefas", variant: "destructive" });
    } finally {
      setAiCreating(false);
    }
  }, [aiSuggestions, aiSelected, tenantId, task.id, task.priority, task.project_id, createTask, toast]);

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

      {/* AI Suggest subtasks (AI01) */}
      {!isSubtask && tenantId && (
        <div className="pt-1">
          {aiSuggestions.length === 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleSuggestSubtasks}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <IconLoader className="size-3.5 animate-spin" />
              ) : (
                <IconSparkles className="size-3.5" />
              )}
              {aiLoading ? "Gerando sugestões..." : "Sugerir subtarefas com IA"}
            </Button>
          ) : (
            <div className="rounded-md border border-border/50 bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <IconSparkles className="size-3.5 text-amber-500" />
                Subtarefas sugeridas
              </p>
              {aiSuggestions.map((suggestion, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={aiSelected.has(i)}
                    onCheckedChange={(checked) => {
                      setAiSelected((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(i);
                        else next.delete(i);
                        return next;
                      });
                    }}
                  />
                  <span className="text-xs">{suggestion}</span>
                </label>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleAcceptSuggestions}
                  disabled={aiSelected.size === 0 || aiCreating}
                >
                  {aiCreating ? (
                    <IconLoader className="size-3.5 animate-spin" />
                  ) : (
                    <IconCheck className="size-3.5" />
                  )}
                  {aiCreating ? "Criando..." : `Criar ${aiSelected.size} selecionadas`}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    setAiSuggestions([]);
                    setAiSelected(new Set());
                  }}
                >
                  <IconX className="size-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
