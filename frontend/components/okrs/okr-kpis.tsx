"use client";

import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OkrKpiData {
  total: number;
  avgProgress: number;
  onTrack: number;
  atRisk: number;
  attention: number;
}

interface OkrKpisProps {
  data: OkrKpiData;
}

export function OkrKpis({ data }: OkrKpisProps) {
  const cards = [
    {
      label: "Objetivos",
      value: data.total,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Progresso Médio",
      value: `${Math.round(data.avgProgress)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "No Caminho",
      value: data.onTrack,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Em Risco",
      value: data.atRisk + data.attention,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-muted-foreground text-xs">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
