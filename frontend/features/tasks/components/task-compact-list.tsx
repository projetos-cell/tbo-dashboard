"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, Circle } from "lucide-react";
import { useCallback } from "react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TaskCompactListProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
}

export function TaskCompactList({ tasks, onSelect }: TaskCompactListProps) {
  const updateTask = useUpdateTask();

  const toggleComplete = useCallback(
    (task: TaskRow, e: React.MouseEvent) => {
      e.stopPropagation();
      updateTask.mutate({
        id: task.id,
        updates: {
          status: task.is_completed ? "pendente" : "concluida",
          is_completed: !task.is_completed,
        },
      });
    },
    [updateTask]
  );

  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        Nenhuma tarefa encontrada
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
        const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
        const overdue =
          task.due_date &&
          !task.is_completed &&
          task.due_date < new Date().toISOString().split("T")[0];

        return (
          <div
            key={task.id}
            onClick={() => onSelect(task)}
            className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
          >
            {/* Check button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={(e) => toggleComplete(task, e)}
              aria-label="Alternar conclusão"
            >
              {task.is_completed ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            {/* Title */}
            <div className="min-w-0 flex-1">
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
              <div
                className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 md:flex"
                title={task.assignee_name}
              >
                {getInitials(task.assignee_name)}
              </div>
            )}

            {/* Due date */}
            {task.due_date && (
              <div
                className={`hidden shrink-0 items-center gap-1 text-xs lg:flex ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}
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
        );
      })}
    </div>
  );
}
