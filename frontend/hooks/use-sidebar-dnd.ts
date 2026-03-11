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
 * Centraliza toda lógica de D&D da sidebar.
 * Suporta:
 * - Reordenar grupos (seções)
 * - Reordenar itens dentro do mesmo grupo
 * - Mover itens entre grupos (cross-group)
 */
export function useSidebarDnd() {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const overGroupRef = useRef<string | null>(null);

  const reorderItems = useSidebarStore((s) => s.reorderItems);
  const reorderGroups = useSidebarStore((s) => s.reorderGroups);
  const moveItemBetweenGroups = useSidebarStore((s) => s.moveItemBetweenGroups);
  const groupItemOrder = useSidebarStore((s) => s.groupItemOrder);
  const groupOrder = useSidebarStore((s) => s.groupOrder);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDragData | undefined;
    if (!data) return;
    setActiveDrag(data);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overData = event.over?.data.current as ActiveDragData | undefined;
    if (overData?.groupLabel) {
      overGroupRef.current = overData.groupLabel;
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);

      if (!over || active.id === over.id) {
        overGroupRef.current = null;
        return;
      }

      const activeData = active.data.current as ActiveDragData | undefined;
      const overData = over.data.current as ActiveDragData | undefined;

      if (!activeData || !overData) {
        overGroupRef.current = null;
        return;
      }

      // ── Case 1: Reordering groups ──
      if (activeData.type === "group" && overData.type === "group") {
        const activeLabel = activeData.group?.label;
        const overLabel = overData.group?.label;
        if (!activeLabel || !overLabel) return;

        const oldIndex = groupOrder.indexOf(activeLabel);
        const newIndex = groupOrder.indexOf(overLabel);
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(groupOrder, oldIndex, newIndex);
        reorderGroups(newOrder);
        overGroupRef.current = null;
        return;
      }

      // ── Case 2: Reordering items ──
      if (activeData.type === "item" && overData.type === "item") {
        const activeGroup = activeData.groupLabel;
        const overGroup = overData.groupLabel;
        const activeHref = activeData.item?.href;
        const overHref = overData.item?.href;

        if (!activeGroup || !overGroup || !activeHref || !overHref) {
          overGroupRef.current = null;
          return;
        }

        // Same group reorder
        if (activeGroup === overGroup) {
          const items = groupItemOrder[activeGroup] ?? [];
          const oldIndex = items.indexOf(activeHref);
          const newIndex = items.indexOf(overHref);
          if (oldIndex === -1 || newIndex === -1) return;

          const newOrder = arrayMove(items, oldIndex, newIndex);
          reorderItems(activeGroup, newOrder);
        } else {
          // Cross-group move: move item from activeGroup to overGroup
          const targetItems = groupItemOrder[overGroup] ?? [];
          const targetIndex = targetItems.indexOf(overHref);
          const insertIndex = targetIndex === -1 ? targetItems.length : targetIndex;

          moveItemBetweenGroups(activeHref, activeGroup, overGroup, insertIndex);
        }
      }

      overGroupRef.current = null;
    },
    [groupOrder, groupItemOrder, reorderGroups, reorderItems, moveItemBetweenGroups],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    overGroupRef.current = null;
  }, []);

  return {
    activeDrag,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
