"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  TableIcon,
  Calendar,
} from "lucide-react";
import { computeIntelligentCashFlow } from "@/services/financial";
import type { CashFlowAlert } from "@/services/financial";
import type { Database } from "@/lib/supabase/types";
import { formatBRL } from "@/lib/format";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface IntelligentCashFlowProps {
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

function alertBadge(alert: CashFlowAlert) {
  return (
    <div
      key={`${alert.type}-${alert.date}`}
      className="flex items-start gap-2 rounded-lg border p-3"
    >
      <AlertTriangle
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          alert.severity === "danger" ? "text-red-500" : "text-yellow-500"
        }`}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{alert.message}</p>
        {alert.amount !== undefined && (
          <p className="text-xs text-muted-foreground">
            Valor: {formatBRL(alert.amount)}
          </p>
        )}
      </div>
      <Badge
        variant={alert.severity === "danger" ? "destructive" : "outline"}
        className="ml-auto shrink-0 text-xs"
      >
        {alert.severity === "danger" ? "Critico" : "Atencao"}
      </Badge>
    </div>
  );
}

const PERIOD_OPTIONS = [
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
] as const;

export function IntelligentCashFlow({
  payables,
  receivables,
  initialBalance,
  masked = false,
}: IntelligentCashFlowProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [period, setPeriod] = useState<number>(30);

  const { days, alerts } = useMemo(
    () => computeIntelligentCashFlow(payables, receivables, initialBalance, period),
    [payables, receivables, initialBalance, period]
  );

  const chartData = useMemo(
    () =>
      days.map((d) => ({
        date: new Date(d.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        saldo: d.balance,
        entradas: d.inflows,
        saidas: d.outflows,
      })),
    [days]
  );

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold mb-2">Alertas do Fluxo de Caixa</p>
            {alerts.map((a) => alertBadge(a))}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={view === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("chart")}
          >
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            Grafico
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <TableIcon className="mr-1 h-3.5 w-3.5" />
            Tabela
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-4">
          {view === "chart" ? (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSaldoInt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" fontSize={11} interval={Math.floor(period / 10)} />
                <YAxis fontSize={12} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip
                  formatter={(value?: number | string) =>
                    masked ? "R$ ****" : fmt(Number(value ?? 0))
                  }
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo Acumulado"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSaldoInt)"
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
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs text-right">Entradas</TableHead>
                    <TableHead className="text-xs text-right">Saidas</TableHead>
                    <TableHead className="text-xs text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map((d) => (
                    <TableRow
                      key={d.date}
                      className={d.balance < 0 ? "bg-red-50 dark:bg-red-950/20" : ""}
                    >
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-xs text-right text-green-600">
                        {d.inflows > 0 ? (masked ? "****" : formatBRL(d.inflows)) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-right text-red-600">
                        {d.outflows > 0 ? (masked ? "****" : formatBRL(d.outflows)) : "—"}
                      </TableCell>
                      <TableCell
                        className={`text-xs text-right font-medium ${
                          d.balance < 0 ? "text-red-600" : ""
                        }`}
                      >
                        {masked ? "R$ ****" : formatBRL(d.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
