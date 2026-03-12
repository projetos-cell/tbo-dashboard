"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getScopeItems,
  createScopeItem,
  createScopeItemsBatch,
  updateScopeItem,
  deleteScopeItem,
  type ScopeItemInsert,
  type ScopeItemUpdate,
  type ScopeItemRow,
} from "../services/scope-items";

export function useScopeItems(contractId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["contracts", contractId, "scope"],
    queryFn: () => getScopeItems(supabase, contractId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!contractId,
  });
}

export function useCreateScopeItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScopeItemInsert) => createScopeItem(supabase, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contract_id, "scope"],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useCreateScopeItemsBatch() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ScopeItemInsert[]) =>
      createScopeItemsBatch(supabase, items),
    onSuccess: (_data, variables) => {
      if (variables.length) {
        queryClient.invalidateQueries({
          queryKey: ["contracts", variables[0].contract_id, "scope"],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateScopeItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; contractId: string; updates: ScopeItemUpdate }) =>
      updateScopeItem(supabase, id, updates),

    onMutate: async (variables) => {
      const qk = ["contracts", variables.contractId, "scope"];
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData<ScopeItemRow[]>(qk);

      queryClient.setQueryData<ScopeItemRow[]>(qk, (old) =>
        old?.map((item) =>
          item.id === variables.id
            ? { ...item, ...variables.updates }
            : item
        )
      );

      return { previous, qk };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.qk, context.previous);
      }
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "scope"],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "contract_scope_items",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteScopeItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; contractId: string }) =>
      deleteScopeItem(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "scope"],
      });
    },
  });
}
