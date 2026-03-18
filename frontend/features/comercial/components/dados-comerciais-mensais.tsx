"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconChartBar,
  IconDeviceFloppy,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconLoader2,
  IconAlertTriangle,
  IconTrendingUp,
  IconTarget,
  IconUsers,
  IconPhone,
  IconMail,
  IconCurrencyDollar,
  IconBuildingStore,
  IconCalendar,
  IconPercentage,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCommercialMonthly,
  useRdMonthlySnapshot,
  useUpsertCommercialMonthly,
} from "@/features/comercial/hooks/use-commercial-monthly";
import {
  computeCommercialKPIs,
  type ComputedCommercialKPIs,
} from "@/features/comercial/services/commercial-monthly";
import { formatCurrency } from "@/features/comercial/lib/format-currency";

// ── Month helpers ────────────────────────────────────────────────────────────

function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(yearMonth: string, delta: number) {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(yearMonth: string) {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// ── Types ────────────────────────────────────────────────────────────────────

interface EditableField {
  key: string;
  label: string;
  unit: string;
  icon: typeof IconChartBar;
  type: "number" | "currency" | "text";
  color: string;
}

const FIELDS: EditableField[] = [
  {
    key: "reunioes_agendadas",
    label: "Total de reuniões agendadas no mês",
    unit: "reuniões",
    icon: IconCalendar,
    type: "number",
    color: "text-blue-500",
  },
  {
    key: "reunioes_realizadas",
    label: "Total de reuniões realizadas no mês",
    unit: "reuniões",
    icon: IconUsers,
    type: "number",
    color: "text-blue-500",
  },
  {
    key: "vendas_quantidade",
    label: "Total de vendas — quantidade",
    unit: "contratos",
    icon: IconTarget,
    type: "number",
    color: "text-green-500",
  },
  {
    key: "vendas_valor",
    label: "Total de vendas — valor monetário",
    unit: "R$",
    icon: IconCurrencyDollar,
    type: "currency",
    color: "text-green-500",
  },
  {
    key: "prospeccoes_outbound",
    label: "Prospecções frias (outbound)",
    unit: "contatos",
    icon: IconPhone,
    type: "number",
    color: "text-orange-500",
  },
  {
    key: "leads_inbound",
    label: "Leads inbound (orgânicos — conteúdo TBO e sócios)",
    unit: "leads",
    icon: IconMail,
    type: "number",
    color: "text-purple-500",
  },
  {
    key: "produtos_vendidos",
    label: "Produtos/empreendimentos vendidos no mês",
    unit: "",
    icon: IconBuildingStore,
    type: "text",
    color: "text-amber-500",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function DadosComerciaisMensais() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth);
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  // ── Data fetching
  const {
    data: savedData,
    isLoading,
  } = useCommercialMonthly(yearMonth);

  const {
    data: rdSnapshot,
    isLoading: rdLoading,
    refetch: refetchRd,
  } = useRdMonthlySnapshot(yearMonth);

  const upsert = useUpsertCommercialMonthly();

  // ── Local editable state (for simulation)
  const [localValues, setLocalValues] = useState<Record<string, number | string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Sync from server when data loads
  useEffect(() => {
    if (savedData) {
      setLocalValues({
        reunioes_agendadas: savedData.reunioes_agendadas ?? 0,
        reunioes_realizadas: savedData.reunioes_realizadas ?? 0,
        vendas_quantidade: savedData.vendas_quantidade ?? 0,
        vendas_valor: savedData.vendas_valor ?? 0,
        prospeccoes_outbound: savedData.prospeccoes_outbound ?? 0,
        leads_inbound: savedData.leads_inbound ?? 0,
        produtos_vendidos: savedData.produtos_vendidos ?? "",
      });
      setIsDirty(false);
    } else if (!isLoading) {
      // No data yet for this month — defaults
      setLocalValues({
        reunioes_agendadas: 0,
        reunioes_realizadas: 0,
        vendas_quantidade: 0,
        vendas_valor: 0,
        prospeccoes_outbound: 0,
        leads_inbound: 0,
        produtos_vendidos: "",
      });
      setIsDirty(false);
    }
  }, [savedData, isLoading]);

  // ── Build simulation object merging local values + RD snapshot
  const simulationData = useMemo(() => {
    return {
      ...localValues,
      rd_leads_total: rdSnapshot?.rd_leads_total ?? savedData?.rd_leads_total ?? 0,
      rd_deals_won: rdSnapshot?.rd_deals_won ?? savedData?.rd_deals_won ?? 0,
      rd_deals_won_value: rdSnapshot?.rd_deals_won_value ?? savedData?.rd_deals_won_value ?? 0,
      rd_pipeline_value: rdSnapshot?.rd_pipeline_value ?? savedData?.rd_pipeline_value ?? 0,
      rd_conversion_rate: rdSnapshot?.rd_conversion_rate ?? savedData?.rd_conversion_rate ?? 0,
    };
  }, [localValues, rdSnapshot, savedData]);

  // ── Computed KPIs (update in real-time as user edits)
  const kpis = useMemo(
    () => computeCommercialKPIs(simulationData as never),
    [simulationData],
  );

  // ── Handlers
  const handleFieldChange = useCallback(
    (key: string, value: string, type: "number" | "currency" | "text") => {
      setIsDirty(true);
      if (type === "text") {
        setLocalValues((prev) => ({ ...prev, [key]: value }));
      } else {
        const num = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        setLocalValues((prev) => ({ ...prev, [key]: num }));
      }
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!tenantId) return;

    upsert.mutate({
      tenant_id: tenantId,
      year_month: yearMonth,
      reunioes_agendadas: Number(localValues.reunioes_agendadas) || 0,
      reunioes_realizadas: Number(localValues.reunioes_realizadas) || 0,
      vendas_quantidade: Number(localValues.vendas_quantidade) || 0,
      vendas_valor: Number(localValues.vendas_valor) || 0,
      prospeccoes_outbound: Number(localValues.prospeccoes_outbound) || 0,
      leads_inbound: Number(localValues.leads_inbound) || 0,
      produtos_vendidos: String(localValues.produtos_vendidos ?? ""),
      // Snapshot RD data at save time
      rd_leads_total: rdSnapshot?.rd_leads_total ?? 0,
      rd_deals_won: rdSnapshot?.rd_deals_won ?? 0,
      rd_deals_won_value: rdSnapshot?.rd_deals_won_value ?? 0,
      rd_pipeline_value: rdSnapshot?.rd_pipeline_value ?? 0,
      rd_conversion_rate: rdSnapshot?.rd_conversion_rate ?? 0,
      updated_by: userId ?? null,
    } as never);

    setIsDirty(false);
  }, [tenantId, yearMonth, localValues, rdSnapshot, userId, upsert]);

  const handleMonthChange = useCallback(
    (delta: number) => {
      setYearMonth((prev) => shiftMonth(prev, delta));
    },
    [],
  );

  // ── Render
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <IconChartBar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Dados Comerciais</CardTitle>
              <p className="text-xs text-muted-foreground">
                A preencher mensalmente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Month navigator */}
            <div className="flex items-center rounded-lg border bg-muted/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMonthChange(-1)}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-1 text-sm font-medium capitalize text-center whitespace-nowrap">
                {formatMonth(yearMonth)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMonthChange(1)}
                disabled={yearMonth >= getCurrentYearMonth()}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Save */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty && !!savedData}
              className="gap-1.5"
            >
              {upsert.isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        {/* Alert banner */}
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-amber-600">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-xs">
            Para fechar o ciclo de análise, precisamos destes dados todo mês:
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Editable fields ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          {FIELDS.map((field, idx) => (
            <EditableRow
              key={field.key}
              index={idx + 1}
              field={field}
              value={localValues[field.key] ?? (field.type === "text" ? "" : 0)}
              onChange={(val) => handleFieldChange(field.key, val, field.type)}
            />
          ))}
        </div>

        {/* ── Note ────────────────────────────────────────────────────────── */}
        <p className="text-[11px] text-muted-foreground italic">
          Ao consolidar esses dados junto às métricas de marketing, será possível
          calcular: CPL, taxa de conversão, ROI por canal e tendência de crescimento.
        </p>

        {/* ── Computed KPIs (real-time simulation) ────────────────────────── */}
        <div className="space-y-3">
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
                    onClick={() => refetchRd()}
                    disabled={rdLoading}
                  >
                    {rdLoading ? (
                      <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconRefresh className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atualizar dados do RD Station</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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

          {/* RD Station cross-reference */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                RD Station
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
                value={formatCurrency(Number(simulationData.rd_deals_won_value))}
                loading={rdLoading}
              />
              <RdMetric
                label="Conversão RD"
                value={`${Number(simulationData.rd_conversion_rate).toFixed(1)}%`}
                loading={rdLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function EditableRow({
  index,
  field,
  value,
  onChange,
}: {
  index: number;
  field: EditableField;
  value: number | string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-muted/50 overflow-hidden">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[11px] font-bold text-primary">
        {String(index).padStart(2, "0")}
      </span>
      <field.icon className={`h-4 w-4 shrink-0 ${field.color}`} />
      <span className="flex-1 text-sm truncate min-w-0">{field.label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Input
          inputMode={field.type === "text" ? "text" : "decimal"}
          className="h-7 w-24 text-right text-sm font-medium tabular-nums"
          value={
            field.type === "currency" && typeof value === "number" && value > 0
              ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              : value === 0
                ? ""
                : String(value)
          }
          placeholder={field.type === "currency" ? "0,00" : field.type === "number" ? "0" : ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.unit && (
          <span className="text-[11px] text-muted-foreground w-14 text-right whitespace-nowrap">
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

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
