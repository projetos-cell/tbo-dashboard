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
  const [focused, setFocused] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
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

  return (
    <div
      className={`flex items-center gap-2 px-1 py-1 rounded-md transition-colors ${
        focused ? "bg-muted/30" : "hover:bg-muted/20"
      }`}
    >
      {focused ? (
        <IconCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      ) : (
        <IconPlus className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
      )}
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={focused ? "Nome da subtarefa... (Enter para criar)" : "Adicionar subtarefa..."}
        className="h-6 text-sm border-0 border-b border-transparent focus-visible:border-border rounded-none px-0 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handleAdd();
          }
          if (e.key === "Escape") {
            setTitle("");
            inputRef.current?.blur();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!title.trim()) {
            setFocused(false);
            setTitle("");
          }
        }}
        disabled={createTask.isPending}
      />
    </div>
  );
}
