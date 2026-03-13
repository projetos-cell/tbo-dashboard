"use client";

import {
  IconX,
  IconLoader2,
  IconExternalLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTaskById } from "@/features/tasks/services/tasks";
import { TASK_STATUS } from "@/lib/constants";

function useTaskTitle(taskId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["task-title", taskId],
    queryFn: () => getTaskById(supabase, taskId),
    staleTime: 1000 * 60 * 5,
  });
}

export interface DepItemProps {
  depId: string;
  linkedTaskId: string;
  onRemove: (depId: string) => void;
  onOpenTask?: (taskId: string) => void;
  isRemoving: boolean;
}

export function DependencyItem({
  depId,
  linkedTaskId,
  onRemove,
  onOpenTask,
  isRemoving,
}: DepItemProps) {
  const { data: linkedTask } = useTaskTitle(linkedTaskId);
  const statusCfg = linkedTask
    ? TASK_STATUS[linkedTask.status as keyof typeof TASK_STATUS]
    : null;

  return (
    <div className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60 transition-colors">
      {/* Status badge */}
      {statusCfg && (
        <span
          className="inline-flex shrink-0 h-2 w-2 rounded-full"
          style={{ backgroundColor: statusCfg.color }}
          title={statusCfg.label}
        />
      )}

      {/* Task title */}
      <button
        type="button"
        className="flex-1 text-left text-xs text-foreground hover:text-primary truncate transition-colors"
        onClick={() => onOpenTask?.(linkedTaskId)}
        disabled={!onOpenTask}
      >
        {linkedTask?.title ?? (
          <span className="text-muted-foreground italic">Carregando...</span>
        )}
      </button>

      {/* Status label */}
      {statusCfg && (
        <span
          className="text-[10px] px-1.5 py-px rounded-full text-white shrink-0"
          style={{ backgroundColor: statusCfg.color }}
        >
          {statusCfg.label}
        </span>
      )}

      {/* Open task button */}
      {onOpenTask && (
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Abrir tarefa"
          onClick={() => onOpenTask(linkedTaskId)}
        >
          <IconExternalLink className="h-3 w-3" />
        </Button>
      )}

      {/* Remove button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
        aria-label="Remover dependência"
        onClick={() => onRemove(depId)}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <IconLoader2 className="h-3 w-3 animate-spin" />
        ) : (
          <IconX className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
