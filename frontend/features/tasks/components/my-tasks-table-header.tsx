"use client";

import { useCallback, useRef } from "react";
import {
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import type { ColumnPref } from "@/features/tasks/lib/my-tasks-columns";

// Map column id → sort accessor
const SORT_ACCESSOR: Record<string, string> = {
  tarefa: "title",
  prazo: "due_date",
  projeto: "project_id",
  status: "status",
  prioridade: "priority",
};

interface MyTasksTableHeaderProps {
  columns: ResolvedColumn[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
}

export function MyTasksTableHeader({
  columns,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
}: MyTasksTableHeaderProps) {
  return (
    <TableHeader className="sticky top-0 z-10 bg-background">
      <TableRow className="hover:bg-transparent border-b-2">
        {columns.map((col, i) => (
          <ResizableHead
            key={col.id}
            column={col}
            isLast={i === columns.length - 1}
            isFirst={i === 0}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onResizeColumn={onResizeColumn}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
}

// ─── Resizable Header Cell ────────────────────────────────────

function ResizableHead({
  column,
  isLast,
  isFirst,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
}: {
  column: ResolvedColumn;
  isLast: boolean;
  isFirst: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
}) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const accessor = SORT_ACCESSOR[column.id];
  const isSorted = accessor && sortBy === accessor;
  const isSortable = !!accessor && !!onSort;

  const handleClick = useCallback(() => {
    if (!isSortable || !accessor) return;
    if (isSorted) {
      onSort(accessor, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(accessor, "asc");
    }
  }, [isSortable, accessor, isSorted, sortDirection, onSort]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!onResizeColumn || !thRef.current) return;

      const startX = e.clientX;
      const startWidth = thRef.current.getBoundingClientRect().width;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = Math.max(column.minWidth, startWidth + delta);
        if (thRef.current) {
          thRef.current.style.width = `${newWidth}px`;
        }
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";

        if (thRef.current) {
          const finalWidth = thRef.current.getBoundingClientRect().width;
          onResizeColumn(column.id, Math.round(finalWidth));
        }
      };

      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [column.id, column.minWidth, onResizeColumn]
  );

  // Width style: "tarefa" is flex (no fixed width), others use col width
  const widthStyle =
    column.id === "tarefa"
      ? {}
      : { width: column.width, minWidth: column.minWidth };

  // Responsive visibility
  const responsiveClass = getResponsiveClass(column.id);

  return (
    <TableHead
      ref={thRef}
      className={cn(
        "relative text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none",
        isFirst && "pl-10",
        !isLast && "border-r border-border/40",
        isSortable && "cursor-pointer hover:text-foreground transition-colors",
        responsiveClass
      )}
      style={widthStyle}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{column.label}</span>
        {isSorted && (
          <span className="text-primary">
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </span>
        )}
      </div>

      {/* Resize handle */}
      {!isLast && onResizeColumn && column.id !== "tarefa" && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 transition-colors"
          onMouseDown={handleResizeStart}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </TableHead>
  );
}

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
