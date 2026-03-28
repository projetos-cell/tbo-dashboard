"use client";

import { useCallback } from "react";
import { IconCheck } from "@tabler/icons-react";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskStatusToggleProps {
  task: TaskRow;
  /** Compact mode: just the checkbox, no label */
  compact?: boolean;
}

export function TaskStatusToggle({ task, compact }: TaskStatusToggleProps) {
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const handleToggle = useCallback(() => {
    const completing = !task.is_completed;

    updateTask.mutate(
      {
        id: task.id,
        updates: {
          status: completing ? "concluida" : "pendente",
          is_completed: completing,
          completed_at: completing ? new Date().toISOString() : null,
        },
        previousTask: task,
      },
      {
        onSuccess: () => {
          toast({
            title: completing ? "Tarefa concluída" : "Tarefa reaberta",
          });
        },
        onError: () => {
          toast({
            title: "Erro ao atualizar status",
            description: "Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  }, [task, updateTask, toast]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-center h-5 w-5 rounded-full border-2 transition-all duration-200",
          "hover:border-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          task.is_completed
            ? "bg-green-600 border-green-600 text-white"
            : "border-muted-foreground/40 hover:bg-green-50 dark:hover:bg-green-950/20"
        )}
        aria-label={task.is_completed ? "Reabrir tarefa" : "Concluir tarefa"}
      >
        {task.is_completed && <IconCheck className="h-3 w-3" strokeWidth={3} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        task.is_completed
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-label={task.is_completed ? "Reabrir tarefa" : "Concluir tarefa"}
    >
      <span
        className={cn(
          "flex items-center justify-center h-4 w-4 rounded-full border-[1.5px] transition-all duration-200",
          task.is_completed
            ? "bg-white/20 border-white/40"
            : "border-muted-foreground/50"
        )}
      >
        {task.is_completed && <IconCheck className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {task.is_completed ? "Concluída" : "Concluir"}
    </button>
  );
}
