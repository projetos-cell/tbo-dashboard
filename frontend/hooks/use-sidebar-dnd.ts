"use client";

import { useState, useCallback, useRef } from "react";
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { NavGroup, NavGroupItem } from "@/lib/navigation";

type DragType = "item" | "group";

interface ActiveDragData {
  type: DragType;
  item?: NavGroupItem;
  group?: NavGroup;
  groupLabel?: string;
}

/**
 * Centralizes all sidebar DnD logic.
 * Supports:
 * - Reordering groups (sections)
 * - Reordering items within the same group
 * - Moving items between groups (cross-group)
 *
 * Cross-group moves are applied only on dragEnd (not during drag)
 * to avoid unmounting/remounting sortable nodes mid-drag, which
 * corrupts dnd-kit internal state and causes React error #185.
 */
export function useSidebarDnd() {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  /** Group label the item is currently hovering over (for drop indicator) */
  const [overGroupLabel, setOverGroupLabel] = useState<string | null>(null);

  // Frozen at dragStart — immune to active.data.current mutations
  const origGroupRef = useRef<string | null>(null);
  const origHrefRef = useRef<string | null>(null);

  const reorderItems = useSidebarStore((s) => s.reorderItems);
  const reorderGroups = useSidebarStore((s) => s.reorderGroups);
  const moveItemBetweenGroups = useSidebarStore((s) => s.moveItemBetweenGroups);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDragData | undefined;
    if (!data) return;

    // Clone the data so we hold a stable snapshot (dnd-kit mutates data.current)
    setActiveDrag({ ...data });

    if (data.type === "item") {
      origGroupRef.current = data.groupLabel ?? null;
      origHrefRef.current = data.item?.href ?? null;
    } else {
      origGroupRef.current = null;
      origHrefRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverGroupLabel(null);
      return;
    }

    const origGroup = origGroupRef.current;
    if (!origGroup) return; // not an item drag

    const overData = over.data.current as ActiveDragData | undefined;

    let targetGroup: string | null = null;
    if (overData?.type === "item") {
      targetGroup = overData.groupLabel ?? null;
    } else if (overData?.type === "group") {
      targetGroup = overData.group?.label ?? null;
    }

    // Only show indicator when hovering a different group
    setOverGroupLabel(targetGroup !== origGroup ? targetGroup : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);
      setOverGroupLabel(null);

      const origGroup = origGroupRef.current;
      const origHref = origHrefRef.current;
      origGroupRef.current = null;
      origHrefRef.current = null;

      if (!over) return;

      const activeData = active.data.current as ActiveDragData | undefined;
      const overData = over.data.current as ActiveDragData | undefined;
      if (!activeData || !overData) return;

      // ── Case 1: Reordering groups ──
      if (activeData.type === "group" && overData.type === "group") {
        const activeLabel = activeData.group?.label;
        const overLabel = overData.group?.label;
        if (!activeLabel || !overLabel || activeLabel === overLabel) return;

        const state = useSidebarStore.getState();
        const order = state.groupOrder.length > 0 ? [...state.groupOrder] : [];
        if (order.length === 0) return;

        const oldIndex = order.indexOf(activeLabel);
        const newIndex = order.indexOf(overLabel);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        reorderGroups(arrayMove(order, oldIndex, newIndex));
        return;
      }

      // ── Case 2: Item reorder or cross-group move ──
      if (activeData.type === "item") {
        if (!origGroup || !origHref) return;

        // Determine target group from drop target
        let targetGroup: string | null = null;
        let targetHref: string | null = null;

        if (overData.type === "item") {
          targetGroup = overData.groupLabel ?? null;
          targetHref = overData.item?.href ?? null;
        } else if (overData.type === "group") {
          targetGroup = overData.group?.label ?? null;
        }

        if (!targetGroup) return;

        if (targetGroup === origGroup) {
          // Same-group reorder
          if (active.id === over.id) return;

          const items = useSidebarStore.getState().groupItemOrder[origGroup] ?? [];
          const oldIndex = items.indexOf(origHref);

          let newIndex: number;
          if (targetHref && targetHref !== origHref) {
            newIndex = items.indexOf(targetHref);
          } else {
            newIndex = items.length - 1;
          }

          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          reorderItems(origGroup, arrayMove([...items], oldIndex, newIndex));
        } else {
          // Cross-group move — determine insert position
          const targetItems = useSidebarStore.getState().groupItemOrder[targetGroup] ?? [];
          let insertIndex = targetItems.length; // default: end

          if (targetHref) {
            const idx = targetItems.indexOf(targetHref);
            if (idx !== -1) insertIndex = idx;
          }

          moveItemBetweenGroups(origHref, origGroup, targetGroup, insertIndex);
        }
      }
    },
    [reorderGroups, reorderItems, moveItemBetweenGroups],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setOverGroupLabel(null);
    origGroupRef.current = null;
    origHrefRef.current = null;
  }, []);

  return {
    activeDrag,
    overGroupLabel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
