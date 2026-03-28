"use client";

import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import type { TaskRow } from "./search-dialog-types";

interface SearchResultRowProps {
  task: TaskRow;
  projectName: string;
  onClick: () => void;
}

export function SearchResultRow({
  task,
  projectName,
  onClick,
}: SearchResultRowProps) {
  const statusConf = TASK_STATUS[task.status as TaskStatusKey];
  const priorityConf = TASK_PRIORITY[task.priority as TaskPriorityKey];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
    >
      {/* Status dot */}
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: statusConf?.color ?? "#6b7280" }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{task.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{projectName}</span>
          {task.assignee_name && (
            <>
              <span>·</span>
              <span className="truncate">{task.assignee_name}</span>
            </>
          )}
          {task.due_date && (
            <>
              <span>·</span>
              <span>
                {new Date(task.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-1.5">
        {statusConf && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: statusConf.bg, color: statusConf.color }}
          >
            {statusConf.label}
          </span>
        )}
        {priorityConf && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: priorityConf.bg, color: priorityConf.color }}
          >
            {priorityConf.label}
          </span>
        )}
      </div>
    </button>
  );
}
