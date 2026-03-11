"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NavGroup, NavGroupItem } from "@/lib/navigation";

/** Sidebar ordering state — persisted locally, prepared for Supabase sync. */
interface SidebarOrderState {
  /** Map of group label → ordered array of item hrefs */
  groupItemOrder: Record<string, string[]>;
  /** Ordered array of group labels */
  groupOrder: string[];
  /** Set of collapsed group labels */
  collapsedGroups: Set<string>;

  /** Initialize from default nav groups (no-op if already initialized) */
  initFromDefaults: (groups: readonly NavGroup[]) => void;
  /** Reorder items within a group */
  reorderItems: (groupLabel: string, orderedHrefs: string[]) => void;
  /** Reorder groups themselves */
  reorderGroups: (orderedLabels: string[]) => void;
  /** Toggle group collapsed state */
  toggleGroup: (groupLabel: string) => void;
  /** Move item from one group to another */
  moveItemBetweenGroups: (
    itemHref: string,
    fromGroup: string,
    toGroup: string,
    toIndex: number,
  ) => void;
  /** Get items in display order for a group */
  getOrderedItems: (
    group: NavGroup,
    canSee: (module: string) => boolean,
  ) => NavGroupItem[];
  /** Get groups in display order */
  getOrderedGroups: (groups: readonly NavGroup[]) => NavGroup[];
}

/** Undo stack entry */
interface UndoEntry {
  groupItemOrder: Record<string, string[]>;
  groupOrder: string[];
}

const MAX_UNDO = 20;
let undoStack: UndoEntry[] = [];

function pushUndo(state: Pick<SidebarOrderState, "groupItemOrder" | "groupOrder">) {
  undoStack.push({
    groupItemOrder: { ...state.groupItemOrder },
    groupOrder: [...state.groupOrder],
  });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

export const useSidebarStore = create<SidebarOrderState>()(
  persist(
    (set, get) => ({
      groupItemOrder: {},
      groupOrder: [],
      collapsedGroups: new Set<string>(),

      initFromDefaults(groups) {
        const current = get();
        if (current.groupOrder.length > 0) return;

        const groupOrder = groups.map((g) => g.label);
        const groupItemOrder: Record<string, string[]> = {};
        for (const g of groups) {
          groupItemOrder[g.label] = g.items.map((i) => i.href);
        }
        set({ groupOrder, groupItemOrder });
      },

      reorderItems(groupLabel, orderedHrefs) {
        pushUndo(get());
        set((s) => ({
          groupItemOrder: { ...s.groupItemOrder, [groupLabel]: orderedHrefs },
        }));
      },

      reorderGroups(orderedLabels) {
        pushUndo(get());
        set({ groupOrder: orderedLabels });
      },

      toggleGroup(groupLabel) {
        set((s) => {
          const next = new Set(s.collapsedGroups);
          if (next.has(groupLabel)) next.delete(groupLabel);
          else next.add(groupLabel);
          return { collapsedGroups: next };
        });
      },

      moveItemBetweenGroups(itemHref, fromGroup, toGroup, toIndex) {
        pushUndo(get());
        set((s) => {
          const fromItems = (s.groupItemOrder[fromGroup] ?? []).filter(
            (h) => h !== itemHref,
          );
          const toItems = [...(s.groupItemOrder[toGroup] ?? [])];
          toItems.splice(toIndex, 0, itemHref);
          return {
            groupItemOrder: {
              ...s.groupItemOrder,
              [fromGroup]: fromItems,
              [toGroup]: toItems,
            },
          };
        });
      },

      getOrderedItems(group, canSee) {
        const order = get().groupItemOrder[group.label];
        const visible = group.items.filter((i) => canSee(i.module));
        if (!order) return [...visible];

        const itemMap = new Map(visible.map((i) => [i.href, i]));
        const ordered: NavGroupItem[] = [];
        for (const href of order) {
          const item = itemMap.get(href);
          if (item) {
            ordered.push(item);
            itemMap.delete(href);
          }
        }
        // Append any new items not in saved order
        for (const item of itemMap.values()) {
          ordered.push(item);
        }
        return ordered;
      },

      getOrderedGroups(groups) {
        const order = get().groupOrder;
        if (order.length === 0) return [...groups];

        const groupMap = new Map(groups.map((g) => [g.label, g]));
        const ordered: NavGroup[] = [];
        for (const label of order) {
          const g = groupMap.get(label);
          if (g) {
            ordered.push(g);
            groupMap.delete(label);
          }
        }
        for (const g of groupMap.values()) {
          ordered.push(g);
        }
        return ordered;
      },
    }),
    {
      name: "tbo-sidebar-order",
      partialize: (state) => ({
        groupItemOrder: state.groupItemOrder,
        groupOrder: state.groupOrder,
        collapsedGroups: Array.from(state.collapsedGroups),
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        return {
          ...current,
          ...(p ?? {}),
          collapsedGroups: new Set(
            (p?.collapsedGroups as string[] | undefined) ?? [],
          ),
        };
      },
    },
  ),
);

/** Undo last sidebar reorder. Call from Ctrl+Z handler. */
export function undoSidebarReorder() {
  const entry = undoStack.pop();
  if (!entry) return false;
  useSidebarStore.setState({
    groupItemOrder: entry.groupItemOrder,
    groupOrder: entry.groupOrder,
  });
  return true;
}
