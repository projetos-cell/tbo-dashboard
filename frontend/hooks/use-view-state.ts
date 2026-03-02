"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  loadViewState,
  saveViewState,
  type ViewState,
  type SortSpec,
} from "@/services/view-state";

const DEFAULT_STATE: ViewState = { filters: {}, sort: [] };

/**
 * Loads and persists filter/sort state for a workspace view.
 * - On mount: loads from Supabase
 * - On change: optimistically updates React Query cache, then persists
 * - On failure: rolls back + toast
 */
export function useViewState(workspace: string, viewKey: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const rollbackRef = useRef<ViewState | null>(null);

  const queryKey = ["view-state", workspace, viewKey, userId];

  // Load persisted state
  const { data: viewState, isLoading } = useQuery({
    queryKey,
    queryFn: () => loadViewState(supabase, userId!, workspace, viewKey),
    staleTime: Infinity, // Only refetch on explicit invalidation
    enabled: !!userId,
    select: (d) => d ?? DEFAULT_STATE,
  });

  // Persist mutation
  const mutation = useMutation({
    mutationFn: (state: ViewState) =>
      saveViewState(supabase, userId!, tenantId!, workspace, viewKey, state),
    onError: () => {
      // Rollback optimistic update
      if (rollbackRef.current) {
        queryClient.setQueryData(queryKey, rollbackRef.current);
        rollbackRef.current = null;
      }
      toast({
        title: "Erro ao salvar filtros",
        description: "Tente novamente ou recarregue a página.",
        variant: "destructive",
      });
    },
  });

  // Update state: optimistic update + async persist
  const updateState = useCallback(
    (next: ViewState) => {
      if (!userId || !tenantId) return;
      const prev = queryClient.getQueryData<ViewState>(queryKey);
      rollbackRef.current = prev ?? DEFAULT_STATE;
      queryClient.setQueryData(queryKey, next);
      mutation.mutate(next);
    },
    [userId, tenantId, queryClient, queryKey, mutation]
  );

  // Convenience: update only filters (merge with existing sort)
  const updateFilters = useCallback(
    (filters: Record<string, unknown>) => {
      const current = queryClient.getQueryData<ViewState>(queryKey) ?? DEFAULT_STATE;
      updateState({ ...current, filters });
    },
    [queryClient, queryKey, updateState]
  );

  // Convenience: update only sort
  const updateSort = useCallback(
    (sort: SortSpec[]) => {
      const current = queryClient.getQueryData<ViewState>(queryKey) ?? DEFAULT_STATE;
      updateState({ ...current, sort });
    },
    [queryClient, queryKey, updateState]
  );

  return {
    viewState: viewState ?? DEFAULT_STATE,
    isLoading,
    updateFilters,
    updateSort,
    updateState,
  };
}
