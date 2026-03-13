"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  IconFileText,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import type { TabKPIs } from "@/features/contratos/services/contracts";

interface ContractKPICardsProps {
  kpis: TabKPIs;
  tab: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface KPICardDef {
  label: string;
  value: number | string;
  icon: typeof IconFileText;
  color: string;
  isCurrency: boolean;
}

function getCardsForTab(kpis: TabKPIs, tab: string): KPICardDef[] {
  const isCurrencyField = (label: string) =>
    label.includes("Receita") || label.includes("Custo");

  const iconMap: Record<string, typeof IconFileText> = {
    "Total Contratos": IconFileText,
    "Total Terceirizados": IconFileText,
    "Total Colaboradores": IconFileText,
    Ativos: IconCircleCheck,
    "Receita Ativa": IconTrendingUp,
    "Receita Mensal": IconTrendingUp,
    "Custo Ativo": IconTrendingDown,
    "Custo Mensal": IconTrendingDown,
    "Alertas Vencimento": IconAlertTriangle,
  };

  const colorMap: Record<string, string> = {
    "Total Contratos": "#6b7280",
    "Total Terceirizados": "#6b7280",
    "Total Colaboradores": "#6b7280",
    Ativos: "#22c55e",
    "Receita Ativa": "#f97316",
    "Receita Mensal": "#f97316",
    "Custo Ativo": "#3b82f6",
    "Custo Mensal": "#3b82f6",
    "Alertas Vencimento": "#f59e0b",
  };

  const labels = [kpis.label1, kpis.label2, kpis.label3, kpis.label4];
  const values = [kpis.value1, kpis.value2, kpis.value3, kpis.value4];

  return labels.map((label, i) => ({
    label,
    value: values[i],
    icon: iconMap[label] ?? IconFileText,
    color: colorMap[label] ?? "#6b7280",
    isCurrency: isCurrencyField(label),
  }));
}

export function ContractKPICards({ kpis, tab }: ContractKPICardsProps) {
  const cards = getCardsForTab(kpis, tab);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className="border-border/50 transition-shadow hover:shadow-sm"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}14` }}
              >
                <Icon className="h-5 w-5" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight">
                  {c.isCurrency
                    ? formatCurrency(c.value as number)
                    : c.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {c.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
