"use client";

// ── ConciliacaoSummaryCards ────────────────────────────────────────────────────
// KPIs de conciliação: saldo bancário, saldo contábil, diferença, % conciliado.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReconciliationSummary } from "@/lib/supabase/types/bank-reconciliation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";
import {
  IconBuildingBank,
  IconReceiptTax,
  IconScale,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface ConciliacaoSummaryCardsProps {
  summary: ReconciliationSummary | undefined;
  isLoading: boolean;
  /**
   * Saldo bancário real vindo de finance_bank_accounts.balance (import OFX).
   * Quando null, fallback para summary.balance (soma de transações).
   */
  actualBankBalance?: number | null;
  /** Saldo contábil (soma dos lançamentos internos não cancelados) */
  ledgerBalance?: number;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
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
            <p className={`text-xl font-bold ${valueClass ?? "text-foreground"}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ConciliacaoSummaryCards({
  summary,
  isLoading,
  actualBankBalance,
  ledgerBalance = 0,
}: ConciliacaoSummaryCardsProps) {
  // Prefer real balance from finance_bank_accounts; fallback to computed sum
  const bankBalance = actualBankBalance ?? summary?.balance ?? 0;
  const bankBalanceSource = actualBankBalance != null ? "Atualizado via extrato OFX" : "Calculado por transações";
  const diff = bankBalance - ledgerBalance;
  const pct = summary?.reconciledPct ?? 0;

  const diffClass =
    Math.abs(diff) < 0.01
      ? "text-emerald-600"
      : diff > 0
      ? "text-amber-600"
      : "text-red-600";

  const pctClass = pct >= 90 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Saldo Bancário"
        value={fmt(bankBalance)}
        sub={summary
          ? `${summary.reconciled} conciliados de ${summary.total} · ${bankBalanceSource}`
          : bankBalanceSource}
        icon={<IconBuildingBank className="size-3.5" />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Saldo Contábil"
        value={fmt(ledgerBalance)}
        sub="Lançamentos internos"
        icon={<IconReceiptTax className="size-3.5" />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Diferença"
        value={fmt(diff)}
        sub={Math.abs(diff) < 0.01 ? "Saldos conferem" : diff > 0 ? "Banco acima do contábil" : "Contábil acima do banco"}
        icon={<IconScale className="size-3.5" />}
        valueClass={diffClass}
        isLoading={isLoading}
      />
      <KpiCard
        label="% Conciliado"
        value={fmtPct(pct)}
        sub={summary ? `${summary.pending} transações pendentes` : undefined}
        icon={<IconCircleCheckFilled className="size-3.5" />}
        valueClass={pctClass}
        isLoading={isLoading}
      />
    </div>
  );
}
