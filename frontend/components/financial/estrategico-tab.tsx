"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { useFinCategories, useCostCenters, useFinClients } from "@/hooks/use-financial";
import {
  computeDRE,
  computeCostCenterAnalysis,
  computeRevenueConcentration,
  computeAverageTicket,
  computeRecurringVsProject,
} from "@/services/financial";
import { formatBRL, formatBRLCompact } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface EstrategicoTabProps {
  payables: PayableRow[];
  receivables: ReceivableRow[];
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

export function EstrategicoTab({ payables, receivables, masked = false }: EstrategicoTabProps) {
  const { data: categories = [] } = useFinCategories();
  const { data: costCenters = [] } = useCostCenters();
  const { data: clients = [] } = useFinClients();

  // DRE
  const dre = useMemo(
    () => computeDRE(payables, receivables, categories),
    [payables, receivables, categories]
  );

  const dreTotal = useMemo(() => {
    const totalRev = dre.reduce((s, d) => s + d.revenue, 0);
    const totalExp = dre.reduce((s, d) => s + d.expenses, 0);
    return { revenue: totalRev, expenses: totalExp, margin: totalRev - totalExp };
  }, [dre]);

  // Cost center analysis
  const ccAnalysis = useMemo(
    () => computeCostCenterAnalysis(payables, receivables, costCenters),
    [payables, receivables, costCenters]
  );

  // Revenue concentration (Pareto)
  const concentration = useMemo(
    () => computeRevenueConcentration(receivables, clients),
    [receivables, clients]
  );

  const paretoData = useMemo(
    () =>
      concentration.slice(0, 10).map((c) => ({
        name: c.clientName.length > 20 ? c.clientName.slice(0, 17) + "..." : c.clientName,
        receita: c.revenue,
        cumulativo: c.cumulativePct,
      })),
    [concentration]
  );

  // Average ticket
  const avgTicket = useMemo(
    () => computeAverageTicket(receivables, clients),
    [receivables, clients]
  );

  // Recurring vs project
  const recVsProj = useMemo(
    () => computeRecurringVsProject(receivables),
    [receivables]
  );

  return (
    <div className="space-y-6">
      {/* 1. DRE Simplificado */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-3">DRE Simplificado</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs text-right">Receitas</TableHead>
                  <TableHead className="text-xs text-right">Despesas</TableHead>
                  <TableHead className="text-xs text-right">Margem</TableHead>
                  <TableHead className="text-xs text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.map((line) => (
                  <TableRow key={line.categoryId ?? line.category}>
                    <TableCell className="text-xs font-medium">{line.category}</TableCell>
                    <TableCell className="text-xs text-right text-green-600">
                      {masked ? "****" : formatBRLCompact(line.revenue)}
                    </TableCell>
                    <TableCell className="text-xs text-right text-red-600">
                      {masked ? "****" : formatBRLCompact(line.expenses)}
                    </TableCell>
                    <TableCell
                      className={`text-xs text-right font-medium ${
                        line.margin >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {masked ? "****" : formatBRLCompact(line.margin)}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {line.marginPct.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold border-t-2">
                  <TableCell className="text-xs">Total</TableCell>
                  <TableCell className="text-xs text-right text-green-600">
                    {masked ? "****" : formatBRLCompact(dreTotal.revenue)}
                  </TableCell>
                  <TableCell className="text-xs text-right text-red-600">
                    {masked ? "****" : formatBRLCompact(dreTotal.expenses)}
                  </TableCell>
                  <TableCell
                    className={`text-xs text-right ${
                      dreTotal.margin >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {masked ? "****" : formatBRLCompact(dreTotal.margin)}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {dreTotal.revenue > 0
                      ? ((dreTotal.margin / dreTotal.revenue) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2. Cost Center Analysis */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Analise por Centro de Custo</p>
            {ccAnalysis.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sem dados de centro de custo.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, ccAnalysis.length * 40)}>
                <BarChart data={ccAnalysis} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" fontSize={11} tickFormatter={(v: number) => fmt(v)} />
                  <YAxis
                    type="category"
                    dataKey="costCenterName"
                    fontSize={11}
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value?: number | string) =>
                      masked ? "R$ ****" : fmt(Number(value ?? 0))
                    }
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Receita" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expenses" name="Despesa" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 3. Revenue Concentration (Pareto) */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Concentracao de Receita (Pareto)</p>
            {paretoData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sem dados de receita por cliente.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={paretoData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={50} />
                  <YAxis yAxisId="left" fontSize={11} tickFormatter={(v: number) => fmt(v)} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={11}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value?: number | string, name?: string) =>
                      name === "Cumulativo (%)"
                        ? `${Number(value ?? 0).toFixed(1)}%`
                        : masked
                          ? "R$ ****"
                          : fmt(Number(value ?? 0))
                    }
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#f59e0b" strokeDasharray="3 3" label="80%" />
                  <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativo"
                    name="Cumulativo (%)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 4. Average Ticket */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Ticket Medio por Cliente</p>
            {avgTicket.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sem dados de ticket medio.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Cliente</TableHead>
                      <TableHead className="text-xs text-right">Ticket Medio</TableHead>
                      <TableHead className="text-xs text-right">Faturas</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avgTicket.slice(0, 15).map((c) => (
                      <TableRow key={c.clientId ?? "unknown"}>
                        <TableCell className="text-xs truncate max-w-[150px]">
                          {c.clientName}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {masked ? "****" : formatBRL(c.avgTicket)}
                        </TableCell>
                        <TableCell className="text-xs text-right">{c.count}</TableCell>
                        <TableCell className="text-xs text-right">
                          {masked ? "****" : formatBRLCompact(c.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Recurring vs Project */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Receita: Recorrente vs Projeto</p>
            <div className="flex items-center gap-6 py-6">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {masked ? "****" : formatBRLCompact(recVsProj.recurring)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorrente ({recVsProj.recurringPct.toFixed(0)}%)
                </p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {masked ? "****" : formatBRLCompact(recVsProj.project)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projetos ({(100 - recVsProj.recurringPct).toFixed(0)}%)
                </p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-l-full"
                style={{ width: `${recVsProj.recurringPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
