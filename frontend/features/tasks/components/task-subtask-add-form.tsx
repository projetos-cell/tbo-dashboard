"use client";

import { useState, useRef, useCallback } from "react";
import { IconCircle, IconPlus } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskSubtaskAddFormProps {
  task: TaskRow;
  tenantId: string;
}

export function TaskSubtaskAddForm({ task, tenantId }: TaskSubtaskAddFormProps) {
  const { toast } = useToast();
  const createTask = useCreateTask();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) {
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

  if (adding) {
    return (
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
    );
  }

  return (
    <button
      type="button"
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      onClick={() => setAdding(true)}
    >
      <IconPlus className="h-3.5 w-3.5" />
      Adicionar subtarefa
    </button>
  );
}
