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

interface StateSnapshot {
  groupItemOrder: Record<string, string[]>;
  groupOrder: string[];
}

/**
 * Centralizes all sidebar DnD logic.
 * Supports:
 * - Reordering groups (sections)
 * - Reordering items within the same group
 * - Moving items between groups (cross-group) with optimistic preview
 */
export function useSidebarDnd() {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const snapshotRef = useRef<StateSnapshot | null>(null);
  const lastOverGroupRef = useRef<string | null>(null);

  const reorderItems = useSidebarStore((s) => s.reorderItems);
  const reorderGroups = useSidebarStore((s) => s.reorderGroups);
  const moveItemBetweenGroups = useSidebarStore((s) => s.moveItemBetweenGroups);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDragData | undefined;
    if (!data) return;
    setActiveDrag(data);
    // Snapshot state at drag start — used for optimistic preview and rollback
    const state = useSidebarStore.getState();
    snapshotRef.current = {
      groupItemOrder: { ...state.groupItemOrder },
      groupOrder: [...state.groupOrder],
    };
    lastOverGroupRef.current = null;
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !snapshotRef.current) return;

    const activeData = active.data.current as ActiveDragData | undefined;
    const overData = over.data.current as ActiveDragData | undefined;

    // Only handle item cross-group moves during dragOver
    if (!activeData || activeData.type !== "item") return;

    const activeGroup = activeData.groupLabel;
    const activeHref = activeData.item?.href;
    if (!activeGroup || !activeHref) return;

    // Determine target group from what we're hovering over
    let targetGroup: string | null = null;
    let targetHref: string | null = null;

    if (overData?.type === "item") {
      targetGroup = overData.groupLabel ?? null;
      targetHref = overData.item?.href ?? null;
    } else if (overData?.type === "group") {
      targetGroup = overData.group?.label ?? null;
    }

    if (!targetGroup || targetGroup === activeGroup) return;

    // Optimistic cross-group preview: restore snapshot then apply new position
    const snapshot = snapshotRef.current;
    const fromItems = (snapshot.groupItemOrder[activeGroup] ?? []).filter(
      (h) => h !== activeHref,
    );
    const toItems = [...(snapshot.groupItemOrder[targetGroup] ?? [])];

    let insertIndex = toItems.length;
    if (targetHref) {
      const idx = toItems.indexOf(targetHref);
      if (idx !== -1) insertIndex = idx;
    }

    toItems.splice(insertIndex, 0, activeHref);

    // Direct setState bypasses undo stack (correct for optimistic preview)
    useSidebarStore.setState({
      groupItemOrder: {
        ...snapshot.groupItemOrder,
        [activeGroup]: fromItems,
        [targetGroup]: toItems,
      },
    });

    lastOverGroupRef.current = targetGroup;
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);
      lastOverGroupRef.current = null;

      const snapshot = snapshotRef.current;
      snapshotRef.current = null;

      // Helper to restore snapshot state
      const restoreSnapshot = () => {
        if (snapshot) {
          useSidebarStore.setState({
            groupItemOrder: snapshot.groupItemOrder,
            groupOrder: snapshot.groupOrder,
          });
        }
      };

      if (!over || active.id === over.id) {
        restoreSnapshot();
        return;
      }

      const activeData = active.data.current as ActiveDragData | undefined;
      const overData = over.data.current as ActiveDragData | undefined;

      if (!activeData || !overData || !snapshot) {
        restoreSnapshot();
        return;
      }

      // ── Case 1: Reordering groups ──
      if (activeData.type === "group" && overData.type === "group") {
        const activeLabel = activeData.group?.label;
        const overLabel = overData.group?.label;
        if (!activeLabel || !overLabel) { restoreSnapshot(); return; }

        const oldIndex = snapshot.groupOrder.indexOf(activeLabel);
        const newIndex = snapshot.groupOrder.indexOf(overLabel);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          restoreSnapshot();
          return;
        }

        const newOrder = arrayMove(snapshot.groupOrder, oldIndex, newIndex);
        // Restore snapshot first so reorderGroups pushes the correct undo entry
        restoreSnapshot();
        reorderGroups(newOrder);
        return;
      }

      // ── Case 2: Item reorder or cross-group move ──
      if (activeData.type === "item") {
        const activeGroup = activeData.groupLabel;
        const activeHref = activeData.item?.href;
        if (!activeGroup || !activeHref) { restoreSnapshot(); return; }

        let targetGroup: string | null = null;
        let targetHref: string | null = null;

        if (overData.type === "item") {
          targetGroup = overData.groupLabel ?? null;
          targetHref = overData.item?.href ?? null;
        } else if (overData.type === "group") {
          targetGroup = overData.group?.label ?? null;
        }

        if (!targetGroup) { restoreSnapshot(); return; }

        // Restore snapshot before applying real action (ensures correct undo entry)
        restoreSnapshot();

        if (activeGroup === targetGroup) {
          // Same-group reorder
          if (!targetHref) return;
          const items = snapshot.groupItemOrder[activeGroup] ?? [];
          const oldIndex = items.indexOf(activeHref);
          const newIndex = items.indexOf(targetHref);
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          reorderItems(activeGroup, arrayMove(items, oldIndex, newIndex));
        } else {
          // Cross-group move
          const toItems = snapshot.groupItemOrder[targetGroup] ?? [];
          let insertIndex = toItems.length;
          if (targetHref) {
            const idx = toItems.indexOf(targetHref);
            if (idx !== -1) insertIndex = idx;
          }
          moveItemBetweenGroups(activeHref, activeGroup, targetGroup, insertIndex);
        }
      } else {
        restoreSnapshot();
      }
    },
    [reorderGroups, reorderItems, moveItemBetweenGroups],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    lastOverGroupRef.current = null;
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (snapshot) {
      useSidebarStore.setState({
        groupItemOrder: snapshot.groupItemOrder,
        groupOrder: snapshot.groupOrder,
      });
    }
  }, []);

  return {
    activeDrag,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
