"use client";

import { Users, Receipt, Cog, UserMinus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { KpiCard } from "@/features/founder-dashboard/components/kpi-card";
import { KpiGrid } from "@/features/founder-dashboard/components/kpi-grid";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";

interface Props {
  d: FounderDashboardSnapshot | undefined;
  isLoading: boolean;
  errMsg: string | null;
  onRetry: () => void;
}

export function OperationalIndicatorsSection({
  d,
  isLoading,
  errMsg,
  onRetry,
}: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Indicadores Operacionais
      </h2>
      <KpiGrid columns={4}>
        <KpiCard
          title="Receita / Colaborador"
          value={d ? fmt(d.receitaPorColaborador) : "—"}
          sublabel={d ? `${d.headcount} colaboradores ativos` : undefined}
          icon={<Users className="h-4 w-4 text-indigo-500" />}
          colorClass="text-indigo-600 dark:text-indigo-400"
          tooltip={{
            description:
              "Receita total dividida pelo número de colaboradores ativos.",
            formula: "receita_realizada / headcount",
            source: "Omie (receita) + Pessoas (headcount)",
          }}
          isLoading={isLoading}
          isEmpty={!isLoading && !!d && d.headcount === 0}
          emptyMessage="Nenhum colaborador ativo cadastrado."
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Folha de Pagamento"
          value={d ? fmt(d.folhaPagamento) : "—"}
          sublabel={
            d ? `${fmtPct(d.folhaPct)} do total de custos` : undefined
          }
          icon={<Receipt className="h-4 w-4 text-rose-500" />}
          colorClass="text-rose-600 dark:text-rose-400"
          tooltip={{
            description:
              "Custos classificados como Folha de Pagamento no período.",
            enters: "Despesas com categoria 'folha' ou 'salários'.",
            source: "Omie (contas a pagar — categoria folha)",
          }}
          isLoading={isLoading}
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Custos Operacionais"
          value={d ? fmt(d.custosOperacionais) : "—"}
          sublabel={
            d ? `${fmtPct(d.operacionalPct)} do total de custos` : undefined
          }
          icon={<Cog className="h-4 w-4 text-slate-500" />}
          colorClass="text-slate-600 dark:text-slate-400"
          tooltip={{
            description:
              "Custos operacionais excluindo folha de pagamento.",
            formula: "total_despesas - folha_pagamento",
            source: "Omie (contas a pagar — exceto categoria folha)",
          }}
          isLoading={isLoading}
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Churn Rate"
          value={d ? fmtPct(d.churnRate) : "—"}
          sublabel="Clientes perdidos (mês atual)"
          icon={<UserMinus className="h-4 w-4 text-red-500" />}
          colorClass={
            d && d.churnRate > 10
              ? "text-red-600 dark:text-red-400"
              : d && d.churnRate > 5
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
          }
          tooltip={{
            description:
              "Taxa de churn: percentual de clientes que deixaram de gerar receita.",
            formula:
              "clientes_perdidos / clientes_ativos_mês_anterior × 100",
            source: "Omie (receita por cliente — comparação mensal)",
          }}
          isLoading={isLoading}
          isEmpty={!isLoading && !!d && d.churnHistory.length === 0}
          emptyMessage="Dados insuficientes para calcular churn (mínimo 2 meses)."
          error={errMsg}
          onRetry={onRetry}
        />
      </KpiGrid>

      {/* Churn sparkline */}
      {d && d.churnHistory.length > 1 && !isLoading && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">
              Evolução do Churn
            </p>
            <div className="flex gap-3">
              {d.churnHistory.slice(-3).map((p) => (
                <span key={p.month} className="text-xs text-gray-400">
                  {p.label}:{" "}
                  <span className="font-medium text-gray-600">
                    {p.rate.toFixed(1)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.churnHistory}>
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
