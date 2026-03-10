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
  getDealPipelines,
  getRdPipelines,
  getDealOwners,
} from "@/features/comercial/services/commercial";

interface DealFilters {
  stage?: string;
  search?: string;
  owner_id?: string;
  pipeline?: string;
  owner_name?: string;
  rd_stage_id?: string;
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

// ── RD Station Sync ─────────────────────────────────────────────────────────────

export function useRdSyncDeals() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/comercial/sync-rd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro de rede" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["rd-sync-logs"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "crm_deals",
        recordId: "rd_sync",
        metadata: {
          source: "rdstation",
          created: data.created,
          updated: data.updated,
        },
      });
    },
  });
}

export function usePipelines() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["deal-pipelines", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getDealPipelines(supabase, tenantId!);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

// ── RD Pipelines (with stages from RD Station) ──────────────────────────────────

export function useRdPipelines() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rd-pipelines", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getRdPipelines(supabase, tenantId!);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

// ── Owners (distinct from deals) ────────────────────────────────────────────────

export function useDealOwners(pipelineId?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["deal-owners", tenantId, pipelineId],
    queryFn: async () => {
      const supabase = createClient();
      return getDealOwners(supabase, tenantId!, pipelineId);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
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
