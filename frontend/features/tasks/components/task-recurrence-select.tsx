"use client";

import { IconRepeat } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { TASK_RECURRENCE, type TaskRecurrenceKey } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskRecurrenceSelectProps {
  task: TaskRow;
}

export function TaskRecurrenceSelect({ task }: TaskRecurrenceSelectProps) {
  const updateTask = useUpdateTask();
  const current = ((task as Record<string, unknown>).recurrence ?? "none") as TaskRecurrenceKey;
  const config = TASK_RECURRENCE[current];

  function handleChange(value: TaskRecurrenceKey) {
    updateTask.mutate({
      id: task.id,
      updates: { recurrence: value } as never,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-sm transition-colors hover:bg-muted"
        >
          <IconRepeat className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {config?.label ?? "Sem repetição"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs">Repetição</DropdownMenuLabel>
        {(Object.entries(TASK_RECURRENCE) as [TaskRecurrenceKey, (typeof TASK_RECURRENCE)[TaskRecurrenceKey]][]).map(
          ([key, cfg]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleChange(key)}
              className="gap-2"
            >
              <span>{cfg.label}</span>
              {key === current && (
                <span className="ml-auto text-xs text-muted-foreground">atual</span>
              )}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
