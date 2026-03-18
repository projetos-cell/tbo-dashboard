"use client";

import { useState, useMemo } from "react";
import {
  useDeals,
  useUpdateDealStage,
  useRdSyncDeals,
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
import { IconPlus, IconRefresh, IconLoader2, IconGitBranch } from "@tabler/icons-react";
import { toast } from "sonner";
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
  const { data: rdPipelines = [], isLoading: pipelinesLoading } =
    useRdPipelines();
  const { data: owners = [] } = useDealOwners(
    selectedPipelineId !== "all" ? selectedPipelineId : undefined,
  );

  const isRdViewForFilters =
    selectedPipelineId !== "all" &&
    rdPipelines.some((p) => p.rd_pipeline_id === selectedPipelineId);

  const activeFilters = useMemo(
    () => ({
      // In RD view, filter by rd_stage_id; in legacy view, filter by stage
      stage: !isRdViewForFilters && stageFilter ? stageFilter : undefined,
      rd_stage_id: isRdViewForFilters && stageFilter ? stageFilter : undefined,
      search: search || undefined,
      pipeline:
        selectedPipelineId !== "all" ? selectedPipelineId : undefined,
      owner_name: ownerFilter || undefined,
    }),
    [stageFilter, search, selectedPipelineId, ownerFilter, isRdViewForFilters],
  );

  const {
    data: deals = [],
    isLoading,
    error,
    refetch,
  } = useDeals(activeFilters);

  const updateStage = useUpdateDealStage();
  const updateDeal = useUpdateDeal();
  const rdSync = useRdSyncDeals();

  // ── Selected pipeline data ──────────────────────────────────────────────────
  const selectedPipeline = useMemo(
    () =>
      rdPipelines.find((p) => p.rd_pipeline_id === selectedPipelineId) ?? null,
    [rdPipelines, selectedPipelineId],
  );

  const pipelineStages = useMemo(
    () => selectedPipeline?.stages ?? [],
    [selectedPipeline],
  );

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => computeDealKPIs(deals), [deals]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSyncRd() {
    rdSync.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          `Sync RD Station: ${data.created} novos, ${data.updated} atualizados, ${data.pipelines_synced ?? 0} funis`,
        );
      },
      onError: (err) => {
        toast.error(`Erro no sync: ${err.message}`);
      },
    });
  }

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

  // Stage drop for legacy kanban (all pipelines view)
  function handleStageDrop(dealId: string, newStage: string) {
    updateStage.mutate({ id: dealId, stage: newStage });
  }

  // Stage drop for RD pipeline kanban (updates rd_stage_id + rd_stage_name)
  async function handleRdStageDrop(
    dealId: string,
    newStageId: string,
    newStageName: string,
  ) {
    // Map RD stage to our internal stage for compatibility
    const mappedStage = mapRdStageToInternal(newStageName);

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
    // Reset stage filter when switching pipelines
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

  const isRdView = selectedPipelineId !== "all" && selectedPipeline;

  return (
    <RequireRole module="comercial">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comercial</h1>
            <p className="text-sm text-gray-500">
              Pipeline CRM — funis importados do RD Station.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncRd}
              disabled={rdSync.isPending}
            >
              {rdSync.isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="mr-2 h-4 w-4" />
              )}
              Sync RD Station
            </Button>
            <Button onClick={handleNew}>
              <IconPlus className="mr-2 h-4 w-4" />
              Novo Deal
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <DealKPICards kpis={kpis} />

        {/* Dados Comerciais Mensais — editable + RD cross-reference */}
        <DadosComerciaisMensais />

        {/* Pipeline selector tabs */}
        {rdPipelines.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <IconGitBranch className="h-3.5 w-3.5" />
              <span>Funis RD Station</span>
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
                {rdPipelines.map((p) => (
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
        {isRdView ? (
          <PipelineFilters
            search={search}
            onSearchChange={setSearch}
            stageFilter={stageFilter}
            onStageChange={setStageFilter}
            ownerFilter={ownerFilter}
            onOwnerChange={setOwnerFilter}
            stages={pipelineStages}
            owners={owners}
          />
        ) : (
          <PipelineFilters
            search={search}
            onSearchChange={setSearch}
            stageFilter={stageFilter}
            onStageChange={setStageFilter}
            ownerFilter={ownerFilter}
            onOwnerChange={setOwnerFilter}
            stages={[]}
            owners={owners}
          />
        )}

        {/* Kanban board */}
        {isRdView ? (
          <RdPipelineKanban
            deals={deals}
            stages={pipelineStages}
            isLoading={isLoading || pipelinesLoading}
            onSelect={handleSelect}
            onStageDrop={handleRdStageDrop}
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

// ── Helper: map RD stage name to internal stage ─────────────────────────────────

function mapRdStageToInternal(stageName: string): string {
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
