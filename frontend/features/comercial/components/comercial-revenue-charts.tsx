"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts";
import { fmtCompact, currencyFormatter } from "./comercial-chart-utils";
import type {
  MonthlyData,
  StageDistribution,
  BUDistribution,
  BUAvgPrice,
} from "@/features/comercial/services/commercial-analytics";

// ── Monthly Revenue Chart ──────────────────────────────────────────────────────

export function MonthlyRevenueChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de faturamento mensal.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={fmtCompact}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={60}
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
        <Bar
          dataKey="quoted"
          name="Orcado"
          fill="hsl(213 90% 70%)"
          fillOpacity={0.4}
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="billed"
          name="Faturado"
          fill="hsl(160 60% 45%)"
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
        />
        <Line
          type="monotone"
          dataKey="billed"
          name="Tendencia"
          stroke="hsl(160 60% 35%)"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(160 60% 35%)" }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Stage Distribution Donut ───────────────────────────────────────────────────

export function StageDonut({ data }: { data: StageDistribution[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de funil.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="count"
            nameKey="label"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.stage} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [
              `${value ?? 0} deals`,
              name ?? "",
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {data.map((d) => (
          <div key={d.stage} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-muted-foreground">
              {d.label} ({d.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BU Donut Chart ─────────────────────────────────────────────────────────────

export function BUDonutChart({ data }: { data: BUDistribution[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de unidade de negócio.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="revenue"
            nameKey="bu"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.bu} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={currencyFormatter}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {data.map((d) => (
          <div key={d.bu} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-muted-foreground">
              {d.bu} ({fmtCompact(d.revenue)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Avg Price by BU Chart ──────────────────────────────────────────────────────

export function AvgPriceByBUChart({ data }: { data: BUAvgPrice[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de preço médio.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
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
          dataKey="bu"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          formatter={currencyFormatter}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar dataKey="avgPrice" name="Preço Médio" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry) => (
            <Cell key={entry.bu} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
