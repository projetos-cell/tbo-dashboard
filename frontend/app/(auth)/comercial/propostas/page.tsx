"use client";

import { useState, useMemo } from "react";
import { useDeals, useUpdateDealStage } from "@/features/comercial/hooks/use-commercial";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconPlus,
  IconSearch,
  IconFileDescription,
  IconCalendar,
  IconBuilding,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const PROPOSAL_STAGES: DealStageKey[] = ["proposta", "negociacao"];

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ProbabilityBar({ value }: { value: number }) {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function ComercialPropostas() {
  const [stageTab, setStageTab] = useState<DealStageKey | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);

  const updateStage = useUpdateDealStage();
  const { data: allDeals = [], isLoading, error, refetch } = useDeals();

  const proposals = useMemo(() => {
    let list = allDeals.filter((d) => PROPOSAL_STAGES.includes(d.stage as DealStageKey));
    if (stageTab !== "all") list = list.filter((d) => d.stage === stageTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.company?.toLowerCase().includes(q) ||
          d.contact?.toLowerCase().includes(q) ||
          d.owner_name?.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [allDeals, stageTab, search]);

  const kpis = useMemo(() => {
    const base = allDeals.filter((d) => PROPOSAL_STAGES.includes(d.stage as DealStageKey));
    const total = base.length;
    const totalValue = base.reduce((s, d) => s + (d.value ?? 0), 0);
    const weighted = base.reduce((s, d) => s + (d.value ?? 0) * ((d.probability ?? 50) / 100), 0);
    return { total, totalValue, weighted };
  }, [allDeals]);

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

  function handleMarkGanho(deal: DealRow, e: React.MouseEvent) {
    e.stopPropagation();
    updateStage.mutate(
      { id: deal.id, stage: "fechado_ganho" },
      { onSuccess: () => toast.success(`"${deal.name}" marcado como Fechado Ganho 🎉`) },
    );
  }

  function handleMarkPerdido(deal: DealRow, e: React.MouseEvent) {
    e.stopPropagation();
    updateStage.mutate(
      { id: deal.id, stage: "fechado_perdido" },
      { onSuccess: () => toast.error(`"${deal.name}" marcado como Fechado Perdido`) },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propostas</h1>
          <p className="text-muted-foreground text-sm">Criação e acompanhamento de propostas comerciais.</p>
        </div>
        <Button onClick={handleNew}>
          <IconPlus className="mr-1 h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Propostas abertas" value={String(kpis.total)} />
        <KPICard label="Valor total em aberto" value={formatCurrency(kpis.totalValue)} />
        <KPICard
          label="Receita ponderada"
          value={formatCurrency(kpis.weighted)}
          sub="valor × probabilidade"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={stageTab} onValueChange={(v) => setStageTab(v as DealStageKey | "all")}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            {PROPOSAL_STAGES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {DEAL_STAGES[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message="Não foi possível carregar as propostas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={IconFileDescription}
          title={search || stageTab !== "all" ? "Nenhuma proposta encontrada" : "Nenhuma proposta em aberto"}
          description={
            search || stageTab !== "all"
              ? "Tente ajustar os filtros."
              : "Quando leads avançarem no pipeline, as propostas aparecerão aqui."
          }
          cta={!search && stageTab === "all" ? { label: "Nova Proposta", onClick: handleNew } : undefined}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Proposta</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Probabilidade</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground xl:table-cell">Previsão</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Etapa</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proposals.map((deal) => {
                const stage = DEAL_STAGES[deal.stage as DealStageKey];
                return (
                  <tr
                    key={deal.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => handleSelect(deal)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{deal.name}</div>
                      {deal.owner_name && (
                        <div className="text-xs text-muted-foreground">{deal.owner_name}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {deal.company && <IconBuilding className="h-3.5 w-3.5 shrink-0" />}
                        <span>{deal.company ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {deal.value != null ? formatCurrency(deal.value) : "—"}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell w-36">
                      {deal.probability != null ? (
                        <ProbabilityBar value={deal.probability} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell text-muted-foreground">
                      {deal.expected_close ? (
                        <div className="flex items-center gap-1">
                          <IconCalendar className="h-3.5 w-3.5" />
                          {new Date(deal.expected_close).toLocaleDateString("pt-BR")}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {stage ? (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: stage.bg, color: stage.color }}
                        >
                          {stage.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{deal.stage}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-green-600 hover:bg-green-50 hover:text-green-700"
                          title="Marcar como ganho"
                          onClick={(e) => handleMarkGanho(deal, e)}
                          disabled={updateStage.isPending}
                        >
                          <IconCheck className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                          title="Marcar como perdido"
                          onClick={(e) => handleMarkPerdido(deal, e)}
                          disabled={updateStage.isPending}
                        >
                          <IconX className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {proposals.length} {proposals.length === 1 ? "proposta" : "propostas"} — valor total:{" "}
            <strong>{formatCurrency(proposals.reduce((s, d) => s + (d.value ?? 0), 0))}</strong>
          </div>
        </div>
      )}

      <DealDetailDialog
        deal={selectedDeal}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedDeal(null);
        }}
        onEdit={handleEdit}
      />

      <DealFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDeal(null);
        }}
        deal={editingDeal}
      />
    </div>
  );
}
