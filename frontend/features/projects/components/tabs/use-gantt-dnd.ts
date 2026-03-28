import { useState, useCallback } from "react";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import {
  useMoveProjectTask,
  useReorderProjectTasks,
} from "@/features/projects/hooks/use-project-tasks";
import type { TaskRow } from "./gantt-helpers";

interface UseGanttDndOptions {
  projectId: string;
  parents: TaskRow[];
}

export function useGanttDnd({ projectId, parents }: UseGanttDndOptions) {
  const { toast } = useToast();
  const moveTask = useMoveProjectTask(projectId);
  const reorderTasksMutation = useReorderProjectTasks(projectId);
  const undo = useUndoStack();
  const [ganttActiveId, setGanttActiveId] = useState<string | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleGanttDragEnd = useCallback(
    (event: DragEndEvent) => {
      setGanttActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Skip section items
      if (taskId.startsWith("section-") || overId.startsWith("section-")) return;

      const task = parents.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target section from over item
      const overTask = parents.find((t) => t.id === overId);
      const targetSectionId = overTask?.section_id ?? null;
      const oldSectionId = task.section_id;

      if (targetSectionId !== oldSectionId) {
        undo.push({
          type: "MOVE_TASK_SECTION",
          payload: { taskId, toSection: targetSectionId },
          inverse: { taskId, toSection: oldSectionId },
        });

        const targetTasks = parents.filter(
          (t) => t.section_id === targetSectionId && t.id !== taskId,
        );
        const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order_index), 0);

        moveTask.mutate({ taskId, sectionId: targetSectionId, orderIndex: maxOrder + 1 });
        return;
      }

      // Reorder within same section
      const sectionTasks = parents
        .filter((t) => t.section_id === targetSectionId)
        .sort((a, b) => a.order_index - b.order_index);

      const oldIndex = sectionTasks.findIndex((t) => t.id === taskId);
      const newIndex = sectionTasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = [...sectionTasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      reorderTasksMutation.mutate(
        reordered.map((t, i) => ({ id: t.id, order_index: i })),
      );
    },
    [parents, moveTask, reorderTasksMutation, undo],
  );

  const handleGanttUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;
    const { taskId, toSection } = action.inverse as {
      taskId: string;
      toSection: string | null;
    };
    moveTask.mutate(
      { taskId, sectionId: toSection, orderIndex: 0 },
      {
        onSuccess: () => {
          toast({ title: "Desfeito", description: "Tarefa movida de volta." });
        },
      },
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleGanttUndo);

  return {
    ganttActiveId,
    setGanttActiveId,
    dndSensors,
    handleGanttDragEnd,
  };
}
