"use client";

import { useState, useRef, useCallback } from "react";
import {
  IconCircleCheck,
  IconCircle,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubtasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskSubtasksSectionProps {
  task: TaskRow;
}

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  const { toast } = useToast();
  const { data: subtasks = [] } = useSubtasks(task.id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleToggle = useCallback((sub: TaskRow) => {
    const completing = !sub.is_completed;
    updateTask.mutate({
      id: sub.id,
      updates: {
        status: completing ? "concluida" : "pendente",
        is_completed: completing,
        completed_at: completing ? new Date().toISOString() : null,
      },
    });
  }, [updateTask]);

  const handleDelete = useCallback((subId: string) => {
    deleteTask.mutate(subId, {
      onError: () => toast({ title: "Erro ao excluir subtarefa", variant: "destructive" }),
    });
  }, [deleteTask, toast]);

  const completedCount = subtasks.filter((s) => s.is_completed).length;

  return (
    <div className="space-y-1.5 pt-1">
      {/* Progress indicator */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.round((completedCount / subtasks.length) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {completedCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Subtask list */}
      {subtasks.map((sub) => (
        <div
          key={sub.id}
          className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
        >
          <button
            type="button"
            onClick={() => handleToggle(sub)}
            className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-colors"
            aria-label={sub.is_completed ? "Reabrir" : "Concluir"}
          >
            {sub.is_completed ? (
              <IconCircleCheck className="h-4 w-4 text-green-600" />
            ) : (
              <IconCircle className="h-4 w-4 text-muted-foreground/50" />
            )}
          </button>
          <span
            className={`flex-1 text-sm ${sub.is_completed ? "line-through text-muted-foreground/60" : ""}`}
          >
            {sub.title}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
            aria-label="Excluir subtarefa"
            onClick={() => handleDelete(sub.id)}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {/* Add input */}
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
              if (e.key === "Enter") { e.preventDefault(); void handleAdd(); }
              if (e.key === "Escape") { setAdding(false); setTitle(""); }
            }}
            onBlur={() => { if (!title.trim()) setAdding(false); }}
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
    </div>
  );
}
