"use client";

import { useCallback } from "react";
import { PricingPremisesCard } from "@/features/comercial/components/pricing-premises-card";
import { BUCostsTable } from "@/features/comercial/components/bu-costs-table";
import { PricingEngineTable } from "@/features/comercial/components/pricing-engine-table";
import { ErrorState } from "@/components/shared";
import {
  usePricingPremises,
  useUpsertPricingPremises,
  useBUCosts,
  useUpsertBUCost,
  usePricingServices,
  useSyncServicePrices,
} from "@/features/comercial/hooks/use-pricing";
import { updateService } from "@/features/comercial/services/services-catalog";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { PricingPremisesUpdate, BUCostUpdate } from "@/features/comercial/services/pricing";

export default function PrecificacaoPage() {
  const qc = useQueryClient();

  const { data: premises, isLoading: loadingPremises, error: errorPremises } = usePricingPremises();
  const { data: buCosts = [], isLoading: loadingBU, error: errorBU } = useBUCosts();
  const { data: services = [], isLoading: loadingServices, error: errorServices } = usePricingServices();

  const upsertPremises = useUpsertPricingPremises();
  const upsertBUCost = useUpsertBUCost();
  const syncPrices = useSyncServicePrices();

  const handleSavePremises = useCallback(
    (updates: PricingPremisesUpdate) => {
      upsertPremises.mutate(updates);
    },
    [upsertPremises],
  );

  const handleSaveBUCost = useCallback(
    (bu: string, updates: BUCostUpdate) => {
      upsertBUCost.mutate({ bu, updates });
    },
    [upsertBUCost],
  );

  const handleServiceUpdate = useCallback(
    async (
      id: string,
      field: "hours_estimated" | "third_party_cost" | "min_price",
      value: number,
    ) => {
      const supabase = createClient();
      await updateService(supabase, id, { [field]: value } as never);
      qc.invalidateQueries({ queryKey: ["pricing-services"] });
    },
    [qc],
  );

  const handleSync = useCallback(
    (entries: Array<{ id: string; base_price: number }>) => {
      syncPrices.mutate(entries);
    },
    [syncPrices],
  );

  const anyError = errorPremises ?? errorBU ?? errorServices;

  if (anyError) {
    return (
      <ErrorState
        message="Não foi possível carregar os dados de precificação."
        onRetry={() => {
          qc.invalidateQueries({ queryKey: ["pricing-premises"] });
          qc.invalidateQueries({ queryKey: ["bu-costs"] });
          qc.invalidateQueries({ queryKey: ["pricing-services"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Precificação</h1>
        <p className="text-muted-foreground text-sm">
          Motor de precificação dinâmico — premissas, custo por BU e preços calculados por serviço.
        </p>
      </div>

      {/* Premissas Gerais */}
      <PricingPremisesCard
        premises={premises}
        isLoading={loadingPremises}
        onSave={handleSavePremises}
        isSaving={upsertPremises.isPending}
      />

      {/* Custo/Hora por BU */}
      <BUCostsTable
        buCosts={buCosts}
        isLoading={loadingBU}
        onSave={handleSaveBUCost}
        isSaving={upsertBUCost.isPending}
      />

      {/* Motor de Preços */}
      <PricingEngineTable
        services={services}
        buCosts={buCosts}
        premises={premises ?? null}
        isLoading={loadingServices}
        onServiceUpdate={handleServiceUpdate}
        isSyncing={syncPrices.isPending}
        onSync={handleSync}
      />
    </div>
  );
}
