"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CultureMetricCard } from "./culture-metric-card";
import { ScoreBadge } from "./score-badge";
import { CULTURE_METRICS } from "@/lib/performance-constants";
import { useCultureMetrics } from "@/hooks/use-culture-metrics";
import { useComputeCulture } from "@/hooks/use-culture-metrics";
import { Calculator, RefreshCw, Loader2 } from "lucide-react";
import type { CultureMetricRow } from "@/services/culture-metrics";

interface CultureBreakdownProps {
  employeeId: string;
  employeeName: string;
  period: string;
}

export function CultureBreakdown({
  employeeId,
  employeeName,
  period,
}: CultureBreakdownProps) {
  const { data: cultureRow, isLoading } = useCultureMetrics(employeeId, period);
  const computeMutation = useComputeCulture();

  function handleCompute() {
    computeMutation.mutate({
      employeeId,
      period,
    });
  }

  // Get metric value from the culture row
  function getMetricValue(
    metricId: string,
    row: CultureMetricRow | null | undefined
  ): { normalized: number | null; raw: number | null } {
    if (!row) return { normalized: null, raw: null };

    const rawData = (row.raw_data ?? {}) as Record<
      string,
      { raw: number | null; normalized: number | null; available: boolean }
    >;

    const metricData = rawData[metricId];

    // Use the stored column value for normalized score
    const colMap: Record<string, keyof CultureMetricRow> = {
      values_alignment: "values_alignment",
      feedback_engagement: "feedback_engagement",
      feedback_given: "feedback_given",
      one_on_one_participation: "one_on_one_participation",
      collaboration_index: "collaboration_index",
      peer_review_score: "peer_review_score",
    };

    const col = colMap[metricId];
    const normalized = col ? (row[col] as number | null) : null;
    const raw = metricData?.raw ?? null;

    return { normalized, raw };
  }

  const isComputing = computeMutation.isPending;
  const hasData = !!cultureRow;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            Culture (20%)
            {hasData && (
              <ScoreBadge score={cultureRow?.culture_score ?? null} size="sm" />
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
              Metricas de cultura nao calculadas.
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
                {cultureRow?.culture_score?.toFixed(1) ?? "—"}
              </span>
            </div>

            <Separator />

            {/* Individual metrics */}
            <div className="space-y-3">
              {CULTURE_METRICS.map((m) => {
                const { normalized, raw } = getMetricValue(m.id, cultureRow);
                return (
                  <CultureMetricCard
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
            {cultureRow?.computed_at && (
              <p className="text-[10px] text-muted-foreground text-right">
                Calculado em{" "}
                {new Date(cultureRow.computed_at).toLocaleString("pt-BR")}
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
