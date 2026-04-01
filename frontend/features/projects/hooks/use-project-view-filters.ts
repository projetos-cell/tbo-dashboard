"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface ProjectViewFilters {
  statuses: string[];
  bus: string[];
  search: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}

const DEFAULT_FILTERS: ProjectViewFilters = {
  statuses: [],
  bus: [],
  search: "",
  sortBy: "name",
  sortDir: "asc",
};

/**
 * Persists project view filters per user + view to Supabase.
 * Uses the existing user_preferences table with a namespaced key.
 */
export function useProjectViewFilters(viewId: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const prefKey = `project_filters_${viewId}`;
  const queryKey = ["project-view-filters", userId, viewId];

  const { data: filters } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_preferences")
        .select("value")
        .eq("user_id", userId!)
        .eq("key", prefKey)
        .maybeSingle();

      return data?.value
        ? (JSON.parse(data.value as string) as ProjectViewFilters)
        : DEFAULT_FILTERS;
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: async (newFilters: ProjectViewFilters) => {
      const { error } = await (supabase as any)
        .from("user_preferences")
        .upsert(
          {
            user_id: userId!,
            tenant_id: tenantId!,
            key: prefKey,
            value: JSON.stringify(newFilters),
          },
          { onConflict: "user_id,key" },
        );
      if (error) throw error;
    },
    onMutate: async (newFilters) => {
      await qc.cancelQueries({ queryKey });
      qc.setQueryData(queryKey, newFilters);
    },
  });

  const updateFilters = useCallback(
    (partial: Partial<ProjectViewFilters>) => {
      const current = filters ?? DEFAULT_FILTERS;
      saveMutation.mutate({ ...current, ...partial });
    },
    [filters, saveMutation],
  );

  const resetFilters = useCallback(() => {
    saveMutation.mutate(DEFAULT_FILTERS);
  }, [saveMutation]);

  return {
    filters: filters ?? DEFAULT_FILTERS,
    updateFilters,
    resetFilters,
    isSaving: saveMutation.isPending,
  };
}
