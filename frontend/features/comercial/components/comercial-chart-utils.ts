import { formatCurrency } from "@/features/comercial/lib/format-currency";

// ── Compact number formatter ────────────────────────────────────────────────────
export function fmtCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

// ── Percentage formatter ────────────────────────────────────────────────────────
export function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

// ── Recharts tooltip currency formatter ────────────────────────────────────────
// Recharts v3 Formatter expects (value?: number, name?: string, ...) — wrap for safety
export function currencyFormatter(
  value: number | undefined,
  name: string | undefined,
): [string, string] {
  return [formatCurrency(value ?? 0), name ?? ""];
}

// ── Shared color palette for product bar charts ─────────────────────────────────
export const PRODUCT_BAR_COLORS = [
  "hsl(262 60% 60%)", "hsl(213 90% 60%)", "hsl(160 60% 45%)",
  "hsl(35 90% 55%)", "hsl(340 60% 55%)", "hsl(190 70% 45%)",
  "hsl(280 50% 55%)", "hsl(100 50% 45%)", "hsl(15 80% 55%)",
  "hsl(230 60% 60%)",
];
