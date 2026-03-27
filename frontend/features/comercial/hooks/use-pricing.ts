"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import {
  getPricingPremises,
  upsertPricingPremises,
  getBUCosts,
  upsertBUCost,
  getPricingServices,
  type PricingPremisesUpdate,
  type BUCostUpdate,
} from "@/features/comercial/services/pricing";
import { updateService } from "@/features/comercial/services/services-catalog";

export function usePricingPremises() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["pricing-premises", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getPricingPremises(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUpsertPricingPremises() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const mutation = useMutation({
    mutationFn: async (updates: PricingPremisesUpdate) => {
      const supabase = createClient();
      return upsertPricingPremises(supabase, tenantId!, updates);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["pricing-premises"] });
      toast.success("Premissas salvas");
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "pricing_premises",
        recordId: data.id,
        after: data as unknown as Record<string, unknown>,
      });
    },
    onError: (err) => {
      toast.error(`Erro ao salvar premissas: ${err.message}`);
    },
  });
  return mutation;
}

export function useBUCosts() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["bu-costs", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getBUCosts(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUpsertBUCost() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const mutation = useMutation({
    mutationFn: async ({ bu, updates }: { bu: string; updates: BUCostUpdate }) => {
      const supabase = createClient();
      return upsertBUCost(supabase, tenantId!, bu, updates);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["bu-costs"] });
      toast.success(`Custo da BU ${data.bu} atualizado`);
    },
    onError: (err) => {
      toast.error(`Erro ao salvar custo: ${err.message}`);
    },
  });
  return mutation;
}

export function usePricingServices() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["pricing-services", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getPricingServices(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSyncServicePrices() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (entries: Array<{ id: string; base_price: number }>) => {
      const supabase = createClient();
      await Promise.all(
        entries.map(({ id, base_price }) =>
          updateService(supabase, id, { base_price }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["pricing-services"] });
      toast.success("Preços sincronizados com o Catálogo de Serviços");
    },
    onError: (err) => {
      toast.error(`Erro ao sincronizar preços: ${err.message}`, {
        action: { label: "Tentar novamente", onClick: () => mutation.mutate([]) },
      });
    },
  });
  return mutation;
}
