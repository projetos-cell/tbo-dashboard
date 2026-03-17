"use client";

import { useState, useMemo } from "react";
import {
  IconTargetArrow,
  IconX,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useChannelAttribution } from "@/features/marketing/hooks/use-marketing-analytics";
import type { ChannelAttribution } from "@/features/marketing/types/marketing";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────

type Period = "mes_atual" | "30d" | "trimestre";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "30d", label: "Últimos 30d" },
  { value: "trimestre", label: "Trimestre" },
];

// ─── Helpers ───────────────────────────────────────────────────────

const fmt = (v: number) =>
  `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

function roiColor(roi: number) {
  if (roi >= 3) return "bg-green-500/10 text-green-600 border-green-200";
  if (roi >= 1) return "bg-amber-500/10 text-amber-600 border-amber-200";
  return "bg-red-500/10 text-red-600 border-red-200";
}

// ─── ROI Chart ─────────────────────────────────────────────────────

function RoiBarChart({ data }: { data: ChannelAttribution[] }) {
  const chartData = data.map((ch) => ({
    name: ch.channel,
    roi: Number(ch.roi.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">ROI por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}x`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                formatter={(value: unknown) => [`${typeof value === "number" ? value : 0}x`, "ROI"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "breakeven", position: "right", fontSize: 10 }} />
              <Bar
                dataKey="roi"
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Attribution Table ─────────────────────────────────────────────

function AttributionTable({ data }: { data: ChannelAttribution[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tabela de Atribuição</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Canal</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Leads</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Oportunidades</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vendas</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Receita</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Custo</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((ch) => (
                <tr key={ch.channel} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium capitalize">{ch.channel}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{ch.leads.toLocaleString("pt-BR")}</td>
                  <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">
                    {ch.opportunities.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{ch.deals_won.toLocaleString("pt-BR")}</td>
                  <td className="hidden px-4 py-3 text-right tabular-nums lg:table-cell">{fmt(ch.revenue)}</td>
                  <td className="hidden px-4 py-3 text-right tabular-nums lg:table-cell">{fmt(ch.cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${roiColor(ch.roi)}`}
                    >
                      {ch.roi.toFixed(1)}x
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/20 border-t">
              <tr>
                <td className="px-4 py-2 text-xs font-semibold text-muted-foreground">Total</td>
                <td className="px-4 py-2 text-right text-xs tabular-nums font-semibold">
                  {data.reduce((s, c) => s + c.leads, 0).toLocaleString("pt-BR")}
                </td>
                <td className="hidden px-4 py-2 text-right text-xs tabular-nums font-semibold md:table-cell">
                  {data.reduce((s, c) => s + c.opportunities, 0).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-2 text-right text-xs tabular-nums font-semibold">
                  {data.reduce((s, c) => s + c.deals_won, 0).toLocaleString("pt-BR")}
                </td>
                <td className="hidden px-4 py-2 text-right text-xs tabular-nums font-semibold lg:table-cell">
                  {fmt(data.reduce((s, c) => s + c.revenue, 0))}
                </td>
                <td className="hidden px-4 py-2 text-right text-xs tabular-nums font-semibold lg:table-cell">
                  {fmt(data.reduce((s, c) => s + c.cost, 0))}
                </td>
                <td className="px-4 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Content ──────────────────────────────────────────────────

function AttributionContent() {
  const [period, setPeriod] = useState<Period>("mes_atual");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const { data: attribution, isLoading, error, refetch } = useChannelAttribution();

  // Derive available channels from data
  const availableChannels = useMemo(
    () => Array.from(new Set((attribution ?? []).map((c) => c.channel))).sort(),
    [attribution],
  );

  // Filtered data
  const filtered = useMemo(() => {
    const base = attribution ?? [];
    if (selectedChannels.length === 0) return base;
    return base.filter((c) => selectedChannels.includes(c.channel));
  }, [attribution, selectedChannels]);

  function toggleChannel(ch: string) {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function clearFilters() {
    setSelectedChannels([]);
  }

  const hasActiveFilters = selectedChannels.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atribuição por Canal</h1>
          <p className="text-sm text-muted-foreground">
            Canal → Lead → Venda: atribuição de receita por canal de marketing.
          </p>
        </div>
        {/* Period filter — #58 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
              className="h-7 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Channel filter chips — #58 */}
      {availableChannels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Canal:</span>
          {availableChannels.map((ch) => {
            const active = selectedChannels.includes(ch);
            return (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border transition-colors ${
                  active
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {ch}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-3" />
              Limpar
            </button>
          )}
        </div>
      )}

      {error ? (
        <ErrorState message="Erro ao carregar atribuição." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : !attribution || attribution.length === 0 ? (
        <EmptyState
          icon={IconTargetArrow}
          title="Sem dados de atribuição"
          description="Dados de atribuição aparecerão aqui quando houver leads e vendas rastreados por canal."
        />
      ) : (
        <div className="space-y-4">
          {/* ROI Bar Chart — #57 */}
          <RoiBarChart data={filtered.length > 0 ? filtered : (attribution ?? [])} />

          {/* Attribution Table — #56 */}
          <AttributionTable data={filtered.length > 0 ? filtered : (attribution ?? [])} />
        </div>
      )}
    </div>
  );
}

export default function AttributionPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <AttributionContent />
    </RequireRole>
  );
}
