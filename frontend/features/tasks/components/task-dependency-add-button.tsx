"use client";

import { IconPlus } from "@tabler/icons-react";
import { TaskDependencyPicker } from "./task-dependency-picker";
import type { DependencyType } from "@/schemas/task-dependency";

interface AddDepButtonProps {
  taskId: string;
  projectId?: string | null;
  /** true = esta tarefa é a predecessor; false = esta tarefa é a successor */
  asPredecessor: boolean;
  onAdd: (targetTaskId: string, type: DependencyType) => void;
}

export function AddDependencyButton({
  taskId,
  projectId,
  asPredecessor,
  onAdd,
}: AddDepButtonProps) {
  return (
    <TaskDependencyPicker
      currentTaskId={taskId}
      defaultProjectId={projectId}
      onSelect={onAdd}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
        title={
          asPredecessor
            ? "Esta tarefa bloqueará a selecionada"
            : "Selecionada bloqueará esta tarefa"
        }
      >
        <IconPlus className="h-3 w-3" />
        {asPredecessor ? "Adicionar tarefa bloqueada" : "Adicionar bloqueador"}
      </button>
    </TaskDependencyPicker>
  );
}
