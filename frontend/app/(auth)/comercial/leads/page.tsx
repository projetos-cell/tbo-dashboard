"use client";

import { useState, useMemo } from "react";
import {
  CommercialPeriodFilter,
  filterByPeriod,
  type CommercialPeriodValue,
} from "@/features/comercial/components/period-filter-comercial";
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
  IconUsers,
  IconCurrencyDollar,
  IconArrowRight,
  IconBuilding,
} from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const LEAD_STAGES: DealStageKey[] = ["lead", "qualificacao"];

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function ComercialLeads() {
  const [stageTab, setStageTab] = useState<DealStageKey | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);

  const [period, setPeriod] = useState<CommercialPeriodValue>({ preset: "all" });
  const updateStage = useUpdateDealStage();

  const { data: rawLeads = [], isLoading, error, refetch } = useDeals();
  const allLeads = filterByPeriod(rawLeads, period);

  // Filter to lead stages on client (avoids multiple queries)
  const leads = useMemo(() => {
    let list = allLeads.filter((d) => LEAD_STAGES.includes(d.stage as DealStageKey));
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
    return list;
  }, [allLeads, stageTab, search]);

  const kpis = useMemo(() => {
    const base = allLeads.filter((d) => LEAD_STAGES.includes(d.stage as DealStageKey));
    const total = base.length;
    const totalValue = base.reduce((s, d) => s + (d.value ?? 0), 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    return { total, totalValue, avgValue };
  }, [allLeads]);

  function handleSelect(deal: DealRow) {
    setSelectedDeal(deal);
    setDetailOpen(true);
  }

  function handleEdit(deal: DealRow) {
    setDetailOpen(false);
    setEditingDeal(deal);
    setFormOpen(true);
  }

  function handleNewLead() {
    setEditingDeal(null);
    setFormOpen(true);
  }

  function handleAdvanceStage(deal: DealRow, e: React.MouseEvent) {
    e.stopPropagation();
    const nextStage = deal.stage === "lead" ? "qualificacao" : "proposta";
    const nextLabel = DEAL_STAGES[nextStage as DealStageKey]?.label ?? nextStage;
    updateStage.mutate(
      { id: deal.id, stage: nextStage },
      { onSuccess: () => toast.success(`"${deal.name}" movido para ${nextLabel}`) },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm">Gestão e qualificação de leads comerciais.</p>
        </div>
        <div className="flex items-center gap-2">
          <CommercialPeriodFilter value={period} onChange={setPeriod} />
          <Button onClick={handleNewLead}>
            <IconPlus className="mr-1 h-4 w-4" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Total de leads" value={String(kpis.total)} />
        <KPICard label="Valor em pipeline" value={formatCurrency(kpis.totalValue)} />
        <KPICard label="Ticket médio" value={formatCurrency(kpis.avgValue)} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={stageTab} onValueChange={(v) => setStageTab(v as DealStageKey | "all")}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {LEAD_STAGES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {DEAL_STAGES[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message="Não foi possível carregar os leads." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title={search || stageTab !== "all" ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
          description={
            search || stageTab !== "all"
              ? "Tente ajustar os filtros."
              : "Clique em 'Novo Lead' para começar o pipeline comercial."
          }
          cta={
            !search && stageTab === "all"
              ? { label: "Novo Lead", onClick: handleNewLead }
              : undefined
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lead</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Empresa</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Responsável</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Etapa</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((deal) => {
                const stage = DEAL_STAGES[deal.stage as DealStageKey];
                const canAdvance = deal.stage !== "qualificacao";
                return (
                  <tr
                    key={deal.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => handleSelect(deal)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{deal.name}</div>
                      {deal.contact && (
                        <div className="text-xs text-muted-foreground">{deal.contact}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {deal.company && <IconBuilding className="h-3.5 w-3.5 shrink-0" />}
                        <span>{deal.company ?? "—"}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {deal.owner_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {deal.value != null ? formatCurrency(deal.value) : "—"}
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
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={(e) => handleAdvanceStage(deal, e)}
                        disabled={updateStage.isPending}
                      >
                        {canAdvance ? "Qualificar" : "Proposta"}
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
            {stageTab !== "all" && ` em ${DEAL_STAGES[stageTab as DealStageKey]?.label}`}
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
