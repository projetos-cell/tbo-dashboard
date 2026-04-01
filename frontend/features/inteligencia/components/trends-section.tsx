"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconTrendingUp,
  IconArrowRight,
} from "@tabler/icons-react";
import { useIntelligenceTrends } from "@/hooks/use-intelligence";
import { ErrorState } from "@/components/shared";
import type { TrendItem } from "@/services/intelligence";

const SEVERITY_CONFIG = {
  critical: {
    icon: IconAlertCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-200 dark:border-red-900",
    labelClass: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: IconAlertTriangle,
    iconClass: "text-yellow-500",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-200 dark:border-yellow-900",
    labelClass: "text-yellow-600 dark:text-yellow-400",
  },
  ok: {
    icon: IconCircleCheck,
    iconClass: "text-green-500",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-200 dark:border-green-900",
    labelClass: "text-green-600 dark:text-green-400",
  },
  info: {
    icon: IconInfoCircle,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-200 dark:border-blue-900",
    labelClass: "text-blue-600 dark:text-blue-400",
  },
};

function TrendCard({ trend }: { trend: TrendItem }) {
  const cfg = SEVERITY_CONFIG[trend.severity];
  const Icon = cfg.icon;

  return (
    <Link href={trend.href} className="block group">
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 transition-shadow group-hover:shadow-sm ${cfg.borderClass}`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bgClass}`}
        >
          <Icon className={`h-5 w-5 ${cfg.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{trend.label}</p>
            <span className={`text-sm font-semibold tabular-nums ${cfg.labelClass}`}>
              {trend.value}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {trend.detail}
          </p>
        </div>
        <IconArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-0.5" />
      </div>
    </Link>
  );
}

function TrendsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrendsSection() {
  const { data, isLoading, error, refetch } = useIntelligenceTrends();

  const criticalOrWarning =
    data?.trends.filter((t) =>
      t.severity === "critical" || t.severity === "warning"
    ) ?? [];
  const others =
    data?.trends.filter((t) =>
      t.severity !== "critical" && t.severity !== "warning"
    ) ?? [];

  // Sort: critical first, then warning, then the rest
  const sorted = [...criticalOrWarning, ...others];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <IconTrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-base">Trends & Anomalias</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Desvios e sinais detectados nos módulos
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <TrendsSkeleton />}

        {error && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}

        {!isLoading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <IconCircleCheck className="h-8 w-8 text-green-500/60 mb-2" />
            <p className="text-sm font-medium">Nenhuma anomalia detectada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os indicadores estão dentro do esperado.
            </p>
          </div>
        )}

        {!isLoading && !error && sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
