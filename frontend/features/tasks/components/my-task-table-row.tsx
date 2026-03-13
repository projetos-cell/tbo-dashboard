"use client";

import { useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InlineSelect } from "@/components/ui/inline-select";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InlineSelectOption } from "@/components/ui/inline-select";
import { TaskRowContextMenu } from "./task-row-context-menu";
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

const CELL_BORDER = "border-r border-border/40";

function getResponsiveClass(columnId: string): string {
  switch (columnId) {
    case "projeto":
      return "hidden lg:table-cell";
    case "status":
    case "prioridade":
      return "hidden sm:table-cell";
    case "responsavel":
      return "hidden md:table-cell";
    default:
      return "";
  }
}

interface MyTaskTableRowProps {
  task: MyTaskWithSection;
  columns?: ResolvedColumn[];
  projectName?: string;
  onClick?: () => void;
  isDragOverlay?: boolean;
  dndDisabled?: boolean;
}

export function MyTaskTableRow({
  task,
  columns,
  projectName,
  onClick,
  isDragOverlay,
  dndDisabled,
}: MyTaskTableRowProps) {
  const updateTask = useUpdateTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", sectionId: task.my_section_id },
    disabled: isDragOverlay || dndDisabled,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const toggleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateTask.mutate({
        id: task.id,
        updates: {
          status: task.is_completed ? "pendente" : "concluida",
          is_completed: !task.is_completed,
          completed_at: task.is_completed ? null : new Date().toISOString(),
        },
      });
    },
    [updateTask, task.id, task.is_completed]
  );

  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  // Default columns if none provided (backward compat)
  const defaultCols: ResolvedColumn[] = [
    { id: "tarefa", label: "Tarefa", width: 0, minWidth: 200, alwaysVisible: true },
    { id: "prazo", label: "Prazo", width: 110, minWidth: 80, alwaysVisible: false },
    { id: "projeto", label: "Projeto", width: 140, minWidth: 80, alwaysVisible: false },
    { id: "status", label: "Status", width: 130, minWidth: 80, alwaysVisible: false },
    { id: "prioridade", label: "Prioridade", width: 120, minWidth: 80, alwaysVisible: false },
    { id: "responsavel", label: "Responsável", width: 44, minWidth: 44, alwaysVisible: false },
  ];

  const visibleCols = columns ?? defaultCols;

  return (
    <TaskRowContextMenu task={task} onOpenDetail={onClick}>
      <TableRow
        ref={setNodeRef}
        style={style}
        className={`group h-10 ${isDragOverlay ? "shadow-lg ring-2 ring-primary/20 bg-background" : ""} ${isDragging ? "z-10" : ""}`}
      >
        {visibleCols.map((col, idx) => {
          const isLast = idx === visibleCols.length - 1;
          const borderClass = isLast ? "" : CELL_BORDER;
          const responsiveClass = getResponsiveClass(col.id);
          const widthStyle =
            col.id === "tarefa" ? {} : { width: col.width, minWidth: col.minWidth };

          return (
            <TableCell
              key={col.id}
              className={`${borderClass} ${responsiveClass} py-0 px-2`}
              style={widthStyle}
            >
              {renderCellContent(col.id, {
                task,
                projectName,
                onClick,
                overdue: !!overdue,
                toggleComplete,
                updateTask,
                attributes,
                listeners,
                dndDisabled,
              })}
            </TableCell>
          );
        })}
      </TableRow>
    </TaskRowContextMenu>
  );
}

// ─── Cell Renderers ───────────────────────────────────────────

interface CellContext {
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

function renderCellContent(columnId: string, ctx: CellContext) {
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
          <GripVertical className="h-3.5 w-3.5" />
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
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Circle className="h-3.5 w-3.5 text-gray-400" />
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
    <span className="truncate text-xs text-muted-foreground">
      {projectName}
    </span>
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
      <AvatarFallback className="text-[10px] font-semibold bg-gray-200 text-gray-600">
        {getInitials(task.assignee_name)}
      </AvatarFallback>
    </Avatar>
  );
}
