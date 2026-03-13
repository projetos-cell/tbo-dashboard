"use client";

import { useMemo, useState, useCallback } from "react";
import { IconArrowDown, IconArrowUp, IconArrowsUpDown } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  applyColumnPrefs,
  responsiveClass,
  getDefaultSortFn,
  type ColumnDef,
  type ColumnPref,
  type SortPref,
} from "@/lib/column-types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface DataTableProps<T> {
  tableId: string;
  columnDefs: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;
  savedPrefs?: ColumnPref[];
  onPrefsChange?: (prefs: ColumnPref[]) => void;
  onPrefsReset?: () => void;
  defaultSort?: SortPref | null;
  onSortChange?: (sort: SortPref | null) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function DataTable<T>({
  columnDefs,
  data,
  rowKey,
  savedPrefs,
  defaultSort,
  onSortChange,
  onRowClick,
  emptyMessage = "Nenhum item encontrado.",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortPref | null>(defaultSort ?? null);

  /* ---------- columns with prefs applied ---------- */
  const columns = useMemo(
    () => applyColumnPrefs(columnDefs, savedPrefs),
    [columnDefs, savedPrefs]
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  /* ---------- sorting ---------- */
  const handleSort = useCallback(
    (col: ColumnDef<T>) => {
      if (!col.sortable) return;

      let next: SortPref | null;
      if (sort?.columnId === col.id) {
        if (sort.direction === "asc") {
          next = { columnId: col.id, direction: "desc" };
        } else {
          next = null; // remove sort
        }
      } else {
        next = { columnId: col.id, direction: "asc" };
      }

      setSort(next);
      onSortChange?.(next);
    },
    [sort, onSortChange]
  );

  const sortedData = useMemo(() => {
    if (!sort) return data;

    const colDef = columnDefs.find((c) => c.id === sort.columnId);
    if (!colDef) return data;

    const sorted = [...data].sort((a, b) => {
      if (colDef.sortFn) return colDef.sortFn(a, b);

      const accessor = colDef.sortAccessor ?? (() => null);
      const comparator = getDefaultSortFn(colDef.sortType);
      return comparator(accessor(a), accessor(b));
    });

    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sort, columnDefs]);

  /* ---------- render ---------- */
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.map(({ column: col }) => {
            const isSorted = sort?.columnId === col.id;
            const SortIcon = isSorted
              ? sort?.direction === "asc"
                ? IconArrowUp
                : IconArrowDown
              : IconArrowsUpDown;

            return (
              <TableHead
                key={col.id}
                className={cn(
                  col.width,
                  responsiveClass(col.responsive),
                  col.sortable && "cursor-pointer select-none"
                )}
                onClick={col.sortable ? () => handleSort(col) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.headerRender ? col.headerRender() : col.label}
                  {col.sortable && (
                    <SortIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isSorted
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      )}
                    />
                  )}
                </span>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedData.map((row, rowIdx) => (
          <TableRow
            key={rowKey(row)}
            className={cn(onRowClick && "cursor-pointer")}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {visibleColumns.map(({ column: col }) => (
              <TableCell
                key={col.id}
                className={cn(col.width, responsiveClass(col.responsive))}
              >
                {col.cellRender ? col.cellRender(row, rowIdx) : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
