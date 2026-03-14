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
  /** Map of parent item href → ordered array of sub-item hrefs */
  subItemOrder: Record<string, string[]>;

  /** Initialize from default nav groups (no-op if already initialized) */
  initFromDefaults: (groups: readonly NavGroup[]) => void;
  /** Reorder items within a group */
  reorderItems: (groupLabel: string, orderedHrefs: string[]) => void;
  /** Reorder groups themselves */
  reorderGroups: (orderedLabels: string[]) => void;
  /** Toggle group collapsed state */
  toggleGroup: (groupLabel: string) => void;
  /** Collapse all groups at once */
  collapseAllGroups: (groupLabels: string[]) => void;
  /** Move item from one group to another */
  moveItemBetweenGroups: (
    itemHref: string,
    fromGroup: string,
    toGroup: string,
    toIndex: number,
  ) => void;
  /** Reorder sub-items within a parent item */
  reorderSubItems: (parentHref: string, orderedHrefs: string[]) => void;
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
  subItemOrder: Record<string, string[]>;
}

const MAX_UNDO = 20;
let undoStack: UndoEntry[] = [];

function pushUndo(state: Pick<SidebarOrderState, "groupItemOrder" | "groupOrder" | "subItemOrder">) {
  undoStack.push({
    groupItemOrder: { ...state.groupItemOrder },
    groupOrder: [...state.groupOrder],
    subItemOrder: { ...state.subItemOrder },
  });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

export const useSidebarStore = create<SidebarOrderState>()(
  persist(
    (set, get) => ({
      groupItemOrder: {},
      groupOrder: [],
      collapsedGroups: new Set<string>(),
      subItemOrder: {},

      initFromDefaults(groups) {
        const current = get();

        // First init — seed everything
        if (current.groupOrder.length === 0) {
          const groupOrder = groups.map((g) => g.label);
          const groupItemOrder: Record<string, string[]> = {};
          for (const g of groups) {
            groupItemOrder[g.label] = g.items.map((i) => i.href);
          }
          set({ groupOrder, groupItemOrder });
          return;
        }

        // Reconcile: add new groups and ensure every default item exists somewhere
        const defaultLabels = new Set(groups.map((g) => g.label));
        const existingLabels = new Set(current.groupOrder);
        const allTracked = new Set(Object.values(current.groupItemOrder).flat());

        let changed = false;
        const nextGroupOrder = [...current.groupOrder];
        const nextGroupItemOrder = { ...current.groupItemOrder };

        for (const g of groups) {
          // Add missing groups
          if (!existingLabels.has(g.label)) {
            nextGroupOrder.push(g.label);
            nextGroupItemOrder[g.label] = g.items.map((i) => i.href);
            changed = true;
          } else {
            // Ensure new items within existing groups are tracked
            const existing = nextGroupItemOrder[g.label] ?? [];
            const toAdd = g.items
              .filter((i) => !allTracked.has(i.href))
              .map((i) => i.href);
            if (toAdd.length > 0) {
              nextGroupItemOrder[g.label] = [...existing, ...toAdd];
              toAdd.forEach((h) => allTracked.add(h));
              changed = true;
            }
          }
        }

        // Remove groups that no longer exist in defaults
        const staleGroups = nextGroupOrder.filter((l) => !defaultLabels.has(l));
        if (staleGroups.length > 0) {
          for (const label of staleGroups) {
            const idx = nextGroupOrder.indexOf(label);
            if (idx !== -1) nextGroupOrder.splice(idx, 1);
            delete nextGroupItemOrder[label];
          }
          changed = true;
        }

        if (changed) {
          set({ groupOrder: nextGroupOrder, groupItemOrder: nextGroupItemOrder });
        }
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

      collapseAllGroups(groupLabels) {
        set({ collapsedGroups: new Set(groupLabels) });
      },

      moveItemBetweenGroups(itemHref, fromGroup, toGroup, toIndex) {
        if (fromGroup === toGroup) return;
        pushUndo(get());
        set((s) => {
          const fromItems = (s.groupItemOrder[fromGroup] ?? []).filter(
            (h) => h !== itemHref,
          );
          // Prevent duplicate: remove from target first, then insert
          const toItems = (s.groupItemOrder[toGroup] ?? []).filter(
            (h) => h !== itemHref,
          );
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

      reorderSubItems(parentHref, orderedHrefs) {
        pushUndo(get());
        set((s) => ({
          subItemOrder: { ...s.subItemOrder, [parentHref]: orderedHrefs },
        }));
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
      // Bump version to force a full reset of cached sidebar state
      version: 2,
      partialize: (state) => ({
        groupItemOrder: state.groupItemOrder,
        groupOrder: state.groupOrder,
        collapsedGroups: Array.from(state.collapsedGroups),
        subItemOrder: state.subItemOrder,
      }),
      migrate: () => {
        // Any previous version → wipe and let initFromDefaults rebuild
        return {
          groupItemOrder: {},
          groupOrder: [],
          collapsedGroups: [],
          subItemOrder: {},
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        return {
          ...current,
          ...(p ?? {}),
          collapsedGroups: new Set(
            (p?.collapsedGroups as string[] | undefined) ?? [],
          ),
          subItemOrder: (p?.subItemOrder as Record<string, string[]> | undefined) ?? {},
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
    subItemOrder: entry.subItemOrder,
  });
  return true;
}
