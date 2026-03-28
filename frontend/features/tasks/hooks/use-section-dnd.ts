"use client";

import { useState, useCallback, useMemo } from "react";
import { type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import {
  useMyTasksSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useMoveTaskToSection,
} from "@/features/tasks/hooks/use-my-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";

interface UseSectionDndOptions {
  tasks: MyTaskWithSection[];
  dndDisabled: boolean;
}

export function useSectionDnd({ tasks, dndDisabled }: UseSectionDndOptions) {
  const { data: sections = [] } = useMyTasksSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const moveTask = useMoveTaskToSection();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeTask, setActiveTask] = useState<MyTaskWithSection | null>(null);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections]
  );

  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleAddSection = useCallback(() => {
    if (!tenantId) return;
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.sort_order), 0);
    createSection.mutate({
      tenant_id: tenantId,
      name: "Nova seção",
      sort_order: maxOrder + 1,
    });
  }, [tenantId, sections, createSection]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (dndDisabled) return;
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks, dndDisabled]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      if (dndDisabled) return;

      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let targetSectionId: string | null = null;
      const overIdStr = over.id as string;
      const isSection = sections.some((s) => s.id === overIdStr);

      if (isSection) {
        targetSectionId = overIdStr;
      } else {
        const overTask = tasks.find((t) => t.id === overIdStr);
        if (overTask) targetSectionId = overTask.my_section_id;
      }

      if (targetSectionId === task.my_section_id) return;

      const oldSectionId = task.my_section_id;
      const oldSortOrder = task.my_sort_order;

      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId, sortOrder: oldSortOrder },
      });

      const targetTasks = tasks.filter(
        (t) => t.my_section_id === targetSectionId && t.id !== taskId
      );
      const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.my_sort_order), 0);

      moveTask.mutate(
        {
          task_id: taskId,
          section_id: targetSectionId,
          sort_order: maxOrder + 1,
        },
        {
          onError: () => {
            toast({
              title: "Erro ao mover tarefa",
              description: "A tarefa foi revertida para a posição anterior.",
              variant: "destructive",
            });
          },
        }
      );
    },
    [tasks, sections, moveTask, undo, dndDisabled]
  );

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { taskId, toSection, sortOrder } = action.inverse as {
      taskId: string;
      toSection: string | null;
      sortOrder: number;
    };

    moveTask.mutate(
      { task_id: taskId, section_id: toSection, sort_order: sortOrder ?? 0 },
      {
        onSuccess: () => {
          toast({ title: "Desfeito", description: "Tarefa movida de volta." });
        },
      }
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleUndo);

  return {
    sections,
    sortedSections,
    activeTask,
    collapsedSections,
    toggleCollapse,
    handleAddSection,
    handleDragStart,
    handleDragEnd,
    updateSection,
    deleteSection,
  };
}
