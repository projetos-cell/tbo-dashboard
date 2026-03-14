"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { BoardColumn } from "./my-tasks-board-column";
import {
  useMyTasksSections,
  useCreateSection,
  useMoveTaskToSection,
  groupTasksBySection,
} from "@/features/tasks/hooks/use-my-tasks";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { Database } from "@/lib/supabase/types";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { IconPlus } from "@tabler/icons-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface MyTasksBoardViewProps {
  tasks: MyTaskWithSection[];
  onSelect: (task: TaskRow) => void;
}

export function MyTasksBoardView({ tasks, onSelect }: MyTasksBoardViewProps) {
  const { data: sections = [] } = useMyTasksSections();
  const createSection = useCreateSection();
  const moveTask = useMoveTaskToSection();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

  const [activeTask, setActiveTask] = useState<MyTaskWithSection | null>(null);

  const grouped = useMemo(
    () => groupTasksBySection(tasks, sections),
    [tasks, sections]
  );

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
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

      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId },
      });

      const targetTasks = tasks.filter(
        (t) => t.my_section_id === targetSectionId && t.id !== taskId
      );
      const maxOrder = targetTasks.reduce(
        (max, t) => Math.max(max, t.my_sort_order),
        0
      );

      moveTask.mutate({
        task_id: taskId,
        section_id: targetSectionId,
        sort_order: maxOrder + 1,
      });
    },
    [tasks, sections, moveTask, undo]
  );

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { taskId, toSection } = action.inverse as {
      taskId: string;
      toSection: string | null;
    };

    moveTask.mutate(
      { task_id: taskId, section_id: toSection, sort_order: 0 },
      {
        onSuccess: () =>
          toast({ title: "Desfeito", description: "Tarefa movida de volta." }),
      }
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleUndo);

  const handleAddSection = useCallback(() => {
    if (!tenantId) return;
    const maxOrder = sections.reduce(
      (max, s) => Math.max(max, s.sort_order),
      0
    );
    createSection.mutate({
      tenant_id: tenantId,
      name: "Nova seção",
      sort_order: maxOrder + 1,
    });
  }, [tenantId, sections, createSection]);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
        {sortedSections.map((section) => {
          const sectionTasks = grouped.get(section.id) ?? [];
          return (
            <BoardColumn
              key={section.id}
              sectionId={section.id}
              sectionName={section.name}
              tasks={sectionTasks}
              onSelect={onSelect}
            />
          );
        })}

        <div className="flex w-[280px] shrink-0 flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400"
            onClick={handleAddSection}
          >
            <IconPlus className="mr-1.5 h-4 w-4" />
            Adicionar seção
          </Button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask as TaskRow} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
