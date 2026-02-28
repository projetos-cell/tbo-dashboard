"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ColumnDef, ColumnPref } from "@/lib/column-types";
import { applyColumnPrefs, extractColumnPrefs, responsiveClass } from "@/lib/column-types";

/* ------------------------------------------------------------------ */
/* Sortable Header Cell                                                */
/* ------------------------------------------------------------------ */

interface SortableHeaderProps {
  id: string;
  label: string;
  responsive?: "always" | "md" | "lg" | "xl";
  width?: string;
  reorderable?: boolean;
  headerRender?: () => React.ReactNode;
}

function SortableHeader({
  id,
  label,
  responsive,
  width,
  reorderable = true,
  headerRender,
}: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !reorderable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        responsiveClass(responsive),
        width,
        isDragging && "bg-muted/50 z-10",
        reorderable && "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...(reorderable ? listeners : {})}
    >
      <span className="flex items-center gap-1">
        {reorderable && (
          <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        )}
        {headerRender ? headerRender() : label}
      </span>
    </TableHead>
  );
}

/* ------------------------------------------------------------------ */
/* Column Visibility Toggle                                            */
/* ------------------------------------------------------------------ */

interface ColumnVisibilityProps<T> {
  columns: { column: ColumnDef<T>; visible: boolean }[];
  onToggle: (columnId: string) => void;
  onReset: () => void;
}

function ColumnVisibilityToggle<T>({
  columns,
  onToggle,
  onReset,
}: ColumnVisibilityProps<T>) {
  const hideableColumns = columns.filter((c) => c.column.hideable !== false);

  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Colunas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hideableColumns.map(({ column, visible }) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visible}
            onCheckedChange={() => onToggle(column.id)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar padrao
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal axis restrictor (inline to avoid extra import)           */
/* ------------------------------------------------------------------ */

const horizontalModifier = restrictToHorizontalAxis;

/* ------------------------------------------------------------------ */
/* DataTable — Main Component                                          */
/* ------------------------------------------------------------------ */

interface DataTableProps<T> {
  /** Unique table identifier for persisting preferences */
  tableId: string;
  /** Column definitions */
  columnDefs: ColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Row key extractor */
  rowKey: (row: T, index: number) => string;
  /** Saved preferences from useTablePreferences */
  savedPrefs: ColumnPref[] | null;
  /** Callback to persist new prefs */
  onPrefsChange?: (prefs: ColumnPref[]) => void;
  /** Called when reset is clicked */
  onPrefsReset?: () => void;
  /** Whether to show the column visibility toggle */
  showColumnToggle?: boolean;
  /** Extra toolbar content (left side) */
  toolbar?: React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional className for the wrapper */
  className?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Extra className for each row */
  rowClassName?: string | ((row: T, index: number) => string);
}

export function DataTable<T>({
  tableId,
  columnDefs,
  data,
  rowKey,
  savedPrefs,
  onPrefsChange,
  onPrefsReset,
  showColumnToggle = true,
  toolbar,
  emptyMessage = "Nenhum registro encontrado.",
  className,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  // Merge defs with saved prefs
  const [columns, setColumns] = useState(() =>
    applyColumnPrefs(columnDefs, savedPrefs ?? undefined)
  );

  // Re-apply when savedPrefs or defs change
  useEffect(() => {
    setColumns(applyColumnPrefs(columnDefs, savedPrefs ?? undefined));
  }, [columnDefs, savedPrefs]);

  // Column IDs for sortable context
  const columnIds = useMemo(
    () => columns.map((c) => c.column.id),
    [columns]
  );

  // Visible columns only
  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.column.id === active.id);
        const newIndex = prev.findIndex((c) => c.column.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const next = arrayMove(prev, oldIndex, newIndex);
        // Persist
        onPrefsChange?.(extractColumnPrefs(next));
        return next;
      });
    },
    [onPrefsChange]
  );

  // Toggle column visibility
  const handleToggleVisibility = useCallback(
    (columnId: string) => {
      setColumns((prev) => {
        const next = prev.map((c) =>
          c.column.id === columnId ? { ...c, visible: !c.visible } : c
        );
        onPrefsChange?.(extractColumnPrefs(next));
        return next;
      });
    },
    [onPrefsChange]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    setColumns(applyColumnPrefs(columnDefs, undefined));
    onPrefsReset?.();
  }, [columnDefs, onPrefsReset]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      {(showColumnToggle || toolbar) && (
        <div className="flex items-center gap-2">
          {toolbar}
          {showColumnToggle && (
            <ColumnVisibilityToggle
              columns={columns}
              onToggle={handleToggleVisibility}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[horizontalModifier]}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <SortableContext
                  items={columnIds}
                  strategy={horizontalListSortingStrategy}
                >
                  {visibleColumns.map(({ column }) => (
                    <SortableHeader
                      key={column.id}
                      id={column.id}
                      label={column.label}
                      responsive={column.responsive}
                      width={column.width}
                      reorderable={column.reorderable !== false}
                      headerRender={column.headerRender}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={rowKey(row, rowIndex)}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      typeof rowClassName === "function"
                        ? rowClassName(row, rowIndex)
                        : rowClassName
                    )}
                    onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                  >
                    {visibleColumns.map(({ column }) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          responsiveClass(column.responsive),
                          column.width
                        )}
                      >
                        {column.cellRender
                          ? column.cellRender(row, rowIndex)
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
