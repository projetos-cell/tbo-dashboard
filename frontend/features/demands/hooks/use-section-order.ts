import * as React from "react";
import { arrayMove } from "@dnd-kit/sortable";

export function useSectionOrder(storageKey: string, defaultKeys: string[]) {
  const [order, setOrder] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return defaultKeys;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return defaultKeys;
      const parsed = JSON.parse(saved) as string[];
      const merged = parsed.filter((k) => defaultKeys.includes(k));
      const missing = defaultKeys.filter((k) => !merged.includes(k));
      return [...merged, ...missing];
    } catch {
      return defaultKeys;
    }
  });

  const reorder = React.useCallback(
    (activeId: string, overId: string) => {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(activeId);
        const newIndex = prev.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    },
    [storageKey],
  );

  return { order, reorder };
}
