"use client";

import React from "react";
import {
  IconCurrencyDollar,
  IconFileText,
  IconTrendingUp,
  IconTag,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconBolt,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type {
  CommercialKPIs,
  MonthlyData,
  ClientData,
  OwnerData,
  StageDistribution,
  PipelineByOwner,
  ProductData,
  BUDistribution,
  BUAvgPrice,
  StrategicInsight,
} from "@/features/comercial/services/commercial-analytics";

// ── Formatters ─────────────────────────────────────────────────────────────────

export function fmtCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

export function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

// Recharts v3 Formatter expects (value?: number, name?: string, ...) — wrap for safety
export function currencyFormatter(
  value: number | undefined,
  name: string | undefined,
): [string, string] {
  return [formatCurrency(value ?? 0), name ?? ""];
}

// ── KPI Cards ──────────────────────────────────────────────────────────────────

export function KpiRow({ kpis }: { kpis: CommercialKPIs }) {
  const items = [
    {
      label: "Faturamento Total",
      value: formatCurrency(kpis.totalBilled),
      sub: `${kpis.wonDeals} deals ganhos`,
      icon: IconCurrencyDollar,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Orcado",
      value: formatCurrency(kpis.totalQuoted),
      sub: `${kpis.totalDeals} propostas`,
      icon: IconFileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Taxa de Conversao",
      value: kpis.conversionRate > 0 ? fmtPct(kpis.conversionRate) : "--",
      sub: `${kpis.wonDeals}/${kpis.wonDeals + kpis.lostDeals} fechados`,
      icon: IconTrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Ticket Medio",
      value: kpis.avgTicket > 0 ? formatCurrency(kpis.avgTicket) : "--",
      sub: "por deal ganho",
      icon: IconTag,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight">
                {item.value}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                {item.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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

// ── Client Ranking Table ───────────────────────────────────────────────────────

export function ClientRankingTable({ data }: { data: ClientData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Sem dados de clientes.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Cliente</th>
            <th className="pb-2 pr-4 text-right font-medium">Propostas</th>
            <th className="pb-2 pr-4 text-right font-medium">Convertidas</th>
            <th className="pb-2 pr-4 text-right font-medium">Conversao</th>
            <th className="pb-2 pr-4 text-right font-medium">Orcado</th>
            <th className="pb-2 pr-4 text-right font-medium">Faturado</th>
            <th className="pb-2 text-right font-medium">Participacao</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 15).map((c, i) => (
            <tr key={c.name} className="border-b last:border-0">
              <td className="py-2 pr-4 text-xs text-muted-foreground">
                {i + 1}
              </td>
              <td className="py-2 pr-4 font-medium">{c.name}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {c.proposals}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {c.converted}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {fmtPct(c.conversionRate)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {formatCurrency(c.quoted)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums font-medium">
                {formatCurrency(c.billed)}
              </td>
              <td className="py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(c.participation, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {fmtPct(c.participation)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Owners Performance Table ───────────────────────────────────────────────────

export function OwnersTable({ data }: { data: OwnerData[] }) {
  if (!data.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Vendedor</th>
            <th className="pb-2 pr-4 text-right font-medium">Deals</th>
            <th className="pb-2 pr-4 text-right font-medium">Ganhos</th>
            <th className="pb-2 pr-4 text-right font-medium">Conversao</th>
            <th className="pb-2 text-right font-medium">Faturado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((o) => (
            <tr key={o.name} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">{o.name}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{o.deals}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{o.won}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {fmtPct(o.conversionRate)}
              </td>
              <td className="py-2 text-right tabular-nums font-medium">
                {formatCurrency(o.billed)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
              {d.bu} ({fmtPct(d.pct)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Products Chart ─────────────────────────────────────────────────────────

const PRODUCT_BAR_COLORS = [
  "hsl(262 60% 60%)", "hsl(213 90% 60%)", "hsl(160 60% 45%)",
  "hsl(35 90% 55%)", "hsl(340 60% 55%)", "hsl(190 70% 45%)",
  "hsl(280 50% 55%)", "hsl(100 50% 45%)", "hsl(15 80% 55%)",
  "hsl(230 60% 60%)",
];

export function TopProductsChart({ data }: { data: ProductData[] }) {
  const top10 = data.slice(0, 10);

  if (!top10.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados de produtos.
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
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          formatter={currencyFormatter}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar dataKey="totalRevenue" name="Receita Total" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {top10.map((_, i) => (
            <Cell key={i} fill={PRODUCT_BAR_COLORS[i % PRODUCT_BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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

// ── Product Ranking Table ──────────────────────────────────────────────────────

export function ProductRankingTable({ data }: { data: ProductData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Sem dados de produtos.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-3 font-medium">#</th>
            <th className="pb-2 pr-3 font-medium">Produto / Serviço</th>
            <th className="pb-2 pr-3 font-medium">Unidade de Negócio</th>
            <th className="pb-2 pr-3 text-right font-medium">Qtd Vendida</th>
            <th className="pb-2 pr-3 text-right font-medium">Preço Médio Unit.</th>
            <th className="pb-2 pr-3 text-right font-medium">Receita Total</th>
            <th className="pb-2 pr-3 text-right font-medium">% do Total</th>
            <th className="pb-2 font-medium">Representatividade</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 15).map((p, i) => (
            <tr key={p.name} className="border-b last:border-0 hover:bg-muted/30">
              <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                {i + 1}
              </td>
              <td className="py-2.5 pr-3 font-medium">{p.name}</td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {p.bu}
                </span>
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums">
                {p.qtdSold}
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums">
                {p.avgUnitPrice > 0 ? formatCurrency(p.avgUnitPrice) : "–"}
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums font-medium">
                {formatCurrency(p.totalRevenue)}
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums">
                {fmtPct(p.pctOfTotal)}
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(p.pctOfTotal * 4, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Strategic Insights Section ─────────────────────────────────────────────────

const INSIGHT_STYLES: Record<
  StrategicInsight["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  success: { icon: IconCircleCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  warning: { icon: IconAlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  info: { icon: IconInfoCircle, color: "text-blue-600", bg: "bg-blue-50" },
  opportunity: { icon: IconBolt, color: "text-purple-600", bg: "bg-purple-50" },
};

export function InsightsSection({ insights }: { insights: StrategicInsight[] }) {
  if (!insights.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Dados insuficientes para gerar insights.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight, i) => {
        const style = INSIGHT_STYLES[insight.type];
        const Icon = style.icon;
        return (
          <div key={i} className="flex gap-3 rounded-lg border p-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{insight.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
