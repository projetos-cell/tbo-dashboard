"use client";

import type { BoletoSummary } from "@/lib/supabase/types/boletos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconFileInvoice,
  IconCircleCheckFilled,
  IconAlertTriangle,
  IconCurrencyReal,
} from "@tabler/icons-react";
import { fmt } from "@/features/financeiro/lib/formatters";

interface Props {
  summary: BoletoSummary | undefined;
  isLoading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  valueClass?: string;
  isLoading: boolean;
}

function KpiCard({ label, value, sub, icon, valueClass, isLoading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-28 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold tabular-nums ${valueClass ?? ""}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function BoletosSummaryCards({ summary, isLoading }: Props) {
  const cards: KpiCardProps[] = [
    {
      label: "Emitidos",
      value: String(summary?.totalEmitidos ?? 0),
      sub: fmt(summary?.valorEmitidos ?? 0),
      icon: <IconFileInvoice className="size-3.5" />,
      isLoading,
    },
    {
      label: "Pagos",
      value: String(summary?.totalPagos ?? 0),
      sub: fmt(summary?.valorPagos ?? 0),
      icon: <IconCircleCheckFilled className="size-3.5 text-green-500" />,
      valueClass: "text-green-600",
      isLoading,
    },
    {
      label: "Vencidos",
      value: String(summary?.totalVencidos ?? 0),
      sub: fmt(summary?.valorVencidos ?? 0),
      icon: <IconAlertTriangle className="size-3.5 text-red-500" />,
      valueClass: summary?.totalVencidos ? "text-red-600" : undefined,
      isLoading,
    },
    {
      label: "Receita paga",
      value: fmt(summary?.valorPagos ?? 0),
      sub: `${summary?.totalCancelados ?? 0} cancelados`,
      icon: <IconCurrencyReal className="size-3.5 text-blue-500" />,
      isLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
