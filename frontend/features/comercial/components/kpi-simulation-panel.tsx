"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconChartBar,
  IconRefresh,
  IconLoader2,
  IconTrendingUp,
  IconTarget,
  IconCurrencyDollar,
  IconPercentage,
} from "@tabler/icons-react";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { ComputedCommercialKPIs } from "@/features/comercial/services/commercial-monthly";

// ── KPICard ──────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof IconChartBar;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[11px] text-muted-foreground truncate">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

// ── RdMetric ─────────────────────────────────────────────────────────────────

function RdMetric({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      )}
    </div>
  );
}

// ── KpiSimulationPanel ───────────────────────────────────────────────────────

interface KpiSimulationPanelProps {
  kpis: ComputedCommercialKPIs;
  isDirty: boolean;
  rdLoading: boolean;
  onRefreshRd: () => void;
  simulationData: {
    rd_leads_total: number;
    rd_deals_won: number;
    rd_deals_won_value: number;
    rd_pipeline_value: number;
    rd_conversion_rate: number;
  };
}

export function KpiSimulationPanel({
  kpis,
  isDirty,
  rdLoading,
  onRefreshRd,
  simulationData,
}: KpiSimulationPanelProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <IconTrendingUp className="h-4 w-4 text-blue-500" />
          Indicadores Calculados
          {isDirty && (
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
              simulação
            </Badge>
          )}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRefreshRd}
                disabled={rdLoading}
              >
                {rdLoading ? (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconRefresh className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Atualizar dados comerciais</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPICard
          label="Taxa de Realização"
          value={`${kpis.taxaRealizacao.toFixed(1)}%`}
          sub="reuniões realizadas / agendadas"
          icon={IconPercentage}
          color="text-blue-600"
        />
        <KPICard
          label="Conversão Reunião → Venda"
          value={`${kpis.taxaConversaoReuniao.toFixed(1)}%`}
          sub="vendas / reuniões realizadas"
          icon={IconTarget}
          color="text-green-600"
        />
        <KPICard
          label="Ticket Médio"
          value={kpis.ticketMedio > 0 ? formatCurrency(kpis.ticketMedio) : "—"}
          sub="valor / quantidade de vendas"
          icon={IconCurrencyDollar}
          color="text-emerald-600"
        />
        <KPICard
          label="Conversão Lead → Venda"
          value={`${kpis.taxaConversaoLead.toFixed(1)}%`}
          sub={`${kpis.totalLeads} leads totais`}
          icon={IconTrendingUp}
          color="text-purple-600"
        />
      </div>

      {/* CRM cross-reference */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            CRM
          </Badge>
          <span className="text-xs text-muted-foreground">
            Dados cruzados automaticamente
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <RdMetric
            label="Leads no Pipeline"
            value={simulationData.rd_leads_total}
            loading={rdLoading}
          />
          <RdMetric
            label="Deals Ganhos"
            value={simulationData.rd_deals_won}
            loading={rdLoading}
          />
          <RdMetric
            label="Valor Ganho"
            value={formatCurrency(simulationData.rd_deals_won_value)}
            loading={rdLoading}
          />
          <RdMetric
            label="Conversão RD"
            value={`${simulationData.rd_conversion_rate.toFixed(1)}%`}
            loading={rdLoading}
          />
        </div>
      </div>
    </div>
  );
}
