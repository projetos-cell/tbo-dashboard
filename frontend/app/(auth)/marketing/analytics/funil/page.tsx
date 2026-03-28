"use client";

import { useState } from "react";
import { IconFilter, IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useFunnelData } from "@/features/marketing/hooks/use-marketing-analytics";
import type { FunnelStage } from "@/features/marketing/types/marketing";

// ─── Types ─────────────────────────────────────────────────────────

type Period = "mes_atual" | "30d" | "trimestre";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "30d", label: "Últimos 30d" },
  { value: "trimestre", label: "Trimestre" },
];

// Funnel stage colors (purple gradient from light to dark)
const STAGE_COLORS = [
  "#a78bfa", // purple-400
  "#8b5cf6", // purple-500
  "#7c3aed", // purple-600
  "#6d28d9", // purple-700
  "#5b21b6", // purple-800
  "#4c1d95", // purple-900
];

// ─── Funnel Visualization — #53 ─────────────────────────────────────

function FunnelVisualization({ funnel }: { funnel: FunnelStage[] }) {
  const maxCount = funnel[0]?.count ?? 1;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {funnel.map((stage, idx) => {
        const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 12) : 100;
        const color = STAGE_COLORS[idx % STAGE_COLORS.length];
        const prevCount = stage.previous_count;

        // Comparison indicator — #54
        const delta = prevCount != null ? stage.count - prevCount : null;
        const DeltaIcon =
          delta == null ? null : delta > 0 ? IconArrowUpRight : delta < 0 ? IconArrowDownRight : IconMinus;
        const deltaColor =
          delta == null ? "" : delta > 0 ? "text-green-500" : delta < 0 ? "text-red-500" : "text-muted-foreground";

        return (
          <div
            key={stage.stage}
            className="flex flex-col items-center w-full transition-all duration-300"
          >
            {/* Trapezoid bar */}
            <div
              className="flex items-center justify-between rounded-md px-4 h-10 transition-all duration-500"
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
                clipPath:
                  idx < funnel.length - 1
                    ? `polygon(0 0, 100% 0, calc(100% - ${(100 - Math.max((funnel[idx + 1]?.count ?? 0) / maxCount * 100, 12))}% / 2) 100%, calc(${(100 - Math.max((funnel[idx + 1]?.count ?? 0) / maxCount * 100, 12))}% / 2) 100%)`
                    : undefined,
              }}
            >
              <span className="text-white text-xs font-semibold truncate pr-2">{stage.stage}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white text-sm font-bold">
                  {stage.count.toLocaleString("pt-BR")}
                </span>
                {/* Comparison delta — #54 */}
                {DeltaIcon && delta !== null && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium text-white/80`}>
                    <DeltaIcon className="size-3" />
                    {Math.abs(delta)}
                  </span>
                )}
              </div>
            </div>

            {/* Conversion rate between stages */}
            {idx < funnel.length - 1 && (
              <div className="flex items-center gap-2 py-0.5">
                <div className="h-3 w-px bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">
                  {funnel[idx + 1].conversion_rate.toFixed(1)}% conv.
                  {funnel[idx + 1].previous_conversion_rate != null && (
                    <span className={`ml-1 ${
                      funnel[idx + 1].conversion_rate >= (funnel[idx + 1].previous_conversion_rate ?? 0)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      (vs {funnel[idx + 1].previous_conversion_rate?.toFixed(1)}%)
                    </span>
                  )}
                </span>
                <div className="h-3 w-px bg-muted-foreground/30" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Detailed Table — #55 ───────────────────────────────────────────

function FunnelTable({ funnel }: { funnel: FunnelStage[] }) {
  const fmtCurrency = (v: number) =>
    `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Tabela Detalhada por Etapa</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Etapa</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Volume</th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-medium text-muted-foreground sm:table-cell">vs Anterior</th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-medium text-muted-foreground md:table-cell">Taxa Conv.</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {funnel.map((stage, idx) => {
                const prevCount = stage.previous_count;
                const delta = prevCount != null ? stage.count - prevCount : null;
                const DeltaIcon =
                  delta == null
                    ? null
                    : delta > 0
                      ? IconArrowUpRight
                      : delta < 0
                        ? IconArrowDownRight
                        : IconMinus;
                const deltaColor =
                  delta == null
                    ? "text-muted-foreground"
                    : delta > 0
                      ? "text-green-500"
                      : delta < 0
                        ? "text-red-500"
                        : "text-muted-foreground";

                return (
                  <tr key={stage.stage} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }}
                        />
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {stage.count.toLocaleString("pt-BR")}
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      {DeltaIcon && delta !== null ? (
                        <span className={`flex items-center justify-end gap-1 ${deltaColor}`}>
                          <DeltaIcon className="size-3.5" />
                          {Math.abs(delta).toLocaleString("pt-BR")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-right md:table-cell text-muted-foreground">
                      {idx === 0 ? "—" : `${stage.conversion_rate.toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {fmtCurrency(stage.value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/20">
                <td className="px-4 py-2 text-xs text-muted-foreground" colSpan={3}>
                  {funnel.length} etapas no funil
                </td>
                <td className="hidden px-4 py-2 md:table-cell" />
                <td className="px-4 py-2 text-right text-xs font-medium">
                  {fmtCurrency(funnel.reduce((acc, s) => acc + s.value, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Content ──────────────────────────────────────────────────

function FunilContent() {
  const [period, setPeriod] = useState<Period>("mes_atual");
  const { data: funnel, isLoading, error, refetch } = useFunnelData(period);

  return (
    <div className="space-y-6">
      {/* Header + Period Selector — #54 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funil de Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Conversão por etapa do funil comercial.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
              className="h-7 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* States */}
      {error ? (
        <ErrorState message="Erro ao carregar funil." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 rounded-md mx-auto transition-all"
              style={{ width: `${100 - i * 12}%` }}
            />
          ))}
        </div>
      ) : !funnel || funnel.length === 0 ? (
        <EmptyState
          icon={IconFilter}
          title="Sem dados de funil"
          description="Adicione deals no CRM para visualizar o funil de marketing."
        />
      ) : (
        <>
          {/* Funnel visualization — #53 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visualização do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelVisualization funnel={funnel} />
            </CardContent>
          </Card>

          {/* Detailed table — #55 */}
          <FunnelTable funnel={funnel} />
        </>
      )}
    </div>
  );
}

export default function FunilPage() {
  return (
    <RequireRole module="marketing" minRole="admin">
      <FunilContent />
    </RequireRole>
  );
}
