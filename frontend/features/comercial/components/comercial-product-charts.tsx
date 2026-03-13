"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { fmtCompact, fmtPct, currencyFormatter, PRODUCT_BAR_COLORS } from "./comercial-chart-utils";
import type {
  ProductData,
} from "@/features/comercial/services/commercial-analytics";

// ── Top Products Chart ─────────────────────────────────────────────────────────

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
