"use client";

import { TaskCard } from "./task-card";
import { TaskContextMenu } from "./task-context-menu";
import type { Database } from "@/lib/supabase/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface SortableTaskCardProps {
  task: TaskRow;
  onClick?: () => void;
}

export function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TaskContextMenu task={task} onSelect={() => onClick?.()}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TaskCard task={task} onClick={onClick} />
      </div>
    </TaskContextMenu>
  );
}
