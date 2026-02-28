"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, DollarSign, AlertTriangle } from "lucide-react";
import type { ContractKPIs } from "@/services/contracts";

interface ContractKPICardsProps {
  kpis: ContractKPIs;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const cards = [
  { key: "total" as const, label: "Total", icon: FileText, color: "#6b7280", format: "number" },
  { key: "ativos" as const, label: "Ativos", icon: CheckCircle, color: "#22c55e", format: "number" },
  { key: "ativosValue" as const, label: "Valor Ativos", icon: DollarSign, color: "#3b82f6", format: "currency" },
  { key: "expiringSoon" as const, label: "Expirando", icon: AlertTriangle, color: "#f59e0b", format: "number" },
];

export function ContractKPICards({ kpis }: ContractKPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const value = kpis[c.key];
        return (
          <Card key={c.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${c.color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {c.format === "currency" ? formatCurrency(value) : value}
                </p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
