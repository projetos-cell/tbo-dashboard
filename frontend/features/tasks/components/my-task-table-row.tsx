"use client";

import { memo, useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskRowContextMenu } from "./task-row-context-menu";
import { renderCellContent } from "./my-task-table-row-cells";
import { cn } from "@/lib/utils";

const CELL_BORDER = "";

const DEFAULT_COLS: ResolvedColumn[] = [
  { id: "tarefa", label: "Tarefa", width: 0, minWidth: 200, alwaysVisible: true },
  { id: "prazo", label: "Prazo", width: 110, minWidth: 80, alwaysVisible: false },
  { id: "projeto", label: "Projeto", width: 140, minWidth: 80, alwaysVisible: false },
  { id: "status", label: "Status", width: 130, minWidth: 80, alwaysVisible: false },
  { id: "prioridade", label: "Prioridade", width: 120, minWidth: 80, alwaysVisible: false },
  { id: "responsavel", label: "Responsável", width: 44, minWidth: 44, alwaysVisible: false },
];

interface MyTaskTableRowProps {
  task: MyTaskWithSection;
  columns?: ResolvedColumn[];
  projectName?: string;
  onClick?: () => void;
  isDragOverlay?: boolean;
  dndDisabled?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
}

function MyTaskTableRowInner({
  task,
  columns,
  projectName,
  onClick,
  isDragOverlay,
  dndDisabled,
  isSelected,
  onToggle,
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

  const visibleCols = columns ?? DEFAULT_COLS;

  return (
    <TaskRowContextMenu task={task} onOpenDetail={onClick}>
      <TableRow
        ref={setNodeRef}
        style={style}
        className={cn(
          "group h-11 transition-colors border-b border-border/30 last:border-b-0",
          isSelected && "bg-primary/5",
          !isSelected && "hover:bg-muted/40",
          isDragOverlay && "shadow-lg ring-2 ring-primary/20 bg-background",
          isDragging && "z-10",
          overdue && !task.is_completed && "border-l-2 border-l-red-400",
          task.is_completed && "opacity-40"
        )}
      >
        {/* Checkbox column */}
        <TableCell className="w-9 py-0 px-2">
          <Checkbox
            checked={isSelected ?? false}
            onCheckedChange={(checked) => { if (checked !== "indeterminate") onToggle?.(); }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Selecionar tarefa"
            className="opacity-40 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
          />
        </TableCell>

        {visibleCols.map((col, idx) => {
          const isLast = idx === visibleCols.length - 1;
          const borderClass = isLast ? "" : CELL_BORDER;
          const widthStyle: React.CSSProperties =
            col.id === "tarefa"
              ? {}
              : { width: `var(--col-${col.id}-w, ${col.width}px)`, minWidth: col.minWidth };

          return (
            <TableCell
              key={col.id}
              className={`${borderClass} py-0 px-2 overflow-hidden`}
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

export const MyTaskTableRow = memo(MyTaskTableRowInner, (prev, next) => {
  // Re-render only when these data-driven props change
  if (prev.task !== next.task) return false;
  if (prev.projectName !== next.projectName) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.dndDisabled !== next.dndDisabled) return false;
  if (prev.isDragOverlay !== next.isDragOverlay) return false;
  if (prev.columns !== next.columns) return false;
  // onClick/onToggle are stable refs from parent (useCallback or inline in map)
  return true;
});
