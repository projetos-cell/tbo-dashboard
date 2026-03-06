"use client";

import type { ClientRevenue } from "@/services/founder-dashboard";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

function calcHHI(clients: ClientRevenue[]): number {
  return Math.round(clients.reduce((s, c) => s + c.pctTotal * c.pctTotal, 0));
}

type RiskLevel = "baixo" | "moderado" | "alto";

function getRiskLevel(top3Pct: number): RiskLevel {
  if (top3Pct < 50) return "baixo";
  if (top3Pct < 70) return "moderado";
  return "alto";
}

const BAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-pink-500",
  "bg-cyan-500",
];

// ── Sub-components ─────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { label: string; className: string }> = {
    baixo: {
      label: "Risco Baixo",
      className:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    },
    moderado: {
      label: "Risco Moderado",
      className:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    },
    alto: {
      label: "Risco Alto",
      className:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    },
  };

  const { label, className } = config[level];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-5 w-24 bg-muted rounded-full" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-2 w-full bg-muted rounded-full" />
        </div>
      ))}
      <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-full bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

interface RevenueConcentrationProps {
  /** Full sorted client list (all clients, descending by receita). */
  data: ClientRevenue[];
  isLoading?: boolean;
  /** How many named bars to show before collapsing the rest into "Outros". */
  topN?: number;
  className?: string;
}

export function RevenueConcentration({
  data,
  isLoading = false,
  topN = 7,
  className = "",
}: RevenueConcentrationProps) {
  if (isLoading) return <LoadingSkeleton />;

  const isEmpty = data.length === 0;

  // Derived metrics
  const displayed = data.slice(0, topN);
  const outros = data.slice(topN);
  const outrosReceita = outros.reduce((s, c) => s + c.receita, 0);
  const totalReceita = data.reduce((s, c) => s + c.receita, 0);
  const outrosPct = totalReceita > 0 ? (outrosReceita / totalReceita) * 100 : 0;

  const top1Pct = data[0]?.pctTotal ?? 0;
  const top3Pct = data.slice(0, 3).reduce((s, c) => s + c.pctTotal, 0);
  const top5Pct = data.slice(0, 5).reduce((s, c) => s + c.pctTotal, 0);
  const hhi = calcHHI(data);
  const riskLevel = getRiskLevel(top3Pct);

  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">
          Concentração de Receita
        </h3>
        {!isEmpty && <RiskBadge level={riskLevel} />}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nenhuma receita registrada no período.
        </p>
      ) : (
        <>
          {/* Client bars */}
          <div className="space-y-3">
            {displayed.map((c, i) => (
              <div key={c.client} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs text-foreground truncate max-w-[55%]"
                    title={c.client}
                  >
                    {c.client}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {fmt(c.receita)}&nbsp;·&nbsp;{c.pctTotal.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${BAR_COLORS[i] ?? BAR_COLORS[BAR_COLORS.length - 1]}`}
                    style={{ width: `${Math.min(c.pctTotal, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Outros bucket */}
            {outros.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    Outros ({outros.length} cliente{outros.length !== 1 ? "s" : ""})
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {fmt(outrosReceita)}&nbsp;·&nbsp;{outrosPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ width: `${Math.min(outrosPct, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer metrics */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {/* Top 1 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top&nbsp;1</span>
                <span className="text-xs font-medium text-foreground">
                  {top1Pct.toFixed(1)}%
                </span>
              </div>

              {/* Top 3 — colored by risk */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top&nbsp;3</span>
                <span
                  className={`text-xs font-medium ${
                    riskLevel === "alto"
                      ? "text-red-600 dark:text-red-400"
                      : riskLevel === "moderado"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {top3Pct.toFixed(1)}%
                </span>
              </div>

              {/* Top 5 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top&nbsp;5</span>
                <span className="text-xs font-medium text-foreground">
                  {top5Pct.toFixed(1)}%
                </span>
              </div>

              {/* HHI — colored by concentration */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">HHI</span>
                <span
                  className={`text-xs font-medium ${
                    hhi > 2500
                      ? "text-red-600 dark:text-red-400"
                      : hhi > 1500
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {hhi.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {data.length} cliente{data.length !== 1 ? "s" : ""} com receita no período
            </p>
          </div>
        </>
      )}
    </div>
  );
}
