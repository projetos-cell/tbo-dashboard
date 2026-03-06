"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProjectMargin } from "@/services/founder-dashboard";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function ProjectTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProjectMargin }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isLow = d.margemPct < 30;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md space-y-1">
      <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
        {d.project}
      </p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-xs text-muted-foreground">Receita:</span>
        <span className="text-xs font-semibold">{fmt(d.receita)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
        <span className="text-xs text-muted-foreground">Custos:</span>
        <span className="text-xs font-semibold">{fmt(d.custos)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
        <span className="text-xs text-muted-foreground">Margem:</span>
        <span
          className={`text-xs font-bold ${
            isLow ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {fmtPct(d.margemPct)}
        </span>
      </div>
    </div>
  );
}

// ── Custom Legend ─────────────────────────────────────────────────────────────

function ProjectLegend() {
  return (
    <div className="flex items-center justify-center gap-4 mt-1">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
        <span className="text-xs text-muted-foreground">Receita</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
        <span className="text-xs text-muted-foreground">Custos</span>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface TopProjectsTableProps {
  data: ProjectMargin[];
  isLoading?: boolean;
}

export function TopProjectsTable({ data, isLoading }: TopProjectsTableProps) {
  // Truncate long project names for chart display
  const chartData = data.map((row) => ({
    ...row,
    shortName:
      row.project.length > 18
        ? row.project.slice(0, 16) + "…"
        : row.project,
  }));

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Top Projetos por Margem</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Informacoes do bloco"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm space-y-1" side="top">
            <p className="font-medium">Top Projetos por Margem</p>
            <p className="text-xs text-muted-foreground">
              Considera somente transacoes com projeto definido (tag/campo).
            </p>
            <p className="text-xs text-muted-foreground">
              Se nao houver &quot;projeto&quot; no Omie, o estado vazio sera
              exibido.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhum projeto com transacoes no periodo.
        </p>
      ) : (
        <>
          {/* Grouped Bar Chart — receita vs custos */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              >
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return String(v);
                  }}
                  width={45}
                />
                <Tooltip
                  content={<ProjectTooltip />}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                />
                <Bar
                  dataKey="receita"
                  name="Receita"
                  fill="#10b981"
                  fillOpacity={0.8}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="custos"
                  name="Custos"
                  fill="#f87171"
                  fillOpacity={0.7}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ProjectLegend />

          {/* Summary rows below chart */}
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            {data.map((row) => {
              const isLow = row.margemPct < 30;
              return (
                <div
                  key={row.project}
                  className={`flex items-center justify-between gap-2 px-1.5 py-1 rounded ${
                    isLow ? "bg-red-500/5" : ""
                  }`}
                >
                  <span
                    className="text-xs text-foreground truncate max-w-[45%]"
                    title={row.project}
                  >
                    {row.project}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {fmt(row.receita)}
                    </span>
                    <span className="text-xs text-red-500 dark:text-red-400">
                      {fmt(row.custos)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isLow
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {fmtPct(row.margemPct)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
