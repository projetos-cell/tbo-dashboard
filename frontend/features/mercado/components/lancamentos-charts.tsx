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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BAR_COLORS } from "./mercado-utils";

const PIE_COLORS_TIPO = [
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

/* ── IncorporadorasBarChart ─────────────────────────── */

interface BarDatum {
  nome: string;
  lancamentos: number;
}

export function IncorporadorasBarChart({ data }: { data: BarDatum[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Top incorporadoras (por lancamentos)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={data.length * 36 + 10}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="nome"
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value?: number) => [value ?? 0, "Lancamentos"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="lancamentos" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={`bar-${i}`}
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── TipologiaDonutChart ───────────────────────────── */

interface PieDatum {
  name: string;
  value: number;
}

export function TipologiaDonutChart({ data }: { data: PieDatum[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Distribuicao por tipologia
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }: { name?: string; value?: number }) =>
                `${name ?? ""}: ${value ?? 0}`
              }
            >
              {data.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={PIE_COLORS_TIPO[i % PIE_COLORS_TIPO.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
