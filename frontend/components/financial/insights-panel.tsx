"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Target,
} from "lucide-react";
import type { FinancialInsight } from "@/services/financial";

interface InsightsPanelProps {
  insights: FinancialInsight[];
}

const iconMap: Record<FinancialInsight["icon"], React.ElementType> = {
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  users: Users,
  clock: Clock,
  target: Target,
};

const severityStyles: Record<FinancialInsight["severity"], { border: string; icon: string; bg: string }> = {
  danger: {
    border: "border-l-red-500",
    icon: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
  },
  warning: {
    border: "border-l-yellow-500",
    icon: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  info: {
    border: "border-l-blue-500",
    icon: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  success: {
    border: "border-l-green-500",
    icon: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum insight disponivel no momento. Adicione dados financeiros para gerar analises.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm font-semibold mb-3">Insights Automaticos</p>
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon];
          const style = severityStyles[insight.severity];
          return (
            <div
              key={insight.id}
              className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${style.border} ${style.bg}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
              <p className="text-sm">{insight.message}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
