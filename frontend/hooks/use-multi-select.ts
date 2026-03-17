"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook for multi-select with Shift+Click and marquee (rubber-band) selection.
 * Returns selected IDs set and handlers to wire into task rows.
 */
export function useMultiSelect(orderedIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedId = useRef<string | null>(null);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClick = useCallback(
    (id: string, e: { shiftKey: boolean; ctrlKey?: boolean; metaKey?: boolean }) => {
      if (e.shiftKey && lastClickedId.current) {
        // Range select: from lastClicked to current
        const startIdx = orderedIds.indexOf(lastClickedId.current);
        const endIdx = orderedIds.indexOf(id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const rangeIds = orderedIds.slice(from, to + 1);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const rid of rangeIds) next.add(rid);
            return next;
          });
          lastClickedId.current = id;
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        // Toggle single item
        toggle(id);
      } else {
        // Plain click — clear and select only this one
        setSelectedIds(new Set([id]));
      }
      lastClickedId.current = id;
    },
    [orderedIds, toggle],
  );

  const selectRange = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedId.current = null;
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(orderedIds));
  }, [orderedIds]);

  return {
    selectedIds,
    handleClick,
    selectRange,
    clearSelection,
    selectAll,
    isSelected: (id: string) => selectedIds.has(id),
    count: selectedIds.size,
  };
}
