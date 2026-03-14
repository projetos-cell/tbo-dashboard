"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  IconChartBar,
  IconTimeline,
} from "@tabler/icons-react";
import type { CidadePR, PopulacaoHistoricaPR } from "@/features/mercado/utils/censo-pr-data";
import { fmtNum } from "./mercado-utils";

/* ── Top Cities Bar Chart ────────────────────────────── */

export function TopCitiesBarChart({ data }: { data: CidadePR[] }) {
  const top10 = data.slice(0, 10).map((c) => ({
    cidade: c.cidade,
    populacao: c.populacao,
  }));

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconChartBar className="h-4 w-4" />
          Top 10 cidades por populacao
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? (v / 1_000_000).toFixed(1) + "M"
                  : (v / 1_000).toFixed(0) + "k"
              }
            />
            <YAxis
              type="category"
              dataKey="cidade"
              width={130}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value?: number) => [fmtNum(value ?? 0), "Habitantes"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="populacao" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── Historical Evolution Dual-Axis Chart ────────────── */

export function HistoricalEvolutionChart({ data }: { data: PopulacaoHistoricaPR[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconTimeline className="h-4 w-4" />
          Evolucao historica — Populacao e Urbanizacao (1970-2022)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="pop"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? (v / 1_000_000).toFixed(1) + "M"
                  : (v / 1_000).toFixed(0) + "k"
              }
            />
            <YAxis
              yAxisId="urb"
              orientation="right"
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(v: number) => v + "%"}
            />
            <Tooltip
              formatter={(value?: number, name?: string) => [
                name === "populacao" ? fmtNum(value ?? 0) : (value ?? 0).toFixed(1) + "%",
                name === "populacao" ? "Populacao" : "Urbanizacao",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "populacao" ? "Populacao" : "Urbanizacao %"
              }
            />
            <Line
              yAxisId="pop"
              type="monotone"
              dataKey="populacao"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="urb"
              type="monotone"
              dataKey="urbanizacao"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
