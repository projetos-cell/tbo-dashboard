"use client";

import { useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InlineSelect } from "@/components/ui/inline-select";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, Circle, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InlineSelectOption } from "@/components/ui/inline-select";

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

interface MyTaskTableRowProps {
  task: MyTaskWithSection;
  projectName?: string;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export function MyTaskTableRow({
  task,
  projectName,
  onClick,
  isDragOverlay,
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
    disabled: isDragOverlay,
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
        },
      });
    },
    [updateTask, task.id, task.is_completed]
  );

  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group h-10 ${isDragOverlay ? "shadow-lg ring-2 ring-primary/20 bg-background" : ""} ${isDragging ? "z-10" : ""}`}
    >
      {/* Tarefa */}
      <TableCell className={`${CELL_BORDER} py-0 px-2`}>
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            tabIndex={-1}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

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
      </TableCell>

      {/* Prazo */}
      <TableCell className={`${CELL_BORDER} py-0 px-2 w-[110px]`}>
        {task.due_date ? (
          <div
            className={`flex items-center gap-1 text-xs ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
          >
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {format(new Date(task.due_date + "T12:00:00"), "dd MMM", {
                locale: ptBR,
              })}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Projeto */}
      <TableCell
        className={`${CELL_BORDER} py-0 px-2 w-[140px] hidden lg:table-cell`}
      >
        {projectName ? (
          <span className="truncate text-xs text-muted-foreground">
            {projectName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell
        className={`${CELL_BORDER} py-0 px-2 w-[130px] hidden sm:table-cell`}
      >
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
      </TableCell>

      {/* Prioridade */}
      <TableCell
        className={`${CELL_BORDER} py-0 px-2 w-[120px] hidden sm:table-cell`}
      >
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
      </TableCell>

      {/* Responsável */}
      <TableCell className="py-0 px-2 w-[44px] hidden md:table-cell">
        {task.assignee_name ? (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] font-semibold bg-gray-200 text-gray-600">
              {getInitials(task.assignee_name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
