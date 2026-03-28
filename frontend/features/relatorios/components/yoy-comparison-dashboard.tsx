"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { useYoYSummary } from "../hooks/use-reports";
import type { YoYResult, YoYMetric } from "../services/yoy-comparison";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatValue(value: number, metric: YoYMetric): string {
  if (metric === "revenue" || metric === "expenses" || metric === "margin" || metric === "deals_won") {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  return value.toLocaleString("pt-BR");
}

function ChangeBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 0.5) {
    return (
      <Badge variant="secondary" className="gap-1">
        <IconMinus className="h-3 w-3" />
        {pct.toFixed(1)}%
      </Badge>
    );
  }
  const isPositive = pct > 0;
  return (
    <Badge
      variant={isPositive ? "default" : "destructive"}
      className="gap-1"
    >
      {isPositive ? (
        <IconTrendingUp className="h-3 w-3" />
      ) : (
        <IconTrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </Badge>
  );
}

// ── YoY Chart ─────────────────────────────────────────────────────────────────

function YoYChart({ result }: { result: YoYResult }) {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const chartData = result.currentYear.map((d, i) => ({
    month: d.label,
    [String(currentYear)]: d.value,
    [String(previousYear)]: result.previousYear[i]?.value ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{result.label}</CardTitle>
          <ChangeBadge pct={result.change_pct} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(v: number) => {
              if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
              if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
              return String(v);
            }} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value: number) => formatValue(value, result.metric)}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey={String(currentYear)}
              stroke="#18181B"
              strokeWidth={2}
              dot={false}
              name={String(currentYear)}
            />
            <Line
              type="monotone"
              dataKey={String(previousYear)}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name={String(previousYear)}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
          <div>
            <p className="text-xs text-muted-foreground">{currentYear}</p>
            <p className="text-sm font-semibold">
              {formatValue(result.current_total, result.metric)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{previousYear}</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {formatValue(result.previous_total, result.metric)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Summary Table ─────────────────────────────────────────────────────────────

function SummaryTable({ results }: { results: YoYResult[] }) {
  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Resumo Comparativo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead className="text-right">{currentYear}</TableHead>
              <TableHead className="text-right">{currentYear - 1}</TableHead>
              <TableHead className="text-right">Variação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.metric}>
                <TableCell className="font-medium">{r.label}</TableCell>
                <TableCell className="text-right">
                  {formatValue(r.current_total, r.metric)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatValue(r.previous_total, r.metric)}
                </TableCell>
                <TableCell className="text-right">
                  <ChangeBadge pct={r.change_pct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function YoYComparisonDashboard() {
  const { data: summary, isLoading, error } = useYoYSummary();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Erro ao carregar comparativo anual.
        </CardContent>
      </Card>
    );
  }

  const resultsArray = Object.values(summary) as YoYResult[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resultsArray.map((result) => (
          <YoYChart key={result.metric} result={result} />
        ))}
      </div>

      <SummaryTable results={resultsArray} />
    </div>
  );
}
