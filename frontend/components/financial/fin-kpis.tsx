"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { FinancialKPIs } from "@/services/financial";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface FinKPIsProps {
  kpis: FinancialKPIs;
}

export function FinKPICards({ kpis }: FinKPIsProps) {
  const cards = [
    {
      label: "A Pagar (aberto)",
      value: fmt(kpis.totalPayable),
      icon: ArrowDownCircle,
      iconColor: "text-red-500",
      sub: `${kpis.countPayable} contas`,
    },
    {
      label: "A Receber (aberto)",
      value: fmt(kpis.totalReceivable),
      icon: ArrowUpCircle,
      iconColor: "text-green-500",
      sub: `${kpis.countReceivable} contas`,
    },
    {
      label: "Resultado Líquido",
      value: fmt(kpis.totalReceived - kpis.totalPaid),
      icon: TrendingUp,
      iconColor:
        kpis.totalReceived - kpis.totalPaid >= 0
          ? "text-green-500"
          : "text-red-500",
      sub: `Recebido ${fmt(kpis.totalReceived)} · Pago ${fmt(kpis.totalPaid)}`,
    },
    {
      label: "Vencido",
      value: fmt(kpis.overdue),
      icon: AlertTriangle,
      iconColor: kpis.overdue > 0 ? "text-red-500" : "text-muted-foreground",
      sub: "inadimplência total",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <c.icon className={`h-8 w-8 shrink-0 ${c.iconColor}`} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold truncate">{c.value}</p>
              <p className="text-xs text-muted-foreground truncate">{c.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
