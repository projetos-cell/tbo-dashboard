"use client";

import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";

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
      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md"
      onClick={onClick}
    >
      {/* Title */}
      <p className="text-sm font-medium leading-tight line-clamp-2">
        {task.title}
      </p>

      {/* Status + Priority badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {statusCfg && (
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px]"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </Badge>
        )}
        {priCfg && (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] border-current"
            style={{ color: priCfg.color }}
          >
            {priCfg.label}
          </Badge>
        )}
      </div>

      {/* Footer: assignee + due date */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500">
        {task.assignee_name ? (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-600">
              {getInitials(task.assignee_name)}
            </div>
            <span className="max-w-[100px] truncate">
              {task.assignee_name}
            </span>
          </div>
        ) : (
          <span />
        )}
        {task.due_date && (
          <div
            className={`flex items-center gap-1 ${overdue ? "font-medium text-red-600" : ""}`}
          >
            <Calendar className="h-3 w-3" />
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
