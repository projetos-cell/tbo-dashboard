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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CENSO_RESUMO,
  POPULACAO_HISTORICA,
} from "@/features/mercado/utils/censo-curitiba-data";
import { fmtNum, fmtPct, BAR_COLORS, PIE_COLORS } from "./mercado-utils";

/* ── HorizontalBarCard ───────────────────────────────── */

export function HorizontalBarCard({
  title,
  data,
  valueLabel,
  formatValue,
}: {
  title: string;
  data: { bairro: string; valor: number; destaque?: boolean }[];
  valueLabel: string;
  formatValue?: (v: number) => string;
}) {
  const fmt = formatValue ?? fmtNum;
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={data.length * 38 + 10}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="bairro"
              width={110}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value?: number) => [fmt(value ?? 0), valueLabel]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={entry.bairro}
                  fill={entry.destaque ? "#f59e0b" : BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── HistoricalLineCard ──────────────────────────────── */

export function HistoricalLineCard() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Evolucao historica (1980-2022)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={POPULACAO_HISTORICA}
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
              yAxisId="dom"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => (v / 1_000).toFixed(0) + "k"}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? fmtNum(value) : "—",
                name === "populacao" ? "Populacao" : "Domicilios",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "populacao" ? "Populacao" : "Domicilios"
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
              yAxisId="dom"
              type="monotone"
              dataKey="domicilios"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── OccupancyDonut ──────────────────────────────────── */

export function OccupancyDonut() {
  const data = [
    { name: "Ocupados", value: CENSO_RESUMO.pctOcupados },
    { name: "Nao ocupados", value: CENSO_RESUMO.pctNaoOcupados },
  ];

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Condicao de ocupacao
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }: { name?: string; value?: number }) =>
                `${name ?? ""}: ${value ?? 0}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v?: number) => fmtPct(v ?? 0)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
