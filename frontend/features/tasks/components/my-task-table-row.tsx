"use client";

import { useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskRowContextMenu } from "./task-row-context-menu";
import { renderCellContent } from "./my-task-table-row-cells";

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
