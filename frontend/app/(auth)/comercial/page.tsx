"use client";

import { useState, useMemo } from "react";
import {
  useDeals,
  useUpdateDealStage,
  usePipelines as useDealPipelines,
  useRdPipelines,
  useDealOwners,
  useUpdateDeal,
} from "@/features/comercial/hooks/use-commercial";
import { DealKPICards } from "@/features/comercial/components/deal-kpis";
import { DadosComerciaisMensais } from "@/features/comercial/components/dados-comerciais-mensais";
import { RdPipelineKanban } from "@/features/comercial/components/rd-pipeline-kanban";
import { DealPipeline } from "@/features/comercial/components/deal-pipeline";
import { PipelineFilters } from "@/features/comercial/components/pipeline-filters";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import { computeDealKPIs } from "@/features/comercial/services/commercial";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconGitBranch } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

export default function ComercialPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("all");

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { data: pipelines = [], isLoading: pipelinesLoading } =
    useRdPipelines();
  const { data: owners = [] } = useDealOwners(
    selectedPipelineId !== "all" ? selectedPipelineId : undefined,
  );

  const isPipelineView =
    selectedPipelineId !== "all" &&
    pipelines.some((p) => p.rd_pipeline_id === selectedPipelineId);

  const activeFilters = useMemo(
    () => ({
      stage: !isPipelineView && stageFilter ? stageFilter : undefined,
      rd_stage_id: isPipelineView && stageFilter ? stageFilter : undefined,
      search: search || undefined,
      pipeline:
        selectedPipelineId !== "all" ? selectedPipelineId : undefined,
      owner_name: ownerFilter || undefined,
    }),
    [stageFilter, search, selectedPipelineId, ownerFilter, isPipelineView],
  );

  const {
    data: deals = [],
    isLoading,
    error,
    refetch,
  } = useDeals(activeFilters);

  const updateStage = useUpdateDealStage();
  const updateDeal = useUpdateDeal();

  // ── Selected pipeline data ──────────────────────────────────────────────────
  const selectedPipeline = useMemo(
    () =>
      pipelines.find((p) => p.rd_pipeline_id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId],
  );

  const pipelineStages = useMemo(
    () => selectedPipeline?.stages ?? [],
    [selectedPipeline],
  );

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => computeDealKPIs(deals), [deals]);

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  async function handlePipelineStageDrop(
    dealId: string,
    newStageId: string,
    newStageName: string,
  ) {
    const mappedStage = mapStageToInternal(newStageName);
    updateDeal.mutate({
      id: dealId,
      updates: {
        rd_stage_id: newStageId,
        rd_stage_name: newStageName,
        stage: mappedStage,
      } as never,
    });
  }

  function handlePipelineChange(pipelineId: string) {
    setSelectedPipelineId(pipelineId);
    setStageFilter("");
    setOwnerFilter("");
  }

  if (error) {
    return (
      <RequireRole module="comercial">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  const showPipelineView = selectedPipelineId !== "all" && selectedPipeline;

  return (
    <RequireRole module="comercial">
      <div className="space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comercial</h1>
            <p className="text-sm text-gray-500">
              Pipeline CRM — gestão de deals e funis comerciais.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNew}>
              <IconPlus className="mr-2 h-4 w-4" />
              Novo Deal
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <DealKPICards kpis={kpis} />

        {/* Dados Comerciais Mensais */}
        <DadosComerciaisMensais />

        {/* Pipeline selector tabs */}
        {pipelines.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <IconGitBranch className="h-3.5 w-3.5" />
              <span>Funis</span>
            </div>
            <Tabs
              value={selectedPipelineId}
              onValueChange={handlePipelineChange}
            >
              <TabsList>
                <TabsTrigger value="all">
                  Todos os Funis
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1.5 text-[10px]"
                  >
                    {deals.length}
                  </Badge>
                </TabsTrigger>
                {pipelines.map((p) => (
                  <TabsTrigger
                    key={p.rd_pipeline_id}
                    value={p.rd_pipeline_id}
                  >
                    {p.name}
                    <Badge
                      variant="secondary"
                      className="ml-1.5 h-5 px-1.5 text-[10px]"
                    >
                      {p.deal_count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Filters */}
        <PipelineFilters
          search={search}
          onSearchChange={setSearch}
          stageFilter={stageFilter}
          onStageChange={setStageFilter}
          ownerFilter={ownerFilter}
          onOwnerChange={setOwnerFilter}
          stages={showPipelineView ? pipelineStages : []}
          owners={owners}
        />

        {/* Kanban board */}
        {showPipelineView ? (
          <RdPipelineKanban
            deals={deals}
            stages={pipelineStages}
            isLoading={isLoading || pipelinesLoading}
            onSelect={handleSelect}
            onStageDrop={handlePipelineStageDrop}
          />
        ) : (
          <DealPipeline
            deals={deals}
            isLoading={isLoading}
            onSelect={handleSelect}
            onStageDrop={handleStageDrop}
          />
        )}

        {/* Dialogs */}
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

// ── Helper: map pipeline stage name to internal stage ─────────────────────────

function mapStageToInternal(stageName: string): string {
  const normalized = stageName.toLowerCase().trim();

  const map: Record<string, string> = {
    qualificação: "qualificacao",
    qualificacao: "qualificacao",
    proposta: "proposta",
    negociação: "negociacao",
    negociacao: "negociacao",
    fechamento: "negociacao",
    ganho: "fechado_ganho",
    "fechado ganho": "fechado_ganho",
    perdido: "fechado_perdido",
    "fechado perdido": "fechado_perdido",
    prospecção: "lead",
    prospeccao: "lead",
    "contato inicial": "lead",
  };

  for (const [key, value] of Object.entries(map)) {
    if (normalized.includes(key)) return value;
  }

  return "lead";
}
