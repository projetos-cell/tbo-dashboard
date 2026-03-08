"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ColumnDef, ColumnPref, SortPref } from "@/lib/column-types";
import { applyColumnPrefs, extractColumnPrefs, getDefaultSortFn, responsiveClass } from "@/lib/column-types";

interface DataTableProps<T> {
  tableId: string;
  columnDefs: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  savedPrefs?: ColumnPref[] | null;
  onPrefsChange?: (prefs: ColumnPref[]) => void;
  onPrefsReset?: () => void;
  defaultSort?: SortPref | null;
  onSortChange?: (sort: SortPref | null) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columnDefs,
  data,
  rowKey,
  savedPrefs,
  onPrefsChange,
  defaultSort,
  onSortChange,
  onRowClick,
  emptyMessage = "Nenhum resultado encontrado",
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortPref | null>(defaultSort ?? null);

  const columns = React.useMemo(
    () => applyColumnPrefs(columnDefs, savedPrefs ?? undefined),
    [columnDefs, savedPrefs]
  );

  const visibleColumns = columns.filter((c) => c.visible);

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const colDef = columnDefs.find((c) => c.id === sort.columnId);
    if (!colDef) return data;

    const comparator = colDef.sortFn
      ? colDef.sortFn
      : (a: T, b: T) => {
          const fn = getDefaultSortFn(colDef.sortType);
          const av = colDef.sortAccessor ? colDef.sortAccessor(a) : undefined;
          const bv = colDef.sortAccessor ? colDef.sortAccessor(b) : undefined;
          return fn(av, bv);
        };

    const sorted = [...data].sort(comparator);
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sort, columnDefs]);

  const handleSort = (colId: string) => {
    const colDef = columnDefs.find((c) => c.id === colId);
    if (!colDef?.sortable) return;
    const next: SortPref =
      sort?.columnId === colId && sort.direction === "asc"
        ? { columnId: colId, direction: "desc" }
        : { columnId: colId, direction: "asc" };
    setSort(next);
    onSortChange?.(next);
  };

  const toggleColumn = (colId: string) => {
    const updated = columns.map((c) =>
      c.column.id === colId && c.column.hideable !== false
        ? { ...c, visible: !c.visible }
        : c
    );
    onPrefsChange?.(extractColumnPrefs(updated));
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Column visibility controls */}
      {columns.some((c) => c.column.hideable !== false) && (
        <div className="mb-2 flex flex-wrap gap-1">
          {columns
            .filter((c) => c.column.hideable !== false)
            .map(({ column, visible }) => (
              <button
                key={column.id}
                type="button"
                onClick={() => toggleColumn(column.id)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs border transition-colors",
                  visible
                    ? "bg-tbo-orange text-white border-tbo-orange"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                )}
              >
                {column.label}
              </button>
            ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100/30">
              {visibleColumns.map(({ column }) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-3 py-2 text-left text-xs font-medium text-gray-500",
                    column.width,
                    responsiveClass(column.responsive),
                    column.sortable && "cursor-pointer select-none hover:text-gray-900"
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <span className="flex items-center gap-1">
                    {column.headerRender ? column.headerRender() : column.label}
                    {column.sortable && sort?.columnId === column.id && (
                      <span className="text-tbo-orange">
                        {sort.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-3 py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "border-b border-gray-200 transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-gray-100/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map(({ column }) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-3 py-2",
                        column.width,
                        responsiveClass(column.responsive)
                      )}
                    >
                      {column.cellRender ? column.cellRender(row, idx) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
