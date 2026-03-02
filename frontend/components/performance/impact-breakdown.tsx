"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImpactMetricCard } from "./impact-metric-card";
import { ScoreBadge } from "./score-badge";
import { IMPACT_METRICS } from "@/lib/performance-constants";
import { useImpactMetrics } from "@/hooks/use-impact-metrics";
import { useComputeImpact } from "@/hooks/use-impact-metrics";
import { Calculator, RefreshCw, Loader2 } from "lucide-react";
import type { ImpactMetricRow } from "@/services/impact-metrics";

interface ImpactBreakdownProps {
  employeeId: string;
  employeeName: string;
  period: string;
}

export function ImpactBreakdown({
  employeeId,
  employeeName,
  period,
}: ImpactBreakdownProps) {
  const { data: impactRow, isLoading } = useImpactMetrics(employeeId, period);
  const computeMutation = useComputeImpact();

  function handleCompute() {
    computeMutation.mutate({
      employeeId,
      period,
      employeeName,
    });
  }

  // Get metric value from the impact row
  function getMetricValue(
    metricId: string,
    row: ImpactMetricRow | null | undefined
  ): { normalized: number | null; raw: number | null } {
    if (!row) return { normalized: null, raw: null };

    const rawData = (row.raw_data ?? {}) as Record<
      string,
      { raw: number | null; normalized: number | null; available: boolean }
    >;

    const metricData = rawData[metricId];

    // Use the stored column value for normalized score
    const colMap: Record<string, keyof ImpactMetricRow> = {
      on_time_delivery: "on_time_delivery",
      rework_rate: "rework_rate",
      project_margin: "project_margin",
      okr_completion: "okr_completion",
      decision_participation: "decision_participation",
      recognitions_received: "recognitions_received",
    };

    const col = colMap[metricId];
    const normalized = col ? (row[col] as number | null) : null;
    const raw = metricData?.raw ?? null;

    return { normalized, raw };
  }

  const isComputing = computeMutation.isPending;
  const hasData = !!impactRow;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            Impact (45%)
            {hasData && (
              <ScoreBadge score={impactRow?.impact_score ?? null} size="sm" />
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCompute}
            disabled={isComputing}
          >
            {isComputing ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : hasData ? (
              <RefreshCw className="mr-1 h-3 w-3" />
            ) : (
              <Calculator className="mr-1 h-3 w-3" />
            )}
            {isComputing
              ? "Calculando..."
              : hasData
                ? "Recalcular"
                : "Calcular"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-muted/40"
              />
            ))}
          </div>
        ) : !hasData ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Metricas de impacto nao calculadas.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em &quot;Calcular&quot; para gerar.
            </p>
          </div>
        ) : (
          <>
            {/* Score composto */}
            <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Score Composto
              </span>
              <span className="text-lg font-bold">
                {impactRow?.impact_score?.toFixed(1) ?? "—"}
              </span>
            </div>

            <Separator />

            {/* Individual metrics */}
            <div className="space-y-3">
              {IMPACT_METRICS.map((m) => {
                const { normalized, raw } = getMetricValue(m.id, impactRow);
                return (
                  <ImpactMetricCard
                    key={m.id}
                    metricId={m.id}
                    normalizedScore={normalized}
                    rawValue={raw}
                    available={m.available}
                  />
                );
              })}
            </div>

            {/* Computed at timestamp */}
            {impactRow?.computed_at && (
              <p className="text-[10px] text-muted-foreground text-right">
                Calculado em{" "}
                {new Date(impactRow.computed_at).toLocaleString("pt-BR")}
              </p>
            )}
          </>
        )}

        {/* Error state */}
        {computeMutation.isError && (
          <p className="text-xs text-red-600">
            Erro ao calcular:{" "}
            {(computeMutation.error as Error)?.message ?? "Erro desconhecido"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
