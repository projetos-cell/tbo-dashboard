"use client";

import {
  IconTrendingUp,
  IconTrendingDown,
  IconReceipt,
  IconReportMoney,
  IconPercentage,
  IconWallet,
} from "@tabler/icons-react";
import type { FounderKPIs } from "@/features/financeiro/services/finance-types";

function fmt(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
}

interface FinanceCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; positive: boolean };
  subtitle?: string;
}

function FinanceCard({ label, value, icon: Icon, iconBg, iconColor, trend, subtitle }: FinanceCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex size-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? <IconTrendingUp className="size-3.5" /> : <IconTrendingDown className="size-3.5" />}
            {Math.abs(trend.value).toFixed(0)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

interface FinanceCardsProps {
  kpis: FounderKPIs;
}

export function FinanceCards({ kpis }: FinanceCardsProps) {
  return (
    <>
      <FinanceCard
        label="Receita MTD"
        value={fmt(kpis.receitaMTD)}
        icon={IconTrendingUp}
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        iconColor="text-emerald-600"
        subtitle={`A receber 30d: ${fmt(kpis.arNext30)}`}
      />
      <FinanceCard
        label="Despesas MTD"
        value={fmt(kpis.despesaMTD)}
        icon={IconReceipt}
        iconBg="bg-red-50 dark:bg-red-950/30"
        iconColor="text-red-500"
        subtitle={`A pagar 30d: ${fmt(kpis.apNext30)}`}
      />
      <FinanceCard
        label="Margem"
        value={`${kpis.margemPct.toFixed(1)}%`}
        icon={IconPercentage}
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        iconColor="text-blue-600"
        trend={{ value: kpis.margemPct, positive: kpis.margemPct > 0 }}
        subtitle={fmt(kpis.margemMTD)}
      />
      <FinanceCard
        label="Saldo"
        value={fmt(kpis.saldoAcumulado)}
        icon={IconWallet}
        iconBg="bg-violet-50 dark:bg-violet-950/30"
        iconColor="text-violet-600"
      />
    </>
  );
}
