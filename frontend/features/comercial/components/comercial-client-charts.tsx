"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { fmtCompact, currencyFormatter } from "./comercial-chart-utils";
import type {
  ClientData,
  OwnerData,
  PipelineByOwner,
} from "@/features/comercial/services/commercial-analytics";

// Re-export tables co-located with this domain for backward compatibility
export { ClientRankingTable, OwnersTable } from "./comercial-ranking-tables";

// ── Top Clients Chart ──────────────────────────────────────────────────────────

export function TopClientsChart({ data }: { data: ClientData[] }) {
  const top10 = data.slice(0, 10);

  if (!top10.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de clientes.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, top10.length * 32)}>
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={fmtCompact}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          formatter={currencyFormatter}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar
          dataKey="billed"
          name="Faturado"
          fill="hsl(160 60% 45%)"
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
        />
        <Bar
          dataKey="quoted"
          name="Orcado"
          fill="hsl(213 90% 70%)"
          fillOpacity={0.5}
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Top Owners Chart ───────────────────────────────────────────────────────────

export function TopOwnersChart({ data }: { data: OwnerData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de vendedores.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={fmtCompact}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          formatter={currencyFormatter}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar
          dataKey="billed"
          name="Faturado"
          fill="hsl(262 60% 60%)"
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Pipeline by Owner Chart ────────────────────────────────────────────────────

export function PipelineByOwnerChart({ data }: { data: PipelineByOwner[] }) {
  if (!data.length) return null;

  const owners = [...new Set(data.map((d) => d.owner))];
  const pipelines = [...new Set(data.map((d) => d.pipeline))];

  const chartData = owners.map((owner) => {
    const row: Record<string, unknown> = { owner };
    for (const p of pipelines) {
      const match = data.find((d) => d.owner === owner && d.pipeline === p);
      row[p] = match?.billed ?? 0;
    }
    return row;
  });

  const COLORS = [
    "hsl(213 90% 60%)",
    "hsl(160 60% 45%)",
    "hsl(262 60% 60%)",
    "hsl(35 90% 55%)",
    "hsl(0 70% 58%)",
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, owners.length * 40)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={fmtCompact}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="owner"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          formatter={currencyFormatter}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {pipelines.map((p, i) => (
          <Bar
            key={p}
            dataKey={p}
            name={p}
            stackId="pipeline"
            fill={COLORS[i % COLORS.length]}
            radius={
              i === pipelines.length - 1 ? [0, 4, 4, 0] : undefined
            }
            maxBarSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
