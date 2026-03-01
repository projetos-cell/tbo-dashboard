"use client";

import { useState, useMemo } from "react";
import { useDeals, useUpdateDealStage } from "@/hooks/use-commercial";
import { DealKPICards } from "@/components/comercial/deal-kpis";
import { DealFilters } from "@/components/comercial/deal-filters";
import { DealPipeline } from "@/components/comercial/deal-pipeline";
import { DealDetailDialog } from "@/components/comercial/deal-detail-dialog";
import { DealFormDialog } from "@/components/comercial/deal-form-dialog";
import { computeDealKPIs } from "@/services/commercial";
import { RequireRole } from "@/components/auth/require-role";
import { ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
            <p className="text-sm text-muted-foreground">
              Pipeline CRM — gerencie deals, propostas e funil de vendas.
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Deal
          </Button>
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
