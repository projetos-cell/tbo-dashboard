import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ADMIN_WIDGETS,
  GENERAL_WIDGETS,
  getDefaultOrder,
} from "@/features/dashboard/utils/dashboard-widgets";

// ── Types ───────────────────────────────────────────────────────

type View = "admin" | "general";

interface DashboardLayoutState {
  adminOrder: string[];
  adminHidden: string[];
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

const DEFAULT_ADMIN_ORDER = getDefaultOrder(ADMIN_WIDGETS);
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
      adminOrder: DEFAULT_ADMIN_ORDER,
      adminHidden: [],
      generalOrder: DEFAULT_GENERAL_ORDER,
      generalHidden: [],

      reorder: (view, ids) =>
        set(
          view === "admin"
            ? { adminOrder: ids }
            : { generalOrder: ids }
        ),

      hideWidget: (view, id) =>
        set((s) => {
          if (view === "admin") {
            return {
              adminHidden: s.adminHidden.includes(id)
                ? s.adminHidden
                : [...s.adminHidden, id],
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
          if (view === "admin") {
            const order = s.adminOrder.includes(id)
              ? s.adminOrder
              : [...s.adminOrder, id];
            return {
              adminHidden: s.adminHidden.filter((h) => h !== id),
              adminOrder: order,
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
          view === "admin"
            ? {
                adminOrder: DEFAULT_ADMIN_ORDER,
                adminHidden: [],
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
        state.adminOrder = ensureAllWidgets(
          state.adminOrder,
          DEFAULT_ADMIN_ORDER
        );
        state.generalOrder = ensureAllWidgets(
          state.generalOrder,
          DEFAULT_GENERAL_ORDER
        );
      },
    }
  )
);
