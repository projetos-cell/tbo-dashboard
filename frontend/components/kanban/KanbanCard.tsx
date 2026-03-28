"use client";

import type { ElementType } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconDots, IconFlag, IconFlag2, IconFlag3 } from "@tabler/icons-react";

import type { KanbanTask } from "@/validations/kanban.schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const priorityConfig = {
  low: {
    label: "Baixa",
    icon: IconFlag,
    className: "text-muted-foreground",
  },
  medium: {
    label: "Média",
    icon: IconFlag2,
    className: "text-yellow-500",
  },
  high: {
    label: "Alta",
    icon: IconFlag3,
    className: "text-destructive",
  },
} satisfies Record<KanbanTask["priority"], { label: string; icon: ElementType; className: string }>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KanbanCardProps {
  task: KanbanTask;
  isDragOverlay?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanCard({ task, isDragOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={[
        "group dark:bg-card relative gap-0 rounded-lg bg-white py-0 shadow-sm transition-shadow",
        isDragOverlay
          ? "rotate-1 cursor-grabbing shadow-xl"
          : "cursor-grab hover:shadow-md active:cursor-grabbing",
      ].join(" ")}
    >
      {/* Drag handle — flutua no topo-esquerdo, aparece no hover */}
      <span
        aria-hidden
        className="absolute top-2.5 left-1.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <IconGripVertical size={14} />
      </span>

      {/* Header: Label (esq) | Dots (dir) */}
      <CardHeader className="flex flex-row items-center justify-between px-3 pt-3 pb-0">
        {task.label ? (
          <Badge
            variant="outline"
            className="h-5 border-orange-300 bg-orange-50 px-1.5 text-[10px] font-medium text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
          >
            {task.label}
          </Badge>
        ) : (
          <span className="h-5" />
        )}

        <button
          type="button"
          aria-label="Opções do card"
          className="rounded p-0.5 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <IconDots size={15} />
        </button>
      </CardHeader>

      {/* Content: Título + Footer */}
      <CardContent className="flex flex-col gap-3 px-3 pt-2 pb-3">
        <p className="text-sm leading-snug font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>

        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 text-xs ${priority.className}`}>
            <PriorityIcon size={13} />
            {priority.label}
          </span>

          {task.assignee && (
            <Avatar size="sm" title={task.assignee.name}>
              <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
              <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
