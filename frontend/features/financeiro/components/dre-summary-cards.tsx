"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fmt, fmtPct } from "../lib/formatters";
import type { DRESummary } from "../services/finance-accounting";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DRESummaryCardsProps {
  summary: DRESummary | null | undefined;
  isLoading?: boolean;
}

function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const positive = pct >= 0;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-medium gap-0.5",
        positive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400" : "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"
      )}
    >
      {positive ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
      {positive ? "+" : ""}{pct.toFixed(1)}% vs meta
    </Badge>
  );
}

export function DRESummaryCards({ summary, isLoading }: DRESummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Receita Bruta",
      value: summary?.receitaBruta ?? 0,
      sub: summary?.vsMetaReceita !== null && summary?.vsMetaReceita !== undefined
        ? <DeltaBadge pct={summary.vsMetaReceita} />
        : <span className="text-xs text-muted-foreground">Receita total do período</span>,
      icon: <IconCurrencyDollar className="size-4 text-emerald-500" />,
      positive: true,
    },
    {
      label: "Receita Líquida",
      value: summary?.receitaLiquida ?? 0,
      sub: <span className="text-xs text-muted-foreground">Após deduções e impostos</span>,
      icon: <IconCurrencyDollar className="size-4 text-blue-500" />,
      positive: (summary?.receitaLiquida ?? 0) >= 0,
    },
    {
      label: "EBITDA",
      value: summary?.ebitda ?? 0,
      sub: (
        <span className={cn("text-xs font-medium", (summary?.ebitdaMargin ?? 0) >= 0 ? "text-emerald-600" : "text-red-600")}>
          {fmtPct(summary?.ebitdaMargin ?? 0)} margem
          {summary?.vsMetaEbitda !== null && summary?.vsMetaEbitda !== undefined && (
            <> · <DeltaBadge pct={summary.vsMetaEbitda} /></>
          )}
        </span>
      ),
      icon: <IconTarget className="size-4 text-violet-500" />,
      positive: (summary?.ebitda ?? 0) >= 0,
    },
    {
      label: "Lucro Líquido",
      value: summary?.lucroLiquido ?? 0,
      sub: (
        <span className={cn("text-xs font-medium", (summary?.lucroMargin ?? 0) >= 0 ? "text-emerald-600" : "text-red-600")}>
          {fmtPct(summary?.lucroMargin ?? 0)} margem líquida
        </span>
      ),
      icon: (summary?.lucroLiquido ?? 0) >= 0
        ? <IconTrendingUp className="size-4 text-emerald-500" />
        : <IconTrendingDown className="size-4 text-red-500" />,
      positive: (summary?.lucroLiquido ?? 0) >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              {card.icon}
            </div>
            <div className={cn("text-xl font-bold tabular-nums", card.positive ? "" : "text-red-600")}>
              {fmt(card.value)}
            </div>
            <div className="mt-1">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
