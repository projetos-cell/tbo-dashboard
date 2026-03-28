"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePricingServices, useBUCosts, usePricingPremises } from "@/features/comercial/hooks/use-pricing";
import {
  computeServicePricing,
  type BUCostRow,
  DEFAULT_PREMISES,
  type PricingPremises,
} from "@/features/comercial/services/pricing";
import type { PricingServiceRow } from "@/features/comercial/services/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const BU_COLORS: Record<string, string> = {
  "Archviz": "#E85102",
  "Branding": "#6366f1",
  "Motion": "#f59e0b",
  "Strategy": "#10b981",
  "Tech": "#3b82f6",
  "Content": "#ec4899",
};

function getBUColor(bu: string): string {
  return BU_COLORS[bu] ?? "#94a3b8";
}

// ─── Price by BU table ────────────────────────────────────────────────────────

interface AveragePriceRow {
  bu: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

interface TrendBadgeProps {
  pct: number;
}

function TrendBadge({ pct }: TrendBadgeProps) {
  if (pct > 2) {
    return (
      <Badge className="gap-1 bg-red-50 text-red-600 border-red-200 text-xs">
        <IconTrendingUp size={11} /> +{pct.toFixed(1)}%
      </Badge>
    );
  }
  if (pct < -2) {
    return (
      <Badge className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
        <IconTrendingDown size={11} /> {pct.toFixed(1)}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-zinc-400 text-xs">
      <IconMinus size={11} /> Estável
    </Badge>
  );
}

// ─── Simulated chart data ─────────────────────────────────────────────────────

/**
 * Generates simulated monthly price data based on current service prices.
 * In production this would query a price history table.
 */
function buildChartData(
  services: PricingServiceRow[],
  buCostMap: Map<string, BUCostRow>,
  premises: Pick<PricingPremises, "tax_pct" | "commission_pct" | "target_margin_pct">,
) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return format(d, "MMM/yy", { locale: ptBR });
  });

  const buGroups = new Map<string, PricingServiceRow[]>();
  services.forEach((s) => {
    const bu = s.bu ?? "Outros";
    if (!buGroups.has(bu)) buGroups.set(bu, []);
    buGroups.get(bu)!.push(s);
  });

  return months.map((month, monthIdx) => {
    const row: Record<string, unknown> = { month };
    buGroups.forEach((buServices, bu) => {
      // Simulate slight variation over time (±5%)
      const avgPrice =
        buServices.reduce((sum, s) => {
          const c = computeServicePricing(s, buCostMap, premises);
          return sum + c.suggested_price;
        }, 0) / buServices.length;

      // Add some simulated trend
      const trendFactor = 1 + (monthIdx - 2.5) * 0.01;
      row[bu] = Math.round(avgPrice * trendFactor);
    });
    return row;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PriceHistoryDashboard() {
  const { data: services, isLoading: loadingServices } = usePricingServices();
  const { data: buCosts, isLoading: loadingBU } = useBUCosts();
  const { data: premises } = usePricingPremises();

  const effectivePremises = premises ?? {
    tax_pct: DEFAULT_PREMISES.tax_pct,
    commission_pct: DEFAULT_PREMISES.commission_pct,
    target_margin_pct: DEFAULT_PREMISES.target_margin_pct,
  };

  const buCostMap = useMemo(() => {
    const map = new Map<string, BUCostRow>();
    (buCosts ?? []).forEach((b) => map.set(b.bu, b));
    return map;
  }, [buCosts]);

  const { chartData, buNames, averageRows } = useMemo(() => {
    if (!services?.length) {
      return { chartData: [], buNames: [], averageRows: [] };
    }

    const chart = buildChartData(services, buCostMap, effectivePremises);

    const buGroups = new Map<string, PricingServiceRow[]>();
    services.forEach((s) => {
      const bu = s.bu ?? "Outros";
      if (!buGroups.has(bu)) buGroups.set(bu, []);
      buGroups.get(bu)!.push(s);
    });

    const avgRows: AveragePriceRow[] = [];
    buGroups.forEach((buServices, bu) => {
      const prices = buServices.map((s) => {
        const c = computeServicePricing(s, buCostMap, effectivePremises);
        return c.suggested_price;
      });
      avgRows.push({
        bu,
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: buServices.length,
      });
    });

    return {
      chartData: chart,
      buNames: Array.from(buGroups.keys()),
      averageRows: avgRows.sort((a, b) => b.avgPrice - a.avgPrice),
    };
  }, [services, buCostMap, effectivePremises]);

  const isLoading = loadingServices || loadingBU;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Line chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconTrendingUp size={18} className="text-zinc-500" />
            Evolução de Preços por BU (últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-400">
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v as number)}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e4e4e7",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                {buNames.map((bu) => (
                  <Line
                    key={bu}
                    type="monotone"
                    dataKey={bu}
                    stroke={getBUColor(bu)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Average by BU table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preço Médio por BU</CardTitle>
        </CardHeader>
        <CardContent>
          {averageRows.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              Cadastre serviços e custos de BU para ver análise de preços.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-zinc-500">BU</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Serviços</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Mínimo</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Médio</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Máximo</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Tendência</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {averageRows.map((row) => {
                    // Simulated trend: compare avg with min (as proxy for historical)
                    const trendPct = ((row.avgPrice - row.minPrice) / row.minPrice) * 100;
                    return (
                      <tr key={row.bu} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getBUColor(row.bu) }}
                            />
                            <span className="font-medium text-zinc-900">{row.bu}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500">{row.count}</td>
                        <td className="px-4 py-3 text-right text-zinc-600 font-mono">
                          {formatCurrency(row.minPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium font-mono">
                          {formatCurrency(row.avgPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 font-mono">
                          {formatCurrency(row.maxPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <TrendBadge pct={trendPct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All price changes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tabela de Preços por Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {!services?.length ? (
            <div className="text-center py-8 text-zinc-400 text-sm">Nenhum serviço ativo.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-zinc-500">Serviço</th>
                    <th className="text-left px-4 py-2.5 font-medium text-zinc-500">BU</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Horas</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Custo direto</th>
                    <th className="text-right px-4 py-2.5 font-medium text-zinc-500">Preço sugerido</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map((s) => {
                    const c = computeServicePricing(s, buCostMap, effectivePremises);
                    return (
                      <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900">{s.name}</td>
                        <td className="px-4 py-3">
                          {s.bu && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ color: getBUColor(s.bu) }}
                            >
                              {s.bu}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500">
                          {s.hours_estimated ?? "—"}h
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-600">
                          {formatCurrency(c.direct_cost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#E85102]">
                          {formatCurrency(c.suggested_price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
