"use client";

import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFounderKPIs, useFinanceSnapshots } from "@/hooks/use-finance";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Receipt,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FinanceiroFounderPage() {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  useEffect(() => {
    if (role && !hasMinRole(role, "diretoria")) {
      router.replace("/financeiro");
    }
  }, [role, router]);

  const { data: kpis, isLoading, error } = useFounderKPIs();
  const { data: snapshots } = useFinanceSnapshots(30);

  if (!role || !hasMinRole(role, "diretoria")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-muted-foreground">Erro ao carregar KPIs financeiros.</p>
        <p className="text-sm text-muted-foreground/70">{(error as Error).message}</p>
      </div>
    );
  }

  const k = kpis!;
  const margemPositive = k.margemMTD >= 0;

  // Mini sparkline data from snapshots
  const sparkData = (snapshots ?? []).slice(-14);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visao Estrategica</h1>
        <p className="text-muted-foreground">
          KPIs financeiros consolidados para diretoria.
        </p>
      </div>

      {/* KPI Cards — 2 rows of 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Receita MTD */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Receita MTD</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(k.receitaMTD)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Receitas pagas no mes</p>
        </div>

        {/* Despesa MTD */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Despesa MTD</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(k.despesaMTD)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Despesas pagas no mes</p>
        </div>

        {/* Margem MTD */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Margem MTD</span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                margemPositive ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}
            >
              <BarChart3
                className={`h-4 w-4 ${
                  margemPositive ? "text-emerald-500" : "text-red-500"
                }`}
              />
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              margemPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(k.margemMTD)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Margem: {formatPct(k.margemPct)}
          </p>
        </div>

        {/* AP prox 30d */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">A Pagar (30d)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
              <CreditCard className="h-4 w-4 text-orange-500" />
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(k.apNext30)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contas a pagar pendentes
          </p>
        </div>

        {/* AR prox 30d */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">A Receber (30d)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
              <Receipt className="h-4 w-4 text-blue-500" />
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(k.arNext30)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contas a receber pendentes
          </p>
        </div>

        {/* Saldo Acumulado */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Saldo Acumulado</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
              <Wallet className="h-4 w-4 text-violet-500" />
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              k.saldoAcumulado >= 0
                ? "text-violet-600 dark:text-violet-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(k.saldoAcumulado)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Ultimo snapshot diario</p>
        </div>
      </div>

      {/* Cash Flow Mini Chart */}
      {sparkData.length > 1 && (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Fluxo de Caixa (14 dias)</h2>
              <p className="text-xs text-muted-foreground">Receitas vs Despesas diarias</p>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end gap-1 h-24">
            {sparkData.map((s, i) => {
              const maxVal = Math.max(
                ...sparkData.map((d) => Math.max(d.total_receitas, d.total_despesas, 1))
              );
              const recH = (s.total_receitas / maxVal) * 100;
              const despH = (s.total_despesas / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex items-end gap-px" title={s.snapshot_date}>
                  <div
                    className="flex-1 bg-emerald-500/60 rounded-t-sm min-h-[2px]"
                    style={{ height: `${Math.max(recH, 2)}%` }}
                  />
                  <div
                    className="flex-1 bg-red-500/60 rounded-t-sm min-h-[2px]"
                    style={{ height: `${Math.max(despH, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500/60" /> Receitas
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500/60" /> Despesas
            </span>
          </div>
        </div>
      )}

      {/* Rankings — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Center Ranking */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Top 5 Centros de Custo (Despesas MTD)</h2>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </div>
          {k.costCenterRanking.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum dado disponivel no periodo.
            </p>
          ) : (
            <div className="space-y-3">
              {k.costCenterRanking.map((cc, i) => {
                const maxCC = k.costCenterRanking[0]?.total || 1;
                const pct = (cc.total / maxCC) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                          {i + 1}.
                        </span>
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {cc.name}
                        </span>
                        <span className="text-xs text-muted-foreground">({cc.code})</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {formatCurrencyFull(cc.total)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/50 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Ranking */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Top 5 Categorias (Despesas MTD)</h2>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          {k.categoryRanking.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum dado disponivel no periodo.
            </p>
          ) : (
            <div className="space-y-3">
              {k.categoryRanking.map((cat, i) => {
                const maxCat = k.categoryRanking[0]?.total || 1;
                const pct = (cat.total / maxCat) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                          {i + 1}.
                        </span>
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {formatCurrencyFull(cat.total)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500/50 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Net Position Summary */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Posicao Liquida (prox. 30 dias)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">A Receber</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(k.arNext30)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">A Pagar</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(k.apNext30)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Saldo Liquido Previsto</p>
            <p
              className={`text-lg font-bold ${
                k.arNext30 - k.apNext30 >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(k.arNext30 - k.apNext30)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
