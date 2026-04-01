"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTablePreferences,
  saveTablePreferences,
  resetTablePreferences,
  type TablePrefsData,
} from "@/services/table-preferences";
import type { ColumnPref, SortPref } from "@/lib/column-types";
import type { TableDensity } from "@/components/shared/table-density-toggle";

export function useTablePreferences(tableId: string) {
  const supabase = createClient();
  const { user, tenantId } = useAuthStore();
  const qc = useQueryClient();
  const userId = user?.id;

  const queryKey = ["table-preferences", userId, tableId];

  const query = useQuery({
    queryKey,
    queryFn: () => getTablePreferences(supabase, userId!, tableId),
    enabled: !!userId && !!tableId,
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: (prefs: TablePrefsData) =>
      saveTablePreferences(supabase, tenantId!, userId!, tableId, prefs),
    onSuccess: (_data, prefs) => {
      qc.setQueryData(queryKey, prefs);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetTablePreferences(supabase, userId!, tableId),
    onSuccess: () => {
      qc.setQueryData(queryKey, null);
    },
  });

  const currentPrefs = query.data ?? null;

  /** Save column prefs (merges with existing prefs) */
  const saveColumns = (columns: ColumnPref[]) => {
    saveMutation.mutate({
      columns,
      sort: currentPrefs?.sort ?? null,
      density: currentPrefs?.density ?? null,
    });
  };

  /** Save sort pref (merges with existing prefs) */
  const saveSort = (sort: SortPref | null) => {
    saveMutation.mutate({
      columns: currentPrefs?.columns ?? [],
      sort,
      density: currentPrefs?.density ?? null,
    });
  };

  /** Save density pref (merges with existing prefs) */
  const saveDensity = (density: TableDensity) => {
    saveMutation.mutate({
      columns: currentPrefs?.columns ?? [],
      sort: currentPrefs?.sort ?? null,
      density,
    });
  };

  return {
    /** Saved column prefs (null = use defaults) */
    columnPrefs: currentPrefs?.columns ?? null,
    /** Saved sort preference */
    sortPref: currentPrefs?.sort ?? null,
    /** Saved density preference */
    density: currentPrefs?.density ?? "normal",
    isLoading: query.isLoading,
    /** Persist column order/visibility changes */
    saveColumns,
    /** Persist sort preference changes */
    saveSort,
    /** Persist density changes */
    saveDensity,
    isSaving: saveMutation.isPending,
    /** Reset all preferences to defaults */
    reset: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  };
}
