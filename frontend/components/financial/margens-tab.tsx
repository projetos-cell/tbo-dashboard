"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { useFinCategories } from "@/hooks/use-financial";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface MargensTabProps {
  payables: PayableRow[];
  receivables: ReceivableRow[];
}

interface DRELine {
  category: string;
  revenue: number;
  expenses: number;
  margin: number;
  marginPct: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function MargensTab({ payables, receivables }: MargensTabProps) {
  const [period, setPeriod] = useState("all");
  const { data: categories = [] } = useFinCategories();

  const filtered = useMemo(() => {
    if (period === "all") return { pay: payables, rec: receivables };

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const startStr = startDate.toISOString().slice(0, 10);
    return {
      pay: payables.filter((p) => p.due_date >= startStr),
      rec: receivables.filter((r) => r.due_date >= startStr),
    };
  }, [payables, receivables, period]);

  const dreLines = useMemo(() => {
    const catMap = new Map<string, { revenue: number; expenses: number }>();

    // Total revenue
    let totalRevenue = 0;
    for (const r of filtered.rec) {
      if (r.status === "cancelado") continue;
      totalRevenue += r.amount;
    }

    // Group expenses by category
    for (const p of filtered.pay) {
      if (p.status === "cancelado") continue;
      const cat = categories.find((c) => c.id === p.category_id);
      const catName = cat?.name ?? "Sem Categoria";
      const entry = catMap.get(catName) ?? { revenue: 0, expenses: 0 };
      entry.expenses += p.amount;
      catMap.set(catName, entry);
    }

    const lines: DRELine[] = [];

    // Add revenue line first
    if (totalRevenue > 0) {
      lines.push({
        category: "Receita Bruta",
        revenue: totalRevenue,
        expenses: 0,
        margin: totalRevenue,
        marginPct: 100,
      });
    }

    // Add expense lines
    let totalExpenses = 0;
    const expenseLines: DRELine[] = [];
    for (const [catName, val] of catMap) {
      totalExpenses += val.expenses;
      expenseLines.push({
        category: catName,
        revenue: 0,
        expenses: val.expenses,
        margin: -val.expenses,
        marginPct: totalRevenue > 0 ? -(val.expenses / totalRevenue) * 100 : 0,
      });
    }

    // Sort expenses by amount desc
    expenseLines.sort((a, b) => b.expenses - a.expenses);
    lines.push(...expenseLines);

    // Add totals
    const netMargin = totalRevenue - totalExpenses;
    lines.push({
      category: "Resultado Liquido",
      revenue: totalRevenue,
      expenses: totalExpenses,
      margin: netMargin,
      marginPct: totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0,
    });

    return lines;
  }, [filtered, categories]);

  // Summary KPIs
  const summary = useMemo(() => {
    const totalLine = dreLines.find((l) => l.category === "Resultado Liquido");
    const revenueLine = dreLines.find((l) => l.category === "Receita Bruta");
    return {
      revenue: revenueLine?.revenue ?? 0,
      expenses: totalLine?.expenses ?? 0,
      margin: totalLine?.margin ?? 0,
      marginPct: totalLine?.marginPct ?? 0,
    };
  }, [dreLines]);

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Analise de margens e DRE por periodo.
        </p>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo periodo</SelectItem>
            <SelectItem value="month">Mes atual</SelectItem>
            <SelectItem value="quarter">Trimestre atual</SelectItem>
            <SelectItem value="year">Ano atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.expenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary.margin)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Margem</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.marginPct >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.marginPct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DRE Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">DRE Simplificado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Despesa</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dreLines.map((line, i) => {
                const isTotal = line.category === "Resultado Liquido";
                const isRevenue = line.category === "Receita Bruta";
                return (
                  <TableRow
                    key={i}
                    className={isTotal ? "font-bold border-t-2" : isRevenue ? "font-semibold bg-muted/30" : ""}
                  >
                    <TableCell>{line.category}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {line.revenue > 0 ? formatCurrency(line.revenue) : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {line.expenses > 0 ? formatCurrency(line.expenses) : "\u2014"}
                    </TableCell>
                    <TableCell className={`text-right ${line.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(line.margin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          color: line.marginPct >= 0 ? "#22c55e" : "#ef4444",
                          backgroundColor: line.marginPct >= 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                        }}
                      >
                        {line.marginPct.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {dreLines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum dado disponivel para o periodo selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
