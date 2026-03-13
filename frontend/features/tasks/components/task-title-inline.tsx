"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskTitleInlineProps {
  task: TaskRow;
}

export function TaskTitleInline({ task }: TaskTitleInlineProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  // Sync external changes
  useEffect(() => {
    if (!isEditing) setValue(task.title);
  }, [task.title, isEditing]);

  const save = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 500) {
      setValue(task.title);
      setIsEditing(false);
      return;
    }
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    setIsEditing(false);
    updateTask.mutate(
      {
        id: task.id,
        updates: { title: trimmed },
        previousTask: task,
      },
      {
        onError: () => {
          setValue(task.title);
          toast({
            title: "Erro ao salvar título",
            description: "Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  }, [value, task, updateTask, toast]);

  const cancel = useCallback(() => {
    setValue(task.title);
    setIsEditing(false);
  }, [task.title]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  // Focus input on entering edit mode
  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="text-lg font-semibold h-auto py-2 px-1 -mx-1 border-primary/30 focus-visible:ring-1"
        maxLength={500}
        aria-label="Editar título da tarefa"
      />
    );
  }

  return (
    <h2
      className={cn(
        "text-lg font-semibold py-2 leading-snug cursor-text rounded-md px-1 -mx-1",
        "hover:bg-muted/50 transition-colors duration-150",
        task.is_completed && "line-through text-muted-foreground"
      )}
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      aria-label={`Título: ${task.title}. Clique para editar.`}
    >
      {task.title}
    </h2>
  );
}
