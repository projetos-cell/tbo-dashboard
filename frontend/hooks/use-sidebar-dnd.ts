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
 *
 * Key invariant: active.data.current is a MutableRefObject in dnd-kit.
 * After a cross-group optimistic move the SortableNavItem re-renders under
 * the new group, which mutates active.data.current.groupLabel.
 * We freeze the original group/href in refs at dragStart and NEVER read
 * active.data.current for item identification after that point.
 */
export function useSidebarDnd() {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const snapshotRef = useRef<StateSnapshot | null>(null);

  // Frozen at dragStart — immune to active.data.current mutations
  const origGroupRef = useRef<string | null>(null);
  const origHrefRef = useRef<string | null>(null);

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

    // Freeze original item identity — NEVER overwrite these after dragStart
    if (data.type === "item") {
      origGroupRef.current = data.groupLabel ?? null;
      origHrefRef.current = data.item?.href ?? null;
    } else {
      origGroupRef.current = null;
      origHrefRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !snapshotRef.current) return;

    const activeData = active.data.current as ActiveDragData | undefined;
    if (!activeData || activeData.type !== "item") return;

    // Use frozen refs — NOT activeData.groupLabel which mutates after re-renders
    const activeGroup = origGroupRef.current;
    const activeHref = origHrefRef.current;
    if (!activeGroup || !activeHref) return;

    const overData = over.data.current as ActiveDragData | undefined;

    // Determine target group from what we're hovering over
    let targetGroup: string | null = null;
    let targetHref: string | null = null;

    if (overData?.type === "item") {
      targetGroup = overData.groupLabel ?? null;
      targetHref = overData.item?.href ?? null;
    } else if (overData?.type === "group") {
      targetGroup = overData.group?.label ?? null;
    }

    if (!targetGroup) return;

    const snapshot = snapshotRef.current;

    if (targetGroup === activeGroup) {
      // Moving back to original group — restore snapshot to clear any cross-group preview
      useSidebarStore.setState({
        groupItemOrder: { ...snapshot.groupItemOrder },
      });
      return;
    }

    // Optimistic cross-group preview: restore snapshot then apply new position
    const fromItems = (snapshot.groupItemOrder[activeGroup] ?? []).filter(
      (h) => h !== activeHref,
    );
    const toItems = [...(snapshot.groupItemOrder[targetGroup] ?? [])];

    let insertIndex = toItems.length;
    if (targetHref && targetHref !== activeHref) {
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
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);

      const snapshot = snapshotRef.current;
      snapshotRef.current = null;

      const origGroup = origGroupRef.current;
      const origHref = origHrefRef.current;
      origGroupRef.current = null;
      origHrefRef.current = null;

      const restoreSnapshot = () => {
        if (snapshot) {
          useSidebarStore.setState({
            groupItemOrder: snapshot.groupItemOrder,
            groupOrder: snapshot.groupOrder,
          });
        }
      };

      if (!over) {
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
        restoreSnapshot();
        reorderGroups(newOrder);
        return;
      }

      // ── Case 2: Item reorder or cross-group move ──
      if (activeData.type === "item") {
        if (!origGroup || !origHref) { restoreSnapshot(); return; }

        // Determine where the item landed by reading the CURRENT optimistic state.
        // This is reliable because handleDragOver already applied the final position.
        const currentOrder = useSidebarStore.getState().groupItemOrder;
        let finalGroup: string | null = null;
        let finalIndex = -1;
        for (const [label, hrefs] of Object.entries(currentOrder)) {
          const idx = hrefs.indexOf(origHref);
          if (idx !== -1) {
            finalGroup = label;
            finalIndex = idx;
            break;
          }
        }

        if (!finalGroup) { restoreSnapshot(); return; }

        // Restore snapshot before applying real action (ensures correct undo entry)
        restoreSnapshot();

        if (finalGroup === origGroup) {
          // Same-group reorder — use over position for precision
          let targetHref: string | null = null;
          if (overData.type === "item") {
            targetHref = overData.item?.href ?? null;
          }

          // active.id === over.id means no actual reorder needed
          if (active.id === over.id) return;

          const items = snapshot.groupItemOrder[origGroup] ?? [];
          const oldIndex = items.indexOf(origHref);

          let newIndex: number;
          if (targetHref && targetHref !== origHref) {
            newIndex = items.indexOf(targetHref);
          } else {
            newIndex = finalIndex;
          }

          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          reorderItems(origGroup, arrayMove(items, oldIndex, newIndex));
        } else {
          // Cross-group move — use finalIndex from optimistic state
          moveItemBetweenGroups(origHref, origGroup, finalGroup, finalIndex);
        }
      } else {
        restoreSnapshot();
      }
    },
    [reorderGroups, reorderItems, moveItemBetweenGroups],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    origGroupRef.current = null;
    origHrefRef.current = null;
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
