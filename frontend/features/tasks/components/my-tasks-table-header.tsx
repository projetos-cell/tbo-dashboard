"use client";

import { useCallback } from "react";
import {
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableHead } from "./my-tasks-sortable-head";

interface MyTasksTableHeaderProps {
  columns: ResolvedColumn[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
  onLiveResize?: (columnId: string, width: number) => void;
  onReorderColumns?: (columns: ResolvedColumn[]) => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onToggleAll?: () => void;
}

export function MyTasksTableHeader({
  columns,
  sortBy,
  sortDirection,
  onSort,
  onResizeColumn,
  onLiveResize,
  onReorderColumns,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
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
      <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <TableRow className="hover:bg-transparent border-b border-border/30">
          {/* Select-all checkbox */}
          <TableHead className="w-9 px-2">
            <Checkbox
              checked={isIndeterminate ? "indeterminate" : (isAllSelected ?? false)}
              onCheckedChange={onToggleAll}
              aria-label="Selecionar todas as tarefas"
              className="opacity-60 hover:opacity-100 data-[state=checked]:opacity-100 data-[state=indeterminate]:opacity-100 transition-opacity"
            />
          </TableHead>

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
                onLiveResize={onLiveResize}
                dndEnabled={!!onReorderColumns}
              />
            ))}
          </SortableContext>
        </TableRow>
      </TableHeader>
    </DndContext>
  );
}
