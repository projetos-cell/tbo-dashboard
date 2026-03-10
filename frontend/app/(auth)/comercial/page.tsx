"use client";

import { useState, useMemo } from "react";
import { useDeals, useUpdateDealStage, useRdSyncDeals, useRdConfig } from "@/features/comercial/hooks/use-commercial";
import { DealKPICards } from "@/features/comercial/components/deal-kpis";
import { DealFilters } from "@/features/comercial/components/deal-filters";
import { DealPipeline } from "@/features/comercial/components/deal-pipeline";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import { computeDealKPIs } from "@/features/comercial/services/commercial";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

export default function ComercialPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);

  const { data: deals = [], isLoading, error, refetch } = useDeals({
    stage: stageFilter || undefined,
    search: search || undefined,
  });

  const updateStage = useUpdateDealStage();
  const rdSync = useRdSyncDeals();
  const { data: rdConfig, isLoading: rdConfigLoading } = useRdConfig();
  const hasRd = !!rdConfig?.api_token && rdConfig.enabled;

  function handleSyncRd() {
    if (!hasRd) {
      toast.error("RD Station não configurado. Vá em Integrações para adicionar seu token.");
      return;
    }
    rdSync.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          `Sync RD Station concluído: ${data.created} novos, ${data.updated} atualizados`,
        );
      },
      onError: (err) => {
        toast.error(`Erro no sync: ${err.message}`);
      },
    });
  }

  const kpis = useMemo(() => computeDealKPIs(deals), [deals]);

  function handleSelect(deal: DealRow) {
    setSelectedDeal(deal);
    setDetailOpen(true);
  }

  function handleEdit(deal: DealRow) {
    setDetailOpen(false);
    setEditingDeal(deal);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingDeal(null);
    setFormOpen(true);
  }

  function handleStageDrop(dealId: string, newStage: string) {
    updateStage.mutate({ id: dealId, stage: newStage });
  }

  if (error) {
    return (
      <RequireRole module="comercial">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  return (
    <RequireRole module="comercial">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comercial</h1>
            <p className="text-sm text-gray-500">
              Pipeline CRM — gerencie deals, propostas e funil de vendas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncRd}
              disabled={rdSync.isPending || rdConfigLoading}
            >
              {rdSync.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync RD Station
            </Button>
            <Button onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Deal
            </Button>
          </div>
        </div>

        <DealKPICards kpis={kpis} />

        <DealFilters
          search={search}
          onSearchChange={setSearch}
          stageFilter={stageFilter}
          onStageChange={setStageFilter}
        />

        <DealPipeline
          deals={deals}
          isLoading={isLoading}
          onSelect={handleSelect}
          onStageDrop={handleStageDrop}
        />

        <DealDetailDialog
          deal={selectedDeal}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
        />

        <DealFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          deal={editingDeal}
        />
      </div>
    </RequireRole>
  );
}
