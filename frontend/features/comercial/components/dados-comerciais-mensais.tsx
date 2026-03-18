"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconChartBar,
  IconDeviceFloppy,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCommercialMonthly,
  useRdMonthlySnapshot,
  useUpsertCommercialMonthly,
} from "@/features/comercial/hooks/use-commercial-monthly";
import { computeCommercialKPIs } from "@/features/comercial/services/commercial-monthly";
import { MonthlyDataForm } from "./monthly-data-fields";
import { KpiSimulationPanel } from "./kpi-simulation-panel";

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

// ── Component ────────────────────────────────────────────────────────────────

export function DadosComerciaisMensais() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth);
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: savedData, isLoading } = useCommercialMonthly(yearMonth);
  const { data: rdSnapshot, isLoading: rdLoading, refetch: refetchRd } =
    useRdMonthlySnapshot(yearMonth);
  const upsert = useUpsertCommercialMonthly();

  const [localValues, setLocalValues] = useState<Record<string, number | string>>({});
  const [isDirty, setIsDirty] = useState(false);

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
      setLocalValues({
        reunioes_agendadas: 0, reunioes_realizadas: 0,
        vendas_quantidade: 0, vendas_valor: 0,
        prospeccoes_outbound: 0, leads_inbound: 0,
        produtos_vendidos: "",
      });
      setIsDirty(false);
    }
  }, [savedData, isLoading]);

  const simulationData = useMemo(() => ({
    ...localValues,
    rd_leads_total: rdSnapshot?.rd_leads_total ?? savedData?.rd_leads_total ?? 0,
    rd_deals_won: rdSnapshot?.rd_deals_won ?? savedData?.rd_deals_won ?? 0,
    rd_deals_won_value: rdSnapshot?.rd_deals_won_value ?? savedData?.rd_deals_won_value ?? 0,
    rd_pipeline_value: rdSnapshot?.rd_pipeline_value ?? savedData?.rd_pipeline_value ?? 0,
    rd_conversion_rate: rdSnapshot?.rd_conversion_rate ?? savedData?.rd_conversion_rate ?? 0,
  }), [localValues, rdSnapshot, savedData]);

  const kpis = useMemo(
    () => computeCommercialKPIs(simulationData as never),
    [simulationData],
  );

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
    (delta: number) => setYearMonth((prev) => shiftMonth(prev, delta)),
    [],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-64" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 min-w-0 w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <IconChartBar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Dados Comerciais</CardTitle>
              <p className="text-xs text-muted-foreground">A preencher mensalmente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border bg-muted/50">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMonthChange(-1)}>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-1 text-sm font-medium capitalize text-center whitespace-nowrap">
                {formatMonth(yearMonth)}
              </span>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => handleMonthChange(1)}
                disabled={yearMonth >= getCurrentYearMonth()}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!isDirty && !!savedData} className="gap-1.5">
              {upsert.isPending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconDeviceFloppy className="h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-amber-600">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-xs">Para fechar o ciclo de análise, precisamos destes dados todo mês:</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <MonthlyDataForm values={localValues} onFieldChange={handleFieldChange} />

        <p className="text-[11px] text-muted-foreground italic">
          Ao consolidar esses dados junto às métricas de marketing, será possível
          calcular: CPL, taxa de conversão, ROI por canal e tendência de crescimento.
        </p>

        <KpiSimulationPanel
          kpis={kpis}
          isDirty={isDirty}
          rdLoading={rdLoading}
          onRefreshRd={() => refetchRd()}
          simulationData={{
            rd_leads_total: Number(simulationData.rd_leads_total),
            rd_deals_won: Number(simulationData.rd_deals_won),
            rd_deals_won_value: Number(simulationData.rd_deals_won_value),
            rd_pipeline_value: Number(simulationData.rd_pipeline_value),
            rd_conversion_rate: Number(simulationData.rd_conversion_rate),
          }}
        />
      </CardContent>
    </Card>
  );
}
