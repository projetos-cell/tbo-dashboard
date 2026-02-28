"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle } from "lucide-react";
import { computeSimulation } from "@/services/financial";
import { formatBRLCompact } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface SimulacoesTabProps {
  payables: PayableRow[];
  receivables: ReceivableRow[];
  initialBalance: number;
  masked?: boolean;
}

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function SimulacoesTab({
  payables,
  receivables,
  initialBalance,
  masked = false,
}: SimulacoesTabProps) {
  const [delayPct, setDelayPct] = useState(0);
  const [cutPct, setCutPct] = useState(0);
  const [growthPct, setGrowthPct] = useState(0);

  const result = useMemo(
    () =>
      computeSimulation(payables, receivables, initialBalance, {
        receivablesDelayPct: delayPct,
        expenseCutPct: cutPct,
        revenueGrowthPct: growthPct,
      }),
    [payables, receivables, initialBalance, delayPct, cutPct, growthPct]
  );

  const chartData = result.monthlyProjection.map((m) => ({
    name: m.month,
    caixa: m.balance,
    receita: m.revenue,
    despesa: m.expenses,
  }));

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950/20">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Simulacao para analise estrategica. Nao altera dados no OMIE.
        </p>
      </div>

      {/* Sliders */}
      <Card>
        <CardContent className="p-4 space-y-6">
          <p className="text-sm font-semibold">Parametros do Cenario</p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">
                  Atraso em recebimentos
                </label>
                <span className="text-sm font-medium">{delayPct}%</span>
              </div>
              <Slider
                value={[delayPct]}
                onValueChange={(v) => setDelayPct(v[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">
                  Corte de despesas
                </label>
                <span className="text-sm font-medium">{cutPct}%</span>
              </div>
              <Slider
                value={[cutPct]}
                onValueChange={(v) => setCutPct(v[0])}
                min={0}
                max={50}
                step={5}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">
                  Crescimento de receita
                </label>
                <span className="text-sm font-medium">
                  {growthPct >= 0 ? "+" : ""}
                  {growthPct}%
                </span>
              </div>
              <Slider
                value={[growthPct]}
                onValueChange={(v) => setGrowthPct(v[0])}
                min={-50}
                max={100}
                step={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={`border-l-4 ${
            result.projectedCash >= 0
              ? "border-l-green-500"
              : "border-l-red-500"
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Caixa Projetado (6 meses)
            </p>
            <p
              className={`text-2xl font-bold ${
                result.projectedCash >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {masked ? "****" : formatBRLCompact(result.projectedCash)}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${
            result.projectedRunway >= 6
              ? "border-l-green-500"
              : result.projectedRunway >= 3
                ? "border-l-yellow-500"
                : "border-l-red-500"
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Runway Projetado
            </p>
            <p className="text-2xl font-bold">
              {masked
                ? "****"
                : result.projectedRunway >= 24
                  ? `${(result.projectedRunway / 12).toFixed(0)} anos`
                  : `${result.projectedRunway.toFixed(1)} meses`}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${
            result.projectedMarginPct >= 10
              ? "border-l-green-500"
              : result.projectedMarginPct >= 0
                ? "border-l-yellow-500"
                : "border-l-red-500"
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Margem Projetada
            </p>
            <p
              className={`text-2xl font-bold ${
                result.projectedMarginPct >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {masked ? "****" : `${result.projectedMarginPct.toFixed(1)}%`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection chart */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-3">Projecao 6 Meses</p>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sem dados para projecao.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip
                  formatter={(value?: number | string) =>
                    masked ? "R$ ****" : fmt(Number(value ?? 0))
                  }
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="caixa"
                  name="Caixa"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="despesa"
                  name="Despesa"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
