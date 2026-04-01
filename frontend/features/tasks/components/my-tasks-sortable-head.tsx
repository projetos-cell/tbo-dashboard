"use client";

import { useCallback, useRef } from "react";
import { TableHead } from "@/components/ui/table";
import { IconArrowUp, IconArrowDown, IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SORT_ACCESSOR: Record<string, string> = {
  tarefa: "title",
  prazo: "due_date",
  projeto: "project_id",
  status: "status",
  prioridade: "priority",
};

// With table-fixed + column resize, we show all columns and rely on horizontal scroll
function getResponsiveClass(_columnId: string): string {
  return "";
}

interface SortableHeadProps {
  column: ResolvedColumn;
  isLast: boolean;
  isFirst: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
  onLiveResize?: (columnId: string, width: number) => void;
  dndEnabled: boolean;
}

export function SortableHead({
  column,
  isLast,
  isFirst,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
  onLiveResize,
  dndEnabled,
}: SortableHeadProps) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const accessor = SORT_ACCESSOR[column.id];
  const isSorted = accessor && sortBy === accessor;
  const isSortable = !!accessor && !!onSort;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: !dndEnabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(column.id === "tarefa"
      ? {}
      : { width: `var(--col-${column.id}-w, ${column.width}px)`, minWidth: column.minWidth }),
  };

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
        // Live update via CSS custom property (colgroup picks this up)
        onLiveResize?.(column.id, Math.round(newWidth));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        if (thRef.current) {
          const finalWidth = thRef.current.getBoundingClientRect().width;
          onResizeColumn(column.id, Math.round(finalWidth));
        }
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [column.id, column.minWidth, onResizeColumn, onLiveResize]
  );

  const responsiveClass = getResponsiveClass(column.id);

  const mergedRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      setNodeRef(node);
      (thRef as React.MutableRefObject<HTMLTableCellElement | null>).current = node;
    },
    [setNodeRef]
  );

  return (
    <TableHead
      ref={mergedRef}
      className={cn(
        "relative text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest select-none",
        isFirst && "pl-10",
        isSortable && "cursor-pointer hover:text-muted-foreground transition-colors",
        isDragging && "z-20",
        responsiveClass
      )}
      style={style}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {dndEnabled && (
          <button
            {...(attributes as React.HTMLAttributes<HTMLButtonElement>)}
            {...(listeners as React.HTMLAttributes<HTMLButtonElement>)}
            className="shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:!opacity-100 active:cursor-grabbing -ml-1 mr-0.5"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <IconGripVertical className="h-3 w-3" />
          </button>
        )}
        <span>{column.label}</span>
        {isSorted && (
          <span className="text-primary">
            {sortDirection === "asc" ? (
              <IconArrowUp className="h-3 w-3" />
            ) : (
              <IconArrowDown className="h-3 w-3" />
            )}
          </span>
        )}
      </div>

      {!isLast && onResizeColumn && column.id !== "tarefa" && (
        <div
          className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize group/resize z-10 flex items-center justify-center"
          onMouseDown={handleResizeStart}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-4 w-0.5 rounded-full bg-transparent group-hover/resize:bg-primary/40 transition-colors" />
        </div>
      )}
    </TableHead>
  );
}
