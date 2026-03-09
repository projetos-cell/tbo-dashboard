"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import type { PerformanceKPIs } from "@/features/performance/services/performance";

// ---------------------------------------------------------------------------
// Performance KPI Cards
// ---------------------------------------------------------------------------

interface PerformanceKPICardsProps {
  kpis: PerformanceKPIs;
  isLoading: boolean;
}

export function PerformanceKPICards({ kpis, isLoading }: PerformanceKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-gray-100/40" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Score Médio",
      value: kpis.avgScore.toFixed(1),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Avaliados",
      value: kpis.totalEvaluated.toString(),
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      title: "Elite + Alta",
      value: `${kpis.eliteCount + kpis.highCount}`,
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      sub: `${kpis.eliteCount} elite, ${kpis.highCount} alta`,
    },
    {
      title: "Atenção",
      value: kpis.attentionCount.toString(),
      icon: AlertTriangle,
      color: kpis.attentionCount > 0 ? "text-red-600" : "text-gray-500",
      bg: kpis.attentionCount > 0
        ? "bg-red-50 dark:bg-red-950/30"
        : "bg-gray-100/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{c.title}</p>
              <p className="text-xl font-bold">{c.value}</p>
              {c.sub && (
                <p className="text-[10px] text-gray-500">{c.sub}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Trend summary mini-card */}
      {(kpis.monthTrend.up > 0 || kpis.monthTrend.down > 0) && (
        <Card className="col-span-2 md:col-span-4">
          <CardContent className="flex items-center gap-6 p-3">
            <span className="text-xs font-medium text-gray-500">Tendência do Período:</span>
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUp className="h-3 w-3" /> {kpis.monthTrend.up} subindo
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Minus className="h-3 w-3" /> {kpis.monthTrend.stable} estável
            </span>
            <span className="flex items-center gap-1 text-xs text-red-600">
              <ArrowDown className="h-3 w-3" /> {kpis.monthTrend.down} caindo
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
