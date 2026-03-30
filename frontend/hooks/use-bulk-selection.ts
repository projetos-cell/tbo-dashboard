"use client";

import { useState, useCallback, useMemo } from "react";

interface UseBulkSelectionOptions<T> {
  /** All items available for selection */
  items: T[];
  /** Unique key extractor */
  getKey: (item: T) => string;
}

interface UseBulkSelectionReturn<T> {
  /** Set of selected item keys */
  selectedKeys: Set<string>;
  /** Whether any items are selected */
  hasSelection: boolean;
  /** Number of selected items */
  selectionCount: number;
  /** Whether all items are selected */
  isAllSelected: boolean;
  /** Whether the selection is indeterminate (some but not all) */
  isIndeterminate: boolean;
  /** Toggle a single item */
  toggle: (key: string) => void;
  /** Select all items */
  selectAll: () => void;
  /** Deselect all items */
  deselectAll: () => void;
  /** Toggle select all / deselect all */
  toggleAll: () => void;
  /** Check if a specific item is selected */
  isSelected: (key: string) => boolean;
  /** Get all selected items (resolved from keys) */
  selectedItems: T[];
}

export function useBulkSelection<T>({
  items,
  getKey,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const allKeys = useMemo(() => new Set(items.map(getKey)), [items, getKey]);

  const toggle = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedKeys(new Set(allKeys));
  }, [allKeys]);

  const deselectAll = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isAllSelected = selectedKeys.size > 0 && selectedKeys.size === allKeys.size;
  const isIndeterminate = selectedKeys.size > 0 && selectedKeys.size < allKeys.size;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, deselectAll, selectAll]);

  const isSelected = useCallback(
    (key: string) => selectedKeys.has(key),
    [selectedKeys],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedKeys.has(getKey(item))),
    [items, selectedKeys, getKey],
  );

  return {
    selectedKeys,
    hasSelection: selectedKeys.size > 0,
    selectionCount: selectedKeys.size,
    isAllSelected,
    isIndeterminate,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
    selectedItems,
  };
}
