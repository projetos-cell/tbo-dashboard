"use client";

import {
  IconCircleCheck,
  IconCircle,
  IconGripVertical,
  IconExternalLink,
  IconX,
} from "@tabler/icons-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export interface SubtaskRowProps {
  sub: TaskRow;
  onToggle: (sub: TaskRow) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  isDeleting: boolean;
}

export function SubtaskRow({
  sub,
  onToggle,
  onDelete,
  onOpen,
  isDeleting,
}: SubtaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sub.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity touch-none"
        aria-label="Reordenar subtarefa"
        tabIndex={-1}
      >
        <IconGripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Status checkbox */}
      <button
        type="button"
        onClick={() => onToggle(sub)}
        className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-colors"
        aria-label={sub.is_completed ? "Reabrir subtarefa" : "Concluir subtarefa"}
      >
        {sub.is_completed ? (
          <IconCircleCheck className="h-4 w-4 text-green-600" />
        ) : (
          <IconCircle className="h-4 w-4 text-muted-foreground/50" />
        )}
      </button>

      {/* Title → abre detail sheet */}
      <button
        type="button"
        className={`flex-1 text-left text-sm truncate transition-colors hover:text-primary ${
          sub.is_completed ? "line-through text-muted-foreground/60" : ""
        }`}
        onClick={() => onOpen(sub.id)}
      >
        {sub.title}
      </button>

      {/* Open icon (explicit) */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
        aria-label="Abrir subtarefa"
        onClick={() => onOpen(sub.id)}
      >
        <IconExternalLink className="h-3 w-3" />
      </Button>

      {/* Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
        aria-label="Excluir subtarefa"
        onClick={() => onDelete(sub.id)}
        disabled={isDeleting}
      >
        <IconX className="h-3 w-3" />
      </Button>
    </div>
  );
}
