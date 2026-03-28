"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TASK_STATUS } from "@/lib/constants";
import { TaskStatusToggle } from "./task-status-toggle";
import { TaskActionsToolbar } from "./task-actions-toolbar";
import { TaskFollowButton } from "./task-follow-button";
import { useTaskDependencies } from "@/features/tasks/hooks/use-task-dependencies";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailHeaderProps {
  task: TaskRow;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function TaskDetailHeader({
  task,
  onClose,
  isFullscreen,
  onToggleFullscreen,
}: TaskDetailHeaderProps) {
  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const { data: deps = [] } = useTaskDependencies(task.id);

  const predecessorCount = deps.filter((d) => d.successor_id === task.id).length;
  const isBlocked = predecessorCount > 0 && !task.is_completed;

  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
      {/* Left: status + blocked indicator */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <TaskStatusToggle task={task} />

        {statusCfg && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm shrink-0"
            style={{ backgroundColor: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        )}

        {isBlocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 cursor-default shrink-0">
                <IconAlertTriangle className="h-3 w-3" />
                Bloqueada
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Depende de {predecessorCount} tarefa
              {predecessorCount !== 1 ? "s" : ""} ainda não concluída
              {predecessorCount !== 1 ? "s" : ""}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Right: follow + actions toolbar */}
      <div className="flex items-center gap-1 shrink-0">
        <TaskFollowButton taskId={task.id} showCount />
        <div className="w-px h-4 bg-border mx-0.5" />
        <TaskActionsToolbar
          task={task}
          onClose={onClose}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
