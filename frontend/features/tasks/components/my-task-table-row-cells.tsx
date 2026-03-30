"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InlineSelect } from "@/components/ui/inline-select";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCheck,
  IconCircle,
  IconGripVertical,
} from "@tabler/icons-react";
import type { useSortable } from "@dnd-kit/sortable";
import type { InlineSelectOption } from "@/components/ui/inline-select";
import { InlineDatePicker } from "./inline-date-picker";

type SortableReturn = ReturnType<typeof useSortable>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const STATUS_OPTIONS: InlineSelectOption[] = Object.entries(TASK_STATUS).map(
  ([value, cfg]) => ({ value, label: cfg.label, color: cfg.color, bg: cfg.bg })
);

const PRIORITY_OPTIONS: InlineSelectOption[] = Object.entries(TASK_PRIORITY).map(
  ([value, cfg]) => ({ value, label: cfg.label, color: cfg.color, bg: cfg.bg })
);

export interface CellContext {
  task: MyTaskWithSection;
  projectName?: string;
  onClick?: () => void;
  overdue: boolean;
  toggleComplete: (e: React.MouseEvent) => void;
  updateTask: ReturnType<typeof useUpdateTask>;
  attributes: SortableReturn["attributes"];
  listeners: SortableReturn["listeners"];
  dndDisabled?: boolean;
}

export function renderCellContent(columnId: string, ctx: CellContext) {
  switch (columnId) {
    case "tarefa":
      return <TaskNameCell {...ctx} />;
    case "prazo":
      return <DueDateCell {...ctx} />;
    case "projeto":
      return <ProjectCell {...ctx} />;
    case "status":
      return <StatusCell {...ctx} />;
    case "prioridade":
      return <PriorityCell {...ctx} />;
    case "responsavel":
      return <AssigneeCell {...ctx} />;
    default:
      return null;
  }
}

function TaskNameCell({
  task,
  onClick,
  toggleComplete,
  attributes,
  listeners,
  dndDisabled,
}: CellContext) {
  return (
    <div className="flex items-center gap-1.5">
      {!dndDisabled && (
        <button
          {...(attributes as React.HTMLAttributes<HTMLButtonElement>)}
          {...(listeners as React.HTMLAttributes<HTMLButtonElement>)}
          className="shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          tabIndex={-1}
        >
          <IconGripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0"
        onClick={toggleComplete}
        aria-label="Alternar conclusão"
      >
        {task.is_completed ? (
          <IconCheck className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <IconCircle className="h-3.5 w-3.5 text-gray-400" />
        )}
      </Button>

      <div className="min-w-0 flex-1 cursor-pointer" onClick={onClick}>
        <p
          className={`truncate text-sm ${task.is_completed ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </p>
      </div>
    </div>
  );
}

function DueDateCell({ task, overdue, updateTask }: CellContext) {
  return (
    <div className="flex items-center gap-1">
      {task.start_date && (
        <>
          <span className="text-[10px] text-muted-foreground/70">
            {format(new Date(task.start_date + "T12:00:00"), "dd MMM", { locale: ptBR })}
          </span>
          <span className="text-[10px] text-muted-foreground/50">→</span>
        </>
      )}
      <InlineDatePicker
        value={task.due_date ?? undefined}
        overdue={overdue}
        onChange={(date) =>
          updateTask.mutate({
            id: task.id,
            updates: {
              due_date: date ? date.toISOString().split("T")[0] : null,
            },
          })
        }
      />
    </div>
  );
}

function ProjectCell({ projectName }: CellContext) {
  if (!projectName) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }
  return (
    <span className="truncate text-xs text-muted-foreground">{projectName}</span>
  );
}

function StatusCell({ task, updateTask }: CellContext) {
  return (
    <InlineSelect
      value={task.status}
      options={STATUS_OPTIONS}
      onSave={(val) =>
        updateTask.mutate({
          id: task.id,
          updates: { status: val, is_completed: val === "concluida" },
        })
      }
    />
  );
}

function PriorityCell({ task, updateTask }: CellContext) {
  return (
    <InlineSelect
      value={task.priority}
      options={PRIORITY_OPTIONS}
      onSave={(val) =>
        updateTask.mutate({
          id: task.id,
          updates: { priority: val },
        })
      }
    />
  );
}

function AssigneeCell({ task }: CellContext) {
  if (!task.assignee_name) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }
  return (
    <Avatar className="h-6 w-6">
      {task.assignee_avatar_url && (
        <AvatarImage src={task.assignee_avatar_url} alt={task.assignee_name} />
      )}
      <AvatarFallback className="text-[10px] font-semibold bg-gray-200 text-gray-600">
        {getInitials(task.assignee_name)}
      </AvatarFallback>
    </Avatar>
  );
}
