"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
} from "@/services/commercial";

interface DealFilters {
  stage?: string;
  search?: string;
  owner_id?: string;
}

export function useDeals(filters?: DealFilters) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["deals", tenantId, filters],
    queryFn: async () => {
      const supabase = createClient();
      return getDeals(supabase, tenantId!, filters);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useDeal(id: string | null) {
  return useQuery({
    queryKey: ["deal", id],
    queryFn: async () => {
      const supabase = createClient();
      return getDealById(supabase, id!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      deal: Parameters<typeof createDeal>[1],
    ) => {
      const supabase = createClient();
      return createDeal(supabase, deal);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["deals"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "crm_deals",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateDeal>[2];
    }) => {
      const supabase = createClient();
      return updateDeal(supabase, id, updates);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["deals"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "crm_deals",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateDealStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const supabase = createClient();
      return updateDealStage(supabase, id, stage);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["deals"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "status_change",
        table: "crm_deals",
        recordId: variables.id,
        after: { stage: variables.stage },
        metadata: { field: "stage" },
      });
    },
  });
}
