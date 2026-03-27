"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { COLUMNS, SUGGESTED_COLUMNS, TYPE_TO_COLUMN } from "./compact-list-column-config";
import type { ColumnConfig, ExtraColumn } from "./compact-list-column-config";
import type { SortField, SortDir, Project } from "./compact-list-helpers";
import { isUUID } from "./compact-list-helpers";
import type { GroupField, ListToolbarState } from "./project-list-toolbar";
import { useToast } from "@/hooks/use-toast";

export function useColumnResize() {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const columnWidthsRef = useRef(columnWidths);
  columnWidthsRef.current = columnWidths;

  const getColumnWidth = useCallback(
    (col: ColumnConfig) => columnWidths[col.id] ?? col.defaultWidth,
    [columnWidths],
  );

  const handleStartResize = useCallback((colId: string, startX: number) => {
    const col = COLUMNS.find((c) => c.id === colId);
    if (!col) return;
    const initialWidth = columnWidthsRef.current[colId] ?? col.defaultWidth;
    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setColumnWidths((prev) => ({ ...prev, [colId]: Math.max(col.minWidth, initialWidth + delta) }));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  return { columnWidths, getColumnWidth, handleStartResize };
}

export function useExtraColumns() {
  const { toast } = useToast();
  const [extraColumns, setExtraColumns] = useState<ExtraColumn[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");

  const addSuggestedColumn = useCallback((key: string) => {
    const col = SUGGESTED_COLUMNS.find((c) => c.id === key);
    if (!col) return;
    setExtraColumns((prev) => {
      if (prev.some((c) => c.id === col.id)) {
        toast({ title: `"${col.label}" ja esta visivel` });
        return prev;
      }
      return [...prev, col];
    });
    setAddMenuOpen(false);
  }, [toast]);

  const addTypeColumn = useCallback((type: string) => {
    const config = TYPE_TO_COLUMN[type];
    if (!config) return;
    setExtraColumns((prev) => [...prev, { id: `extra_${type}_${Date.now()}`, ...config }]);
    setAddMenuOpen(false);
  }, []);

  const removeColumn = useCallback((id: string) => {
    setExtraColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const duplicateColumn = useCallback((colId: string) => {
    setExtraColumns((prev) => {
      const col = prev.find((c) => c.id === colId);
      if (!col) return prev;
      return [...prev, { ...col, id: `${col.id}_dup_${Date.now()}` }];
    });
  }, []);

  return {
    extraColumns, addMenuOpen, setAddMenuOpen,
    propertySearch, setPropertySearch,
    addSuggestedColumn, addTypeColumn, removeColumn, duplicateColumn,
  };
}

export function useColumnVisibility() {
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [wrappedColumns, setWrappedColumns] = useState<Set<string>>(new Set());

  const toggleHideColumn = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId); else next.add(colId);
      return next;
    });
  }, []);

  const toggleWrapColumn = useCallback((colId: string) => {
    setWrappedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId); else next.add(colId);
      return next;
    });
  }, []);

  const visibleColumns = useMemo(
    () => COLUMNS.filter((col) => !hiddenColumns.has(col.id)),
    [hiddenColumns],
  );

  return { wrappedColumns, visibleColumns, toggleHideColumn, toggleWrapColumn };
}

export function useSortAndGroup() {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [toolbarState, setToolbarState] = useState<ListToolbarState>({
    sortField: "name", sortDir: "asc", groupBy: "none", customFilters: [],
  });

  const handleSortFromMenu = useCallback((field: SortField, dir: SortDir) => {
    setSortField(field);
    setSortDir(dir);
  }, []);

  const handleGroupFromMenu = useCallback((field: GroupField) => {
    setToolbarState((prev) => ({ ...prev, groupBy: field }));
  }, []);

  const handleFilterFromMenu = useCallback((field: string, value: string) => {
    setToolbarState((prev) => ({
      ...prev,
      customFilters: [
        ...prev.customFilters.filter((f) => f.field !== field),
        { id: `${field}_${Date.now()}`, field, value, label: `${field}: ${value}` },
      ],
    }));
  }, []);

  return {
    sortField, sortDir, toolbarState,
    handleSortFromMenu, handleGroupFromMenu, handleFilterFromMenu,
  };
}

export function useConstrutoras(projects: Project[]) {
  return useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.construtora && !isUUID(p.construtora)) set.add(p.construtora);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);
}
