import type { ClientRevenue } from "@/features/founder-dashboard/services/founder-dashboard";

// ── Types & constants ───────────────────────────────────────────────────────

export type RiskLevel = "baixo" | "moderado" | "alto";

export interface PieSlice {
  name: string;
  value: number;
  pct: number;
}

export const PIE_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#94a3b8",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

export function fmt(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export function calcHHI(clients: ClientRevenue[]): number {
  return Math.round(clients.reduce((s, c) => s + c.pctTotal * c.pctTotal, 0));
}

export function getRiskLevel(top3Pct: number): RiskLevel {
  if (top3Pct < 50) return "baixo";
  if (top3Pct < 70) return "moderado";
  return "alto";
}

export function toPieData(data: ClientRevenue[], topN: number): PieSlice[] {
  const displayed = data.slice(0, topN);
  const outros = data.slice(topN);
  const outrosReceita = outros.reduce((s, c) => s + c.receita, 0);
  const totalReceita = data.reduce((s, c) => s + c.receita, 0);
  const outrosPct = totalReceita > 0 ? (outrosReceita / totalReceita) * 100 : 0;

  const slices: PieSlice[] = displayed.map((c) => ({
    name: c.client,
    value: c.receita,
    pct: c.pctTotal,
  }));

  if (outros.length > 0) {
    slices.push({
      name: `Outros (${outros.length})`,
      value: outrosReceita,
      pct: outrosPct,
    });
  }

  return slices;
}
