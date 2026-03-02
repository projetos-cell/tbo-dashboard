import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FOUNDER_WIDGETS,
  GENERAL_WIDGETS,
  getDefaultOrder,
} from "@/lib/dashboard-widgets";

// ── Types ───────────────────────────────────────────────────────

type View = "founder" | "general";

interface DashboardLayoutState {
  founderOrder: string[];
  founderHidden: string[];
  generalOrder: string[];
  generalHidden: string[];

  /** Replace widget order for a view */
  reorder: (view: View, ids: string[]) => void;
  /** Hide a widget */
  hideWidget: (view: View, id: string) => void;
  /** Show a previously hidden widget (appends at end) */
  showWidget: (view: View, id: string) => void;
  /** Reset to default order and show all widgets */
  resetLayout: (view: View) => void;
}

// ── Defaults ────────────────────────────────────────────────────

const DEFAULT_FOUNDER_ORDER = getDefaultOrder(FOUNDER_WIDGETS);
const DEFAULT_GENERAL_ORDER = getDefaultOrder(GENERAL_WIDGETS);

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Ensures every widget from the registry is present in the persisted order.
 * New widgets (added after the user saved their layout) are appended at the end.
 */
function ensureAllWidgets(
  persisted: string[],
  defaults: string[]
): string[] {
  const set = new Set(persisted);
  const merged = [...persisted];
  for (const id of defaults) {
    if (!set.has(id)) {
      merged.push(id);
    }
  }
  // Also remove widget IDs that no longer exist in the registry
  const defaultSet = new Set(defaults);
  return merged.filter((id) => defaultSet.has(id));
}

// ── Store ───────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      founderOrder: DEFAULT_FOUNDER_ORDER,
      founderHidden: [],
      generalOrder: DEFAULT_GENERAL_ORDER,
      generalHidden: [],

      reorder: (view, ids) =>
        set(
          view === "founder"
            ? { founderOrder: ids }
            : { generalOrder: ids }
        ),

      hideWidget: (view, id) =>
        set((s) => {
          if (view === "founder") {
            return {
              founderHidden: s.founderHidden.includes(id)
                ? s.founderHidden
                : [...s.founderHidden, id],
            };
          }
          return {
            generalHidden: s.generalHidden.includes(id)
              ? s.generalHidden
              : [...s.generalHidden, id],
          };
        }),

      showWidget: (view, id) =>
        set((s) => {
          if (view === "founder") {
            const order = s.founderOrder.includes(id)
              ? s.founderOrder
              : [...s.founderOrder, id];
            return {
              founderHidden: s.founderHidden.filter((h) => h !== id),
              founderOrder: order,
            };
          }
          const order = s.generalOrder.includes(id)
            ? s.generalOrder
            : [...s.generalOrder, id];
          return {
            generalHidden: s.generalHidden.filter((h) => h !== id),
            generalOrder: order,
          };
        }),

      resetLayout: (view) =>
        set(
          view === "founder"
            ? {
                founderOrder: DEFAULT_FOUNDER_ORDER,
                founderHidden: [],
              }
            : {
                generalOrder: DEFAULT_GENERAL_ORDER,
                generalHidden: [],
              }
        ),
    }),
    {
      name: "tbo-dashboard-layout",
      // On rehydration, ensure new widgets are included
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.founderOrder = ensureAllWidgets(
          state.founderOrder,
          DEFAULT_FOUNDER_ORDER
        );
        state.generalOrder = ensureAllWidgets(
          state.generalOrder,
          DEFAULT_GENERAL_ORDER
        );
      },
    }
  )
);
