"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useMoveTaskToSection } from "@/features/tasks/hooks/use-my-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { Plus } from "lucide-react";

interface QuickAddTaskProps {
  sectionId: string;
  sortOrder: number;
}

export function QuickAddTask({ sectionId, sortOrder }: QuickAddTaskProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();
  const moveTask = useMoveTaskToSection();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  const handleSubmit = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed || !userId || !tenantId) return;

    setTitle("");

    try {
      const task = await createTask.mutateAsync({
        title: trimmed,
        tenant_id: tenantId,
        assignee_id: userId,
        status: "pendente",
        priority: "media",
        is_completed: false,
      } as never);

      if (task?.id) {
        moveTask.mutate({
          task_id: task.id,
          section_id: sectionId,
          sort_order: sortOrder,
        });
      }
    } catch {
      // Error handled by React Query
    }

    // Keep input focused for rapid entry
    inputRef.current?.focus();
  }, [title, userId, tenantId, createTask, moveTask, sectionId, sortOrder]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setTitle("");
        setIsAdding(false);
      }
    },
    [handleSubmit]
  );

  if (!isAdding) {
    return (
      <button
        onClick={() => {
          setIsAdding(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
      >
        <Plus className="h-4 w-4" />
        <span>Adicionar tarefa...</span>
      </button>
    );
  }

  return (
    <div className="px-3 py-1">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) setIsAdding(false);
        }}
        placeholder="Nome da tarefa — Enter para criar, Esc para cancelar"
        className="h-8 text-sm"
        autoFocus
      />
    </div>
  );
}
