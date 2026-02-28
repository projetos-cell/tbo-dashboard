"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTablePreferences,
  saveTablePreferences,
  resetTablePreferences,
} from "@/services/table-preferences";
import type { ColumnPref } from "@/lib/column-types";

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
    staleTime: Infinity, // Column prefs rarely change externally
  });

  const saveMutation = useMutation({
    mutationFn: (columns: ColumnPref[]) =>
      saveTablePreferences(supabase, tenantId!, userId!, tableId, columns),
    onSuccess: (_data, columns) => {
      qc.setQueryData(queryKey, columns);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetTablePreferences(supabase, userId!, tableId),
    onSuccess: () => {
      qc.setQueryData(queryKey, null);
    },
  });

  return {
    /** Saved column prefs (null = use defaults) */
    prefs: query.data ?? null,
    isLoading: query.isLoading,
    /** Persist new column order/visibility */
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    /** Reset to default column layout */
    reset: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  };
}
