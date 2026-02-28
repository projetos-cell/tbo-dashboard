"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FinancialEntry } from "@/services/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Props {
  entries: FinancialEntry[];
}

function aggregateByMonth(entries: FinancialEntry[]) {
  const map = new Map<string, { receita: number; despesa: number }>();
  entries.forEach((e) => {
    const month = e.date.slice(0, 7); // YYYY-MM
    const existing = map.get(month) || { receita: 0, despesa: 0 };
    if (e.type === "receita") existing.receita += e.amount;
    else existing.despesa += Math.abs(e.amount);
    map.set(month, existing);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("pt-BR", {
        month: "short",
      }),
      receita: data.receita,
      despesa: data.despesa,
      saldo: data.receita - data.despesa,
    }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialOverview({ entries }: Props) {
  const chartData = aggregateByMonth(entries);
  const totalReceita = entries
    .filter((e) => e.type === "receita")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalDespesa = entries
    .filter((e) => e.type === "despesa")
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const saldo = totalReceita - totalDespesa;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Visao Financeira (90 dias)
        </CardTitle>
        <a
          href="/financeiro"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver detalhes
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(totalReceita)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(totalDespesa)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p
                className={`text-sm font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(v) =>
                    `${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value: unknown) => formatCurrency(Number(value ?? 0))}
                  labelClassName="font-medium"
                />
                <Bar
                  dataKey="receita"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="Receita"
                />
                <Bar
                  dataKey="despesa"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Despesa"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem dados financeiros nos ultimos 90 dias
          </p>
        )}
      </CardContent>
    </Card>
  );
}
