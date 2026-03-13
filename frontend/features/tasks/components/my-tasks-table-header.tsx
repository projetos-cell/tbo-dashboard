"use client";

import { useCallback, useRef } from "react";
import {
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { IconArrowUp, IconArrowDown, IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorderColumns?: (columns: ResolvedColumn[]) => void;
}

export function MyTasksTableHeader({
  columns,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
  onReorderColumns,
}: MyTasksTableHeaderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !onReorderColumns) return;

      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(columns, oldIndex, newIndex);
      onReorderColumns(reordered);
    },
    [columns, onReorderColumns]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow className="hover:bg-transparent border-b-2">
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col, i) => (
              <SortableHead
                key={col.id}
                column={col}
                isLast={i === columns.length - 1}
                isFirst={i === 0}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                onResizeColumn={onResizeColumn}
                dndEnabled={!!onReorderColumns}
              />
            ))}
          </SortableContext>
        </TableRow>
      </TableHeader>
    </DndContext>
  );
}

// ─── Sortable + Resizable Header Cell ─────────────────────────

function SortableHead({
  column,
  isLast,
  isFirst,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
  dndEnabled,
}: {
  column: ResolvedColumn;
  isLast: boolean;
  isFirst: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
  dndEnabled: boolean;
}) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(column.id === "tarefa" ? {} : { width: column.width, minWidth: column.minWidth }),
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
        if (thRef.current) {
          thRef.current.style.width = `${newWidth}px`;
        }
      };

      const onMouseUp = () => {
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

  const responsiveClass = getResponsiveClass(column.id);

  // Merge refs for both sortable and resize
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
        "relative text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none",
        isFirst && "pl-10",
        !isLast && "border-r border-border/40",
        isSortable && "cursor-pointer hover:text-foreground transition-colors",
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
