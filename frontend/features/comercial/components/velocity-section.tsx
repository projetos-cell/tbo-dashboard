"use client";

import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { VelocitySummary, AgingDeal } from "@/features/comercial/lib/pipeline-velocity";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconGauge, IconClock } from "@tabler/icons-react";

interface VelocitySectionProps {
  velocity: VelocitySummary;
  agingDeals: AgingDeal[];
}

export function VelocitySection({ velocity, agingDeals }: VelocitySectionProps) {
  const maxDays = Math.max(...velocity.stages.map((s) => s.avgDays), 1);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <IconGauge className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Sales Velocity</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(velocity.salesVelocity)}</p>
            <p className="text-[10px] text-muted-foreground">por dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <IconClock className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Ciclo Medio</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{velocity.avgCycleDays.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <IconClock className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Deals Envelhecidos</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{agingDeals.length}</p>
            <p className="text-[10px] text-muted-foreground">&gt;2x tempo medio</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage velocity bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tempo Medio por Estagio</CardTitle>
          <p className="text-xs text-muted-foreground">Dias que deals passam em cada estagio antes de avancar</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {velocity.stages.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 shrink-0">{stage.label}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                    style={{
                      width: `${Math.max((stage.avgDays / maxDays) * 100, 8)}%`,
                      backgroundColor: stage.color,
                      opacity: 0.75,
                    }}
                  >
                    {stage.avgDays > 0 && (
                      <span className="text-[10px] font-medium text-white drop-shadow-sm">
                        {stage.avgDays.toFixed(1)}d
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 w-10 text-right shrink-0">{stage.dealCount} deals</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aging deals table */}
      {agingDeals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deals Envelhecidos</CardTitle>
            <p className="text-xs text-muted-foreground">Deals que excedem 2x o tempo medio do estagio</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agingDeals.slice(0, 10).map(({ deal, daysInStage, avgForStage, ratio }) => {
                const stageConfig = DEAL_STAGES[deal.stage as DealStageKey];
                return (
                  <div key={deal.id} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stageConfig?.color ?? "#6b7280" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      <p className="text-[11px] text-gray-500">{deal.company} · {stageConfig?.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-red-500">{daysInStage}d</p>
                      <p className="text-[10px] text-gray-400">media: {avgForStage.toFixed(0)}d ({ratio.toFixed(1)}x)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
