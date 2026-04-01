"use client";

import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendar, IconCircleCheck, IconCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TaskCardProps {
  task: TaskRow;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-3 transition-all",
        "hover:shadow-md hover:border-primary/20",
        overdue && "border-red-200 dark:border-red-900/40",
        task.is_completed && "opacity-60"
      )}
      onClick={onClick}
    >
      {/* Row 1: Checkbox + Title */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">
          {task.is_completed ? (
            <IconCircleCheck className="h-4 w-4 text-emerald-500" />
          ) : (
            <IconCircle className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
          )}
        </span>
        <p
          className={cn(
            "text-sm font-medium leading-tight line-clamp-2",
            task.is_completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
      </div>

      {/* Row 2: Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-6">
        {statusCfg && (
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] font-medium"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </Badge>
        )}
        {priCfg && (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] font-medium border-current"
            style={{ color: priCfg.color }}
          >
            {priCfg.label}
          </Badge>
        )}
      </div>

      {/* Row 3: Footer — assignee + due date */}
      <div className="mt-2.5 flex items-center justify-between pl-6 text-xs text-muted-foreground">
        {task.assignee_name ? (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
              {getInitials(task.assignee_name)}
            </div>
            <span className="max-w-[90px] truncate">{task.assignee_name}</span>
          </div>
        ) : (
          <span />
        )}
        {task.due_date && (
          <div
            className={cn(
              "flex items-center gap-1",
              overdue && "font-medium text-red-600 dark:text-red-400"
            )}
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
    </div>
  );
}
