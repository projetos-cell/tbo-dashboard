"use client";

import { useState } from "react";
import {
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
  IconUser,
  IconCalendar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { ProjectSubtaskRow } from "./project-subtask-row";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectTaskRowProps {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
}

export function ProjectTaskRow({ task, subtasks, onSelect }: ProjectTaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const updateTask = useUpdateTask();
  const done = !!task.is_completed;
  const hasSubtasks = subtasks.length > 0;
  const completedSubs = subtasks.filter((s) => s.is_completed).length;
  const statusConfig = TASK_STATUS[task.status as TaskStatusKey];
  const priorityConfig = task.priority ? TASK_PRIORITY[task.priority as TaskPriorityKey] : null;

  const overdue =
    !done && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  function toggleComplete() {
    updateTask.mutate({
      id: task.id,
      updates: {
        is_completed: !done,
        status: !done ? "concluida" : "pendente",
      },
    });
  }

  return (
    <div>
      {/* Parent row */}
      <div
        className="group flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted/50 cursor-pointer"
        onClick={() => onSelect(task.id)}
      >
        {/* Expand chevron */}
        <button
          type="button"
          className={cn(
            "shrink-0 transition-transform",
            !hasSubtasks && "invisible",
          )}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          <IconChevronRight
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>

        {/* Completion toggle */}
        <button
          type="button"
          className="shrink-0"
          onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
        >
          {done ? (
            <IconCircleCheck className="h-4 w-4 text-green-500" />
          ) : (
            <IconCircle className="text-muted-foreground/40 h-4 w-4" />
          )}
        </button>

        {/* Priority dot */}
        {priorityConfig && (
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: priorityConfig.color }}
          />
        )}

        {/* Title */}
        <span
          className={cn(
            "flex-1 truncate text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>

        {/* Subtask counter */}
        {hasSubtasks && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {completedSubs}/{subtasks.length}
          </span>
        )}

        {/* Status badge */}
        {statusConfig && !done && (
          <Badge
            variant="secondary"
            className="hidden text-[10px] sm:inline-flex"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </Badge>
        )}

        {/* Assignee */}
        {task.assignee_name && (
          <span className="text-muted-foreground hidden items-center gap-1 text-xs lg:flex">
            <IconUser className="h-3 w-3" />
            <span className="max-w-[80px] truncate">{task.assignee_name}</span>
          </span>
        )}

        {/* Due date */}
        {task.due_date && (
          <span
            className={cn(
              "text-muted-foreground flex items-center gap-1 text-xs",
              overdue && "text-red-600 font-medium",
            )}
          >
            <IconCalendar className="h-3 w-3" />
            {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
          </span>
        )}
      </div>

      {/* Subtasks */}
      {expanded && hasSubtasks && (
        <div className="border-l-2 border-muted ml-5">
          {subtasks.map((sub) => (
            <ProjectSubtaskRow key={sub.id} subtask={sub} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
