"use client";

import React from "react";
import {
  IconCurrencyDollar,
  IconFileText,
  IconTrendingUp,
  IconTag,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconBolt,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { fmtPct } from "./comercial-chart-utils";
import type {
  CommercialKPIs,
  StrategicInsight,
} from "@/features/comercial/services/commercial-analytics";

// ── KPI Cards ──────────────────────────────────────────────────────────────────

export function KpiRow({ kpis }: { kpis: CommercialKPIs }) {
  const items = [
    {
      label: "Faturamento Total",
      value: formatCurrency(kpis.totalBilled),
      sub: `${kpis.wonDeals} deals ganhos`,
      icon: IconCurrencyDollar,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Orcado",
      value: formatCurrency(kpis.totalQuoted),
      sub: `${kpis.totalDeals} propostas`,
      icon: IconFileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Taxa de Conversao",
      value: kpis.conversionRate > 0 ? fmtPct(kpis.conversionRate) : "--",
      sub: `${kpis.wonDeals}/${kpis.wonDeals + kpis.lostDeals} fechados`,
      icon: IconTrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Ticket Medio",
      value: kpis.avgTicket > 0 ? formatCurrency(kpis.avgTicket) : "--",
      sub: "por deal ganho",
      icon: IconTag,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight">
                {item.value}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                {item.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Strategic Insights Section ─────────────────────────────────────────────────

const INSIGHT_STYLES: Record<
  StrategicInsight["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  success: { icon: IconCircleCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  warning: { icon: IconAlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  info: { icon: IconInfoCircle, color: "text-blue-600", bg: "bg-blue-50" },
  opportunity: { icon: IconBolt, color: "text-purple-600", bg: "bg-purple-50" },
};

export function InsightsSection({ insights }: { insights: StrategicInsight[] }) {
  if (!insights.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Dados insuficientes para gerar insights.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight, i) => {
        const style = INSIGHT_STYLES[insight.type];
        const Icon = style.icon;
        return (
          <div key={i} className="flex gap-3 rounded-lg border p-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{insight.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
