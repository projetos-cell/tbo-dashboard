"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import type { Database } from "@/lib/supabase/types";
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  applyDynamicStatusFilters,
  getUniquePersonNames,
  type ContractFilters,
} from "@/features/contratos/services/contracts";

export function useContracts(filters?: ContractFilters) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  // Strip dynamic-only filters before sending to Supabase
  const dbFilters = useMemo(() => {
    if (!filters) return undefined;
    const { dynamicStatuses: _ds, ...rest } = filters;
    return rest;
  }, [filters]);

  const query = useQuery({
    queryKey: ["contracts", tenantId, dbFilters],
    queryFn: () => getContracts(supabase, dbFilters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });

  // Apply dynamic status filters client-side
  const filteredData = useMemo(() => {
    if (!query.data) return [];
    if (filters?.dynamicStatuses?.length) {
      return applyDynamicStatusFilters(query.data, filters.dynamicStatuses);
    }
    return query.data;
  }, [query.data, filters?.dynamicStatuses]);

  return { ...query, data: filteredData };
}

/** Hook to get all contracts (unfiltered) for extracting unique person names */
export function useContractPersonNames() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data } = useQuery({
    queryKey: ["contracts-all", tenantId],
    queryFn: () => getContracts(supabase),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });

  return useMemo(() => getUniquePersonNames(data ?? []), [data]);
}

export function useContract(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContractById(supabase, id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!tenantId,
  });
}

export function useCreateContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Database["public"]["Tables"]["contracts"]["Insert"]) =>
      createContract(supabase, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "contracts",
        recordId:
          (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["contracts"]["Update"];
    }) => updateContract(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract"] });

      const action = variables.updates.status ? "status_change" : "update";
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action,
        table: "contracts",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContract(supabase, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "contracts",
        recordId: id,
      });
    },
  });
}
