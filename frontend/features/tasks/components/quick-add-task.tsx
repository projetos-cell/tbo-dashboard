"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useMoveTaskToSection } from "@/features/tasks/hooks/use-my-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import { IconPlus } from "@tabler/icons-react";

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
  const queryClient = useQueryClient();

  const handleSubmit = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed || !userId || !tenantId) return;

    setTitle("");

    // Optimistic: add a temporary task to the cache immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: MyTaskWithSection = {
      id: tempId,
      title: trimmed,
      tenant_id: tenantId,
      assignee_id: userId,
      status: "pendente",
      priority: "media",
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: null,
      start_date: null,
      description: null,
      project_id: null,
      section_id: null,
      completed_at: null,
      created_by: userId,
      order_index: sortOrder,
      assignee_name: null,
      assignee_avatar_url: null,
      is_milestone: false,
      legacy_demand_id: null,
      notion_page_id: null,
      parent_id: null,
      my_section_id: sectionId,
      my_sort_order: sortOrder,
    };

    // Insert into cache
    queryClient.setQueriesData<MyTaskWithSection[]>(
      { queryKey: ["my-tasks"] },
      (old) => (old ? [...old, optimisticTask] : [optimisticTask])
    );

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
        // Replace temp task with real one
        queryClient.setQueriesData<MyTaskWithSection[]>(
          { queryKey: ["my-tasks"] },
          (old) => old?.map((t) => (t.id === tempId ? { ...optimisticTask, id: task.id } : t))
        );

        moveTask.mutate({
          task_id: task.id,
          section_id: sectionId,
          sort_order: sortOrder,
        });
      }
    } catch {
      // Rollback: remove temp task
      queryClient.setQueriesData<MyTaskWithSection[]>(
        { queryKey: ["my-tasks"] },
        (old) => old?.filter((t) => t.id !== tempId)
      );
    }

    inputRef.current?.focus();
  }, [title, userId, tenantId, createTask, moveTask, sectionId, sortOrder, queryClient]);

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
        <IconPlus className="h-4 w-4" />
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
