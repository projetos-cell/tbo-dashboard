import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { IconAlignLeft } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import { useViewPreferences, useSaveViewPreferences, useProjectCustomFields, useCreateCustomField, useDeleteCustomField, useTaskFieldValues, useUpsertTaskFieldValue, buildFieldValuesMap } from "@/features/projects/hooks/use-custom-fields";
import type { CustomField } from "@/features/projects/services/custom-fields";
import { COLUMNS, SUGGESTED_EXTRA_COLUMNS, type ExtraColumn } from "./task-list-helpers";

export function useColumnPreferences(projectId: string, parentIds: string[], tenantId: string | null) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [columnOrder, setColumnOrder] = useState<string[]>(COLUMNS.map((c) => c.id));
  const [extraColumns, setExtraColumns] = useState<ExtraColumn[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Custom fields
  const { data: customFields } = useProjectCustomFields(projectId);
  const createCustomFieldMutation = useCreateCustomField(projectId);
  const deleteCustomFieldMutation = useDeleteCustomField(projectId);
  const upsertFieldValue = useUpsertTaskFieldValue();
  const { data: fieldValuesRaw } = useTaskFieldValues(parentIds);
  const fieldValuesMap = useMemo(() => buildFieldValuesMap(fieldValuesRaw ?? []), [fieldValuesRaw]);
  const handleFieldChange = useCallback((taskId: string, fieldId: string, value: unknown) => {
    upsertFieldValue.mutate({ taskId, fieldId, value });
  }, [upsertFieldValue]);

  // View preferences
  const userId = useAuthStore((s) => s.user?.id);
  const { data: viewPrefs, isLoading: prefsLoading } = useViewPreferences(projectId);
  const saveViewPrefs = useSaveViewPreferences(projectId);
  const prefsLoaded = useRef(false);

  useEffect(() => {
    if (prefsLoaded.current || prefsLoading || !viewPrefs) return;
    prefsLoaded.current = true;
    if (viewPrefs.column_widths && Object.keys(viewPrefs.column_widths).length > 0) setColumnWidths(viewPrefs.column_widths);
    if (viewPrefs.column_order && viewPrefs.column_order.length > 0) setColumnOrder(viewPrefs.column_order);
    if (viewPrefs.hidden_columns && viewPrefs.hidden_columns.length > 0) setHiddenColumns(new Set(viewPrefs.hidden_columns));
  }, [viewPrefs, prefsLoading]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSaveWidths = useCallback((widths: Record<string, number>) => {
    if (!userId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveViewPrefs.mutate({ column_widths: widths }), 500);
  }, [userId, saveViewPrefs]);

  const visibleColumns = useMemo(
    () => columnOrder.map((id) => COLUMNS.find((c) => c.id === id)!).filter((c) => c && !hiddenColumns.has(c.id)),
    [columnOrder, hiddenColumns],
  );

  const toggleColumnVisibility = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId); else next.add(colId);
      if (userId) saveViewPrefs.mutate({ hidden_columns: Array.from(next) });
      return next;
    });
  }, [userId, saveViewPrefs]);

  const moveColumnUp = useCallback((colId: string) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx <= 0) return prev;
      const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      if (userId) saveViewPrefs.mutate({ column_order: next });
      return next;
    });
  }, [userId, saveViewPrefs]);

  const moveColumnDown = useCallback((colId: string) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      if (userId) saveViewPrefs.mutate({ column_order: next });
      return next;
    });
  }, [userId, saveViewPrefs]);

  const getColumnWidth = useCallback(
    (col: { id: string; defaultWidth: number }) => columnWidths[col.id] ?? col.defaultWidth,
    [columnWidths],
  );

  const columnWidthsRef = useRef(columnWidths);
  columnWidthsRef.current = columnWidths;

  const handleStartResize = useCallback((colId: string, startX: number) => {
    const col = COLUMNS.find((c) => c.id === colId);
    if (!col) return;
    const initialWidth = columnWidthsRef.current[colId] ?? col.defaultWidth;
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(col.minWidth, initialWidth + (e.clientX - startX));
      setColumnWidths((prev) => ({ ...prev, [colId]: newWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = ""; document.body.style.userSelect = "";
      debouncedSaveWidths(columnWidthsRef.current);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  }, [debouncedSaveWidths]);

  const addExtraColumn = useCallback((type: string, label: string, icon: typeof IconAlignLeft) => {
    const isSuggested = SUGGESTED_EXTRA_COLUMNS.some((s) => s.key === type);
    if (isSuggested) {
      setExtraColumns((prev) => [...prev, { id: `extra_${type}_${Date.now()}`, label, field: type, type: "readonly" as const, icon, width: "w-[130px]" }]);
    } else if (tenantId) {
      const maxOrder = (customFields ?? []).reduce((max, f) => Math.max(max, f.order_index), 0);
      createCustomFieldMutation.mutate({ name: label, type: type as CustomField["type"], project_id: projectId, order_index: maxOrder + 1 });
    }
    setAddMenuOpen(false);
  }, [tenantId, projectId, customFields, createCustomFieldMutation]);

  const removeExtraColumn = useCallback((id: string) => {
    if (id.length === 36) deleteCustomFieldMutation.mutate(id);
    else setExtraColumns((prev) => prev.filter((c) => c.id !== id));
  }, [deleteCustomFieldMutation]);

  return {
    customFields, fieldValuesMap, handleFieldChange,
    visibleColumns, columnOrder, hiddenColumns, columnWidths, extraColumns,
    addMenuOpen, setAddMenuOpen,
    toggleColumnVisibility, moveColumnUp, moveColumnDown, getColumnWidth,
    handleStartResize, addExtraColumn, removeExtraColumn,
  };
}
