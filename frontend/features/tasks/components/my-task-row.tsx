"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendar, IconCheck, IconCircle, IconGripVertical } from "@tabler/icons-react";
import { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface MyTaskRowProps {
  task: MyTaskWithSection;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export function MyTaskRow({ task, onClick, isDragOverlay }: MyTaskRowProps) {
  const updateTask = useUpdateTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", sectionId: task.my_section_id },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const toggleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateTask.mutate({
        id: task.id,
        updates: {
          status: task.is_completed ? "pendente" : "concluida",
          is_completed: !task.is_completed,
        },
      });
    },
    [updateTask, task.id, task.is_completed]
  );

  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`group flex items-center gap-2 rounded-md border bg-white px-3 py-2 transition-colors hover:bg-gray-50 ${
        isDragOverlay ? "shadow-lg ring-2 ring-primary/20" : ""
      } ${isDragging ? "z-10" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        tabIndex={-1}
      >
        <IconGripVertical className="h-4 w-4" />
      </button>

      {/* Check button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={toggleComplete}
        aria-label="Alternar conclusão"
      >
        {task.is_completed ? (
          <IconCheck className="h-4 w-4 text-green-600" />
        ) : (
          <IconCircle className="h-4 w-4 text-gray-400" />
        )}
      </Button>

      {/* Title — clickable area */}
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onClick}>
        <p
          className={`truncate text-sm font-medium ${task.is_completed ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </p>
      </div>

      {/* Priority badge */}
      {priCfg && (
        <Badge
          variant="outline"
          className="hidden h-5 shrink-0 border-current text-[10px] sm:inline-flex"
          style={{ color: priCfg.color }}
        >
          {priCfg.label}
        </Badge>
      )}

      {/* Status badge */}
      {statusCfg && (
        <Badge
          variant="secondary"
          className="hidden h-5 shrink-0 text-[10px] sm:inline-flex"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
        >
          {statusCfg.label}
        </Badge>
      )}

      {/* Assignee avatar */}
      {task.assignee_name && (
        <Avatar className="hidden h-6 w-6 shrink-0 md:flex" title={task.assignee_name}>
          {task.assignee_avatar_url && (
            <AvatarImage src={task.assignee_avatar_url} alt={task.assignee_name} />
          )}
          <AvatarFallback className="text-[10px] font-semibold bg-gray-200 text-gray-600">
            {getInitials(task.assignee_name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Due date */}
      {task.due_date && (
        <div
          className={`hidden shrink-0 items-center gap-1 text-xs lg:flex ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}
        >
          <IconCalendar className="h-3 w-3" />
          <span>
            {format(new Date(task.due_date + "T12:00:00"), "dd MMM", {
              locale: ptBR,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
