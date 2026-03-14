"use client";

import { useMemo, useState } from "react";
import { useDeals } from "@/features/comercial/hooks/use-commercial";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconActivity,
  IconCircleFilled,
} from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

type PeriodFilter = "7d" | "30d" | "90d" | "all";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function groupByDate(deals: DealRow[]): { label: string; items: DealRow[] }[] {
  const groups = new Map<string, DealRow[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const deal of deals) {
    const d = new Date(deal.updated_at ?? deal.created_at ?? "");
    d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Hoje";
    else if (d.getTime() === yesterday.getTime()) label = "Ontem";
    else label = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(deal);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export default function ComercialAtividades() {
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);

  const { data: deals = [], isLoading, error, refetch } = useDeals();

  const filtered = useMemo(() => {
    const cutoff = period === "all" ? null : new Date(Date.now() - { "7d": 7, "30d": 30, "90d": 90 }[period] * 86_400_000);
    return deals
      .filter((d) => {
        if (!cutoff) return true;
        const date = new Date(d.updated_at ?? d.created_at ?? "");
        return date >= cutoff;
      })
      .sort((a, b) => {
        const aDate = new Date(a.updated_at ?? a.created_at ?? "").getTime();
        const bDate = new Date(b.updated_at ?? b.created_at ?? "").getTime();
        return bDate - aDate;
      });
  }, [deals, period]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  function handleSelect(deal: DealRow) {
    setSelectedDeal(deal);
    setDetailOpen(true);
  }

  function handleEdit(deal: DealRow) {
    setDetailOpen(false);
    setEditingDeal(deal);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground text-sm">Registro de movimentações no pipeline comercial.</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message="Não foi possível carregar as atividades." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 3 }).map((__, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconActivity}
          title="Nenhuma atividade neste período"
          description="Movimentações de deals aparecerão aqui conforme o pipeline evolui."
          cta={{
            label: "Ampliar período",
            onClick: () => setPeriod("all"),
          }}
        />
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </h3>
              <div className="relative space-y-px pl-5">
                {/* vertical line */}
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                {items.map((deal) => {
                  const stage = DEAL_STAGES[deal.stage as DealStageKey];
                  return (
                    <button
                      key={deal.id}
                      className="relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/40"
                      onClick={() => handleSelect(deal)}
                    >
                      {/* dot */}
                      <IconCircleFilled
                        className="absolute -left-3.5 top-3.5 h-2 w-2 shrink-0"
                        style={{ color: stage?.color ?? "#6b7280" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{deal.name}</span>
                          {stage && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] shrink-0"
                              style={{ backgroundColor: stage.bg, color: stage.color }}
                            >
                              {stage.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {deal.company && <span>{deal.company}</span>}
                          {deal.company && deal.owner_name && <span>·</span>}
                          {deal.owner_name && <span>{deal.owner_name}</span>}
                          {deal.value != null && (
                            <>
                              <span>·</span>
                              <span className="font-medium">{formatCurrency(deal.value)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {relativeTime(deal.updated_at ?? deal.created_at ?? "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-center text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "atividade" : "atividades"} no período
          </p>
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
