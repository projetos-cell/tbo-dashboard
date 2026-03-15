"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TASK_APPROVAL_STATUS,
  type TaskApprovalStatusKey,
} from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export function TaskApprovalSelect({ task }: { task: TaskRow }) {
  const updateTask = useUpdateTask();
  const currentKey = ((task as Record<string, unknown>).approval_status as string) ?? "none";
  const current = TASK_APPROVAL_STATUS[currentKey as TaskApprovalStatusKey];

  function handleChange(value: string) {
    updateTask.mutate({
      id: task.id,
      updates: { approval_status: value } as never,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="focus:outline-none">
          <Badge
            variant="secondary"
            className="cursor-pointer text-xs gap-1"
            style={
              current && currentKey !== "none"
                ? { backgroundColor: current.bg, color: current.color }
                : undefined
            }
          >
            {current?.label ?? "Sem aprovação"}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs">Status de aprovação</DropdownMenuLabel>
        {(
          Object.entries(TASK_APPROVAL_STATUS) as [
            TaskApprovalStatusKey,
            (typeof TASK_APPROVAL_STATUS)[TaskApprovalStatusKey],
          ][]
        ).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleChange(key)}
            className="gap-2"
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span>{config.label}</span>
            {key === currentKey && (
              <span className="ml-auto text-xs text-muted-foreground">atual</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
