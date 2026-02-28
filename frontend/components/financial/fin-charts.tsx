"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { computeCashFlow } from "@/services/financial";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface FinChartsProps {
  payables: PayableRow[];
  receivables: ReceivableRow[];
}

// ── Helpers ──────────────────────────────────────────────────

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getLastSixMonths(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    months.push({ key, label });
  }
  return months;
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

// ── Component ────────────────────────────────────────────────

export function FinCharts({ payables, receivables }: FinChartsProps) {
  const months = useMemo(() => getLastSixMonths(), []);

  // ── Receitas vs Despesas por mes ──
  const revenueExpenseData = useMemo(() => {
    const recMap = new Map<string, number>();
    const payMap = new Map<string, number>();

    for (const r of receivables) {
      if (r.status === "cancelado") continue;
      const mk = getMonthKey(r.due_date);
      recMap.set(mk, (recMap.get(mk) ?? 0) + r.amount);
    }

    for (const p of payables) {
      if (p.status === "cancelado") continue;
      const mk = getMonthKey(p.due_date);
      payMap.set(mk, (payMap.get(mk) ?? 0) + p.amount);
    }

    return months.map((m) => ({
      name: m.label,
      receitas: recMap.get(m.key) ?? 0,
      despesas: payMap.get(m.key) ?? 0,
    }));
  }, [payables, receivables, months]);

  // ── Lucro ao longo do tempo ──
  const profitData = useMemo(() => {
    return revenueExpenseData.map((d) => ({
      name: d.name,
      lucro: d.receitas - d.despesas,
    }));
  }, [revenueExpenseData]);

  // ── Fluxo de caixa 30 dias ──
  const cashFlowData = useMemo(() => {
    const raw = computeCashFlow(payables, receivables, 30);
    return raw.map((d) => ({
      date: new Date(d.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      saldo: d.balance,
      entradas: d.inflows,
      saidas: d.outflows,
    }));
  }, [payables, receivables]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Receitas vs Despesas */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">
            Receitas vs Despesas (6 meses)
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v: number) => fmt(v)} />
              <Tooltip
                formatter={(value: number | string | undefined) => fmt(Number(value ?? 0))}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="receitas"
                name="Receitas"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="despesas"
                name="Despesas"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lucro liquido */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">
            Lucro Liquido (6 meses)
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v: number) => fmt(v)} />
              <Tooltip
                formatter={(value: number | string | undefined) => fmt(Number(value ?? 0))}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                name="Lucro"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fluxo de caixa projetado */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">
            Fluxo de Caixa Projetado (30 dias)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" fontSize={11} interval={2} />
              <YAxis fontSize={12} tickFormatter={(v: number) => fmt(v)} />
              <Tooltip
                formatter={(value: number | string | undefined) => fmt(Number(value ?? 0))}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="saldo"
                name="Saldo Acumulado"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSaldo)"
              />
              <Area
                type="monotone"
                dataKey="entradas"
                name="Entradas"
                stroke="#22c55e"
                strokeWidth={1}
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="saidas"
                name="Saidas"
                stroke="#ef4444"
                strokeWidth={1}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
