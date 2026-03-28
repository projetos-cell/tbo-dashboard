"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconChartBar,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared";
import { useD3DTimeMetrics } from "@/features/projects/hooks/use-d3d-enhanced";

interface D3DTimeMetricsProps {
  flowId: string;
}

const STAGE_LABEL_MAP: Record<string, string> = {
  "00_briefing": "Briefing",
  "01_research": "Research",
  "02_concept": "Conceito",
  "03_gate_concept": "Gate 1",
  "04_modeling": "Modelagem",
  "05_lighting": "Iluminacao",
  "06_gate_lighting": "Gate 2",
  "07_rendering": "Render",
  "08_gate_render": "Gate 3",
  "09_post": "Pos-Prod.",
  "10_delivery": "Entrega",
};

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 8;
  return `${days.toFixed(1)}d`;
}

interface TooltipPayload {
  value: number;
  payload: {
    stage_key: string;
    estimated_hours: number;
    is_bottleneck: boolean;
  };
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border/60 bg-popover p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-muted-foreground">
        Tempo gasto:{" "}
        <span className="font-medium text-foreground">
          {formatHours(payload[0].value)}
        </span>
      </p>
      {data.estimated_hours > 0 && (
        <p className="text-muted-foreground">
          Estimado:{" "}
          <span className="font-medium text-foreground">
            {formatHours(data.estimated_hours)}
          </span>
        </p>
      )}
      {data.is_bottleneck && (
        <p className="font-medium text-red-500">Gargalo detectado</p>
      )}
    </div>
  );
}

export function D3DTimeMetrics({ flowId }: D3DTimeMetricsProps) {
  const { data: metrics, isLoading } = useD3DTimeMetrics(flowId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || metrics.stages.length === 0) {
    return (
      <EmptyState
        title="Sem dados de tempo"
        description="As metricas de tempo aparecerao conforme o pipeline avanca."
        compact
      />
    );
  }

  const workingStages = metrics.stages.filter((s) => s.time_spent_hours > 0);

  const chartData = metrics.stages.map((s) => ({
    name: STAGE_LABEL_MAP[s.stage_key] ?? s.stage_key,
    stage_key: s.stage_key,
    hours: s.time_spent_hours,
    estimated_hours: s.estimated_days ? s.estimated_days * 8 : 0,
    is_bottleneck: s.stage_id === metrics.bottleneck_stage_id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconChartBar className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Metricas de Tempo</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <IconClock className="mx-auto mb-1.5 size-5 text-muted-foreground" />
            <p className="text-xl font-bold">
              {formatHours(metrics.total_hours)}
            </p>
            <p className="text-xs text-muted-foreground">Tempo total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IconTrendingUp className="mx-auto mb-1.5 size-5 text-muted-foreground" />
            <p className="text-xl font-bold">
              {formatHours(metrics.average_hours)}
            </p>
            <p className="text-xs text-muted-foreground">Media por fase</p>
          </CardContent>
        </Card>
        <Card
          className={
            metrics.bottleneck_stage_id
              ? "border-red-300 dark:border-red-800/60"
              : ""
          }
        >
          <CardContent className="p-4 text-center">
            <IconAlertTriangle
              className={`mx-auto mb-1.5 size-5 ${
                metrics.bottleneck_stage_id
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            />
            {metrics.bottleneck_stage_id ? (
              <>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {STAGE_LABEL_MAP[metrics.bottleneck_stage_key ?? ""] ??
                    metrics.bottleneck_stage_key}
                </p>
                <p className="text-xs text-muted-foreground">Gargalo</p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-green-600">OK</p>
                <p className="text-xs text-muted-foreground">Sem gargalo</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottleneck alert */}
      {metrics.bottleneck_stage_id && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800/50 dark:bg-red-950/20">
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Gargalo detectado:{" "}
              {STAGE_LABEL_MAP[metrics.bottleneck_stage_key ?? ""] ??
                metrics.bottleneck_stage_key}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/70">
              Este stage levou mais de 2x a media do pipeline (
              {formatHours(metrics.average_hours)} por fase).
            </p>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {workingStages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              Tempo por stage
              <Badge variant="outline" className="text-[10px]">
                {workingStages.length} stages com dados
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatHours(v)}
                  className="text-muted-foreground"
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }} />
                {metrics.average_hours > 0 && (
                  <ReferenceLine
                    y={metrics.average_hours}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 2"
                    label={{
                      value: "Media",
                      position: "right",
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                )}
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.is_bottleneck
                          ? "#ef4444"
                          : entry.hours > 0
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted))"
                      }
                      opacity={entry.hours > 0 ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-primary" />
          Tempo gasto
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-red-500" />
          Gargalo (&gt; 2x media)
        </span>
        <span className="flex items-center gap-1">
          <IconInfoCircle className="size-3" />
          1 dia = 8 horas de trabalho
        </span>
      </div>
    </div>
  );
}
