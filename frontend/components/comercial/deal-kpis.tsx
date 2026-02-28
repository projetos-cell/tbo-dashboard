"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

interface DealKPIs {
  total: number;
  active: number;
  won: number;
  lost: number;
  pipelineValue: number;
  wonValue: number;
  forecast: number;
  conversionRate: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealKPICards({ kpis }: { kpis: DealKPIs }) {
  const items = [
    {
      label: "Pipeline Ativo",
      value: formatCurrency(kpis.pipelineValue),
      sub: `${kpis.active} deals abertos`,
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      label: "Forecast Ponderado",
      value: formatCurrency(kpis.forecast),
      sub: "valor × probabilidade",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Ganhos",
      value: formatCurrency(kpis.wonValue),
      sub: `${kpis.won} deals fechados`,
      icon: Target,
      color: "text-green-600",
    },
    {
      label: "Conversão",
      value: kpis.conversionRate > 0 ? `${kpis.conversionRate.toFixed(1)}%` : "—",
      sub: `${kpis.won + kpis.lost} encerrados`,
      icon: BarChart3,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
