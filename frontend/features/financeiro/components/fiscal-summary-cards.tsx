"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmt } from "@/features/financeiro/lib/formatters";
import type { FiscalSummary } from "@/features/financeiro/services/fiscal-engine";
import {
  IconReceiptTax,
  IconCurrencyDollar,
  IconFileCheck,
  IconPercentage,
} from "@tabler/icons-react";

interface Props {
  summary?: FiscalSummary;
  isLoading?: boolean;
}

interface CardDef {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}

export function FiscalSummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cargaTributaria =
    summary.valor_servicos_total > 0
      ? (summary.valor_total_impostos / summary.valor_servicos_total) * 100
      : 0;

  const cards: CardDef[] = [
    {
      title: "NFs emitidas",
      value: String(summary.total_nfs),
      sub: `${summary.total_autorizadas} autorizadas`,
      icon: IconFileCheck,
      color: "text-blue-600",
    },
    {
      title: "Valor bruto",
      value: fmt(summary.valor_servicos_total),
      sub: `Líquido: ${fmt(summary.valor_liquido_total)}`,
      icon: IconCurrencyDollar,
      color: "text-green-600",
    },
    {
      title: "Total impostos",
      value: fmt(summary.valor_total_impostos),
      sub: `ISS: ${fmt(summary.valor_iss_total)} · PIS/COFINS: ${fmt(summary.valor_pis_total + summary.valor_cofins_total)}`,
      icon: IconReceiptTax,
      color: "text-orange-600",
    },
    {
      title: "Carga tributária",
      value: `${cargaTributaria.toFixed(1)}%`,
      sub: `IR: ${fmt(summary.valor_ir_total)} · CSLL: ${fmt(summary.valor_csll_total)}`,
      icon: IconPercentage,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {c.title}
              </span>
              <c.icon className={`size-4 ${c.color}`} />
            </div>
            <p className="text-xl font-bold tracking-tight">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
