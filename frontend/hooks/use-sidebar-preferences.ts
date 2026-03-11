"use client";

import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import {
  getSidebarPreferences,
  saveSidebarPreferences,
  resetSidebarPreferences,
  type SidebarPrefsData,
} from "@/services/sidebar-preferences";

const DEBOUNCE_MS = 1000;

/**
 * Syncs sidebar order between Zustand (local) and Supabase (remote).
 * - On mount: loads remote prefs → hydrates Zustand store
 * - On change: debounced save to Supabase
 */
export function useSidebarPreferences() {
  const supabase = createClient();
  const { user, tenantId } = useAuthStore();
  const qc = useQueryClient();
  const userId = user?.id;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryKey = ["sidebar-preferences", userId];

  // Zustand selectors
  const groupOrder = useSidebarStore((s) => s.groupOrder);
  const groupItemOrder = useSidebarStore((s) => s.groupItemOrder);
  const collapsedGroups = useSidebarStore((s) => s.collapsedGroups);

  // ── Load from Supabase on mount ──
  const query = useQuery({
    queryKey,
    queryFn: () => getSidebarPreferences(supabase, userId!),
    enabled: !!userId,
    staleTime: Infinity,
  });

  // Hydrate Zustand from remote (only once on first load)
  const hydrated = useRef(false);
  useEffect(() => {
    if (!query.data || hydrated.current) return;
    hydrated.current = true;

    const { group_order, group_items, collapsed } = query.data;

    if (group_order.length > 0) {
      useSidebarStore.setState({
        groupOrder: group_order,
        groupItemOrder: group_items,
        collapsedGroups: new Set(collapsed),
      });
    }
  }, [query.data]);

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: (prefs: SidebarPrefsData) =>
      saveSidebarPreferences(supabase, tenantId!, userId!, prefs),
    onSuccess: (_data, prefs) => {
      qc.setQueryData(queryKey, prefs);
    },
  });

  // ── Debounced save (called after D&D reorder) ──
  const saveToSupabase = useCallback(() => {
    if (!userId || !tenantId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const state = useSidebarStore.getState();
      saveMutation.mutate({
        group_order: state.groupOrder,
        group_items: state.groupItemOrder,
        collapsed: Array.from(state.collapsedGroups),
      });
    }, DEBOUNCE_MS);
  }, [userId, tenantId, saveMutation]);

  // ── Auto-save when store changes ──
  useEffect(() => {
    if (!hydrated.current) return;
    saveToSupabase();
  }, [groupOrder, groupItemOrder, collapsedGroups, saveToSupabase]);

  // ── Reset ──
  const resetMutation = useMutation({
    mutationFn: () => resetSidebarPreferences(supabase, userId!),
    onSuccess: () => {
      qc.setQueryData(queryKey, null);
      // Clear Zustand store — will re-init from defaults
      useSidebarStore.setState({
        groupOrder: [],
        groupItemOrder: {},
        collapsedGroups: new Set(),
      });
    },
  });

  return {
    isLoading: query.isLoading,
    isSaving: saveMutation.isPending,
    reset: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  };
}
