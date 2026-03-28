"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useDeals,
  useUpdateDealStage,
  usePipelines as useDealPipelines,
  useRdPipelines,
  useDealOwners,
  useUpdateDeal,
  useCrmStages,
} from "@/features/comercial/hooks/use-commercial";
import { DealKPICards } from "@/features/comercial/components/deal-kpis";
import { RdPipelineKanban } from "@/features/comercial/components/rd-pipeline-kanban";
import { DealPipeline } from "@/features/comercial/components/deal-pipeline";
import { PipelineFilters } from "@/features/comercial/components/pipeline-filters";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import { BulkActionBar } from "@/features/comercial/components/bulk-action-bar";
import { computeDealKPIs } from "@/features/comercial/services/commercial";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconGitBranch, IconCheckbox } from "@tabler/icons-react";
import { toast } from "sonner";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { DealWonDrawer } from "@/components/layout/deal-won-drawer";
import { useDealWonAutomation } from "@/features/comercial/hooks/use-deal-won-automation";
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

  // ── Deal Won automation ─────────────────────────────────────────────────────
  const [wonDrawerOpen, setWonDrawerOpen] = useState(false);
  const [wonDealId, setWonDealId] = useState<string | null>(null);
  const dealWonAutomation = useDealWonAutomation();

  // ── Bulk selection ──────────────────────────────────────────────────────────
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleBulkToggle = useCallback((dealId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(dealId);
      else next.delete(dealId);
      return next;
    });
  }, []);

  const handleBulkClear = useCallback(() => {
    setSelectedIds(new Set());
    setBulkMode(false);
  }, []);

  // ── Global shortcuts ────────────────────────────────────────────────────────
  useGlobalShortcuts();

  // Cmd+K → focus search input (inside PipelineFilters)
  useEffect(() => {
    function onOpenSearch() {
      const input = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Buscar"]',
      );
      input?.focus();
    }
    window.addEventListener("tbo:open-search", onOpenSearch);
    return () => window.removeEventListener("tbo:open-search", onOpenSearch);
  }, []);

  // "n" key (no modifiers, not in input) → open new deal form
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "n" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      handleNew();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { data: pipelines = [], isLoading: pipelinesLoading } =
    useRdPipelines();
  const { data: owners = [] } = useDealOwners(
    selectedPipelineId !== "all" ? selectedPipelineId : undefined,
  );
  const { data: crmStages } = useCrmStages();

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

  const stageDistribution = useMemo(() => {
    const stages = Object.keys(DEAL_STAGES) as DealStageKey[];
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((s, d) => s + (d.value ?? 0), 0),
      };
    });
  }, [deals]);

  // ── Quick edit handler ──────────────────────────────────────────────────────
  function handleQuickUpdate(dealId: string, field: string, value: unknown) {
    if (field === "stage") {
      updateStage.mutate({ id: dealId, stage: value as string });
    } else {
      updateDeal.mutate({ id: dealId, updates: { [field]: value } as never });
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSelect(deal: DealRow) {
    if (bulkMode) {
      handleBulkToggle(deal.id, !selectedIds.has(deal.id));
      return;
    }
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

    if (newStage === "fechado_ganho") {
      const deal = deals.find((d) => d.id === dealId);
      if (deal) {
        dealWonAutomation.mutate({ deal });
        setWonDealId(dealId);
        setWonDrawerOpen(true);
      }
    } else {
      toast("Deal movido", {
        description: "Ctrl+Z para desfazer",
        duration: 3000,
      });
    }
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

    if (mappedStage === "fechado_ganho") {
      const deal = deals.find((d) => d.id === dealId);
      if (deal) {
        dealWonAutomation.mutate({ deal });
        setWonDealId(dealId);
        setWonDrawerOpen(true);
      }
    } else {
      toast("Deal movido", {
        description: "Ctrl+Z para desfazer",
        duration: 3000,
      });
    }
  }

  function handlePipelineChange(pipelineId: string) {
    setSelectedPipelineId(pipelineId);
    setStageFilter("");
    setOwnerFilter("");
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────
  function handleBulkMoveToStage(stage: DealStageKey) {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      updateStage.mutate({ id, stage });
    }
    toast.success(`${ids.length} deal${ids.length > 1 ? "s" : ""} movido${ids.length > 1 ? "s" : ""} para ${stage}`);
    handleBulkClear();
  }

  function handleBulkAssignOwner(ownerName: string) {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      updateDeal.mutate({ id, updates: { owner_name: ownerName } as never });
    }
    toast.success(`${ids.length} deal${ids.length > 1 ? "s" : ""} atribuído${ids.length > 1 ? "s" : ""} a ${ownerName}`);
    handleBulkClear();
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
            <Button
              variant={bulkMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
              className="gap-1.5"
            >
              <IconCheckbox className="h-4 w-4" />
              {bulkMode ? "Cancelar seleção" : "Selecionar"}
            </Button>
            <Button onClick={handleNew}>
              <IconPlus className="mr-2 h-4 w-4" />
              Novo Deal
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <DealKPICards kpis={kpis} distribution={stageDistribution} />

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
            bulkMode={bulkMode}
            selectedIds={selectedIds}
            onBulkToggle={handleBulkToggle}
            onQuickUpdate={handleQuickUpdate}
            onCreateDeal={handleNew}
          />
        ) : (
          <DealPipeline
            deals={deals}
            isLoading={isLoading}
            onSelect={handleSelect}
            onStageDrop={handleStageDrop}
            bulkMode={bulkMode}
            selectedIds={selectedIds}
            onBulkToggle={handleBulkToggle}
            onQuickUpdate={handleQuickUpdate}
            customStages={crmStages}
            onCreateDeal={handleNew}
          />
        )}

        {/* Bulk action bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onMoveToStage={handleBulkMoveToStage}
          onAssignOwner={handleBulkAssignOwner}
          onClear={handleBulkClear}
          owners={owners}
        />

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

        {/* Deal Won celebration + automation feedback */}
        <DealWonDrawer
          open={wonDrawerOpen}
          onOpenChange={setWonDrawerOpen}
          dealId={wonDealId}
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
