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
import { GripVertical, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import type { ColumnDef, ColumnPref, SortPref } from "@/lib/column-types";
import { applyColumnPrefs, extractColumnPrefs, responsiveClass, getDefaultSortFn } from "@/lib/column-types";

/* ------------------------------------------------------------------ */
/* Sortable Header Cell                                                */
/* ------------------------------------------------------------------ */

interface SortableHeaderProps {
  id: string;
  label: string;
  responsive?: "always" | "md" | "lg" | "xl";
  width?: string;
  reorderable?: boolean;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  headerRender?: () => React.ReactNode;
}

function SortableHeader({
  id,
  label,
  responsive,
  width,
  reorderable = true,
  sortable = false,
  sortDirection = null,
  onSort,
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

  const SortIcon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ArrowUpDown;

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
        {sortable ? (
          <button
            type="button"
            className="flex items-center gap-1 hover:text-foreground transition-colors -m-1 p-1 rounded select-none"
            onClick={(e) => {
              e.stopPropagation();
              onSort?.();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {headerRender ? headerRender() : label}
            <SortIcon className={cn("h-3.5 w-3.5 shrink-0", sortDirection ? "text-foreground" : "text-muted-foreground/50")} />
          </button>
        ) : (
          headerRender ? headerRender() : label
        )}
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
  /** Initial sort state (from saved preferences) */
  defaultSort?: SortPref | null;
  /** Callback when sort changes (for persistence) */
  onSortChange?: (sort: SortPref | null) => void;
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
  defaultSort,
  onSortChange,
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

  // Sort state
  const [sortPref, setSortPref] = useState<SortPref | null>(defaultSort ?? null);

  // Re-apply when savedPrefs or defs change
  useEffect(() => {
    setColumns(applyColumnPrefs(columnDefs, savedPrefs ?? undefined));
  }, [columnDefs, savedPrefs]);

  // Sync defaultSort from parent (e.g. when loaded from DB)
  useEffect(() => {
    setSortPref(defaultSort ?? null);
  }, [defaultSort]);

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

  // Sort handler: cycle asc → desc → none
  const handleSort = useCallback(
    (columnId: string) => {
      setSortPref((prev) => {
        let next: SortPref | null;
        if (!prev || prev.columnId !== columnId) {
          next = { columnId, direction: "asc" };
        } else if (prev.direction === "asc") {
          next = { columnId, direction: "desc" };
        } else {
          next = null;
        }
        onSortChange?.(next);
        return next;
      });
    },
    [onSortChange]
  );

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortPref) return data;
    const col = columnDefs.find((c) => c.id === sortPref.columnId);
    if (!col || !col.sortable) return data;

    const dir = sortPref.direction === "asc" ? 1 : -1;

    if (col.sortFn) {
      return [...data].sort((a, b) => col.sortFn!(a, b) * dir);
    }

    const valueFn = col.sortAccessor ?? (() => undefined);
    const cmp = getDefaultSortFn(col.sortType ?? "string");
    return [...data].sort((a, b) => cmp(valueFn(a), valueFn(b)) * dir);
  }, [data, sortPref, columnDefs]);

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
                      sortable={column.sortable}
                      sortDirection={sortPref?.columnId === column.id ? sortPref.direction : null}
                      onSort={() => handleSort(column.id)}
                      headerRender={column.headerRender}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, rowIndex) => (
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
