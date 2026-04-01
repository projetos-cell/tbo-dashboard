"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { IconPlus, IconLayoutKanban } from "@tabler/icons-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface MyTasksBoardViewProps {
  tasks: MyTaskWithSection[];
  onSelect: (task: TaskRow) => void;
}

export function MyTasksBoardView({ tasks, onSelect }: MyTasksBoardViewProps) {
  const { data: sections = [], isLoading: sectionsLoading } = useMyTasksSections();
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
              description: "Não foi possível mover a tarefa. Tente novamente.",
              variant: "destructive",
            });
          },
        }
      );
    },
    [tasks, sections, moveTask, undo, toast]
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

  if (sectionsLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex flex-col gap-2">
            <Skeleton className="h-1 w-full rounded-full" />
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 3 }).map((__, j) => (
              <Skeleton key={j} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (sortedSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <IconLayoutKanban className="h-10 w-10 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma seção criada
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Crie uma seção para organizar suas tarefas no board
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAddSection}
          disabled={createSection.isPending || !tenantId}
        >
          <IconPlus className="mr-1.5 h-4 w-4" />
          Criar primeira seção
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scroll-smooth snap-x">
        {sortedSections.map((section) => {
          const sectionTasks = grouped.get(section.id) ?? [];
          return (
            <div key={section.id} className="snap-start">
              <BoardColumn
                sectionId={section.id}
                sectionName={section.name}
                tasks={sectionTasks}
                onSelect={onSelect}
              />
            </div>
          );
        })}

        {/* Add section column */}
        <div className="flex min-w-[280px] shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 py-12">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground/50 hover:text-muted-foreground"
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
