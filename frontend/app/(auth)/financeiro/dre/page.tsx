"use client";

import { useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import { buildDRELines } from "@/features/financeiro/services/finance-accounting";
import { toast } from "sonner";
import { DRESummaryCards } from "@/features/financeiro/components/dre-summary-cards";
import { DRETable } from "@/features/financeiro/components/dre-table";
import dynamic from "next/dynamic";

const DRETrendChart = dynamic(
  () => import("@/features/financeiro/components/dre-trend-chart").then((m) => ({ default: m.DRETrendChart })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-muted" /> }
);
import {
  useDRESnapshot,
  useDRESummary,
  useDRETrend,
  useComputeDRE,
} from "@/features/financeiro/hooks/use-accounting";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

// ── Content ───────────────────────────────────────────────────────────────────

function DREContent() {
  const [month, setMonth] = useState(getCurrentMonth);
  const today = getCurrentMonth();
  const isFuture = month > today;

  const { data: snapshot, isLoading: snapLoading, isError: snapError } = useDRESnapshot(month);
  const { data: summary, isLoading: sumLoading } = useDRESummary(month);
  const { data: trend, isLoading: trendLoading } = useDRETrend(12);
  const { mutate: computeDRE, isPending: computing } = useComputeDRE();

  function handleExportCSV() {
    if (!snapshot) return;
    const lines = buildDRELines(snapshot);
    const BOM = "\uFEFF";
    const header = "Linha;Valor (R$)";
    const fmtValue = (v: number) =>
      v.toFixed(2).replace(".", ",");
    const rows = lines.map((l) => `"${l.label}";${fmtValue(l.value)}`);
    const csv = BOM + header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dre_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCompute() {
    computeDRE(month, {
      onSuccess: () => toast.success(`DRE de ${formatMonthLabel(month)} calculado com sucesso.`),
      onError: (e) => toast.error(`Erro ao calcular DRE: ${e.message}`),
    });
  }

  const isLoading = snapLoading || sumLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            DRE — Demonstração do Resultado
          </h1>
          <p className="text-sm text-muted-foreground">
            Estrutura completa de receitas, custos, despesas e resultado líquido.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {snapshot && (
            <Button onClick={handleExportCSV} size="sm" variant="outline">
              <IconDownload className="size-3.5 mr-1.5" />
              Exportar CSV
            </Button>
          )}
          <Button
            onClick={handleCompute}
            disabled={computing || isFuture}
            size="sm"
            variant="outline"
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${computing ? "animate-spin" : ""}`} />
            {computing ? "Calculando…" : "Calcular DRE"}
          </Button>
        </div>
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          aria-label="Mês anterior"
        >
          <IconChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold min-w-[160px] text-center">
            {formatMonthLabel(month)}
          </span>
          {snapshot && (
            <Badge variant="secondary" className="text-xs">
              {snapshot.source === "computed" ? "Calculado" : snapshot.source}
            </Badge>
          )}
          {!snapshot && !isLoading && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Sem dados
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={isFuture}
          aria-label="Próximo mês"
        >
          <IconChevronRight className="size-4" />
        </Button>
      </div>

      {/* Error banner */}
      {snapError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <IconAlertCircle className="size-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Erro ao carregar dados do DRE
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Clique em &quot;Calcular DRE&quot; para gerar os dados ou tente novamente.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI cards */}
      <DRESummaryCards summary={summary} isLoading={isLoading} />

      {/* Trend chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Evolução — Receita, EBITDA e Lucro Líquido (12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DRETrendChart data={trend} isLoading={trendLoading} />
        </CardContent>
      </Card>

      {/* DRE structured table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Demonstração do Resultado — {formatMonthLabel(month)}
            </CardTitle>
            {snapshot?.computed_at && (
              <span className="text-xs text-muted-foreground">
                Calculado em{" "}
                {new Date(snapshot.computed_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DRETable snapshot={snapshot} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Empty state CTA */}
      {!snapshot && !isLoading && !snapError && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Nenhum DRE calculado para {formatMonthLabel(month)}.
          </p>
          <Button onClick={handleCompute} disabled={computing || isFuture} size="sm">
            <IconRefresh className={`size-3.5 mr-1.5 ${computing ? "animate-spin" : ""}`} />
            Gerar DRE agora
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DREPage() {
  return (
    <RBACGuard minRole="diretoria">
      <DREContent />
    </RBACGuard>
  );
}
