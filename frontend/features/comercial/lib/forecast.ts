import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

export interface ForecastMonth {
  month: string; // "YYYY-MM"
  label: string; // "Abr/26"
  pessimista: number;
  realista: number;
  otimista: number;
  dealCount: number;
}

export interface ForecastSummary {
  currentMonth: ForecastMonth | null;
  months: ForecastMonth[];
  totalPessimista: number;
  totalRealista: number;
  totalOtimista: number;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]}/${year.slice(2)}`;
}

export function computeForecast(deals: DealRow[]): ForecastSummary {
  const active = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  );

  const buckets = new Map<string, { pessimista: number; realista: number; otimista: number; count: number }>();

  const now = new Date();
  const currentMonthKey = monthKey(now);

  for (const deal of active) {
    const value = deal.value ?? 0;
    const probability = (deal.probability ?? 50) / 100;
    const closeDate = deal.expected_close ? new Date(deal.expected_close) : now;
    const key = monthKey(closeDate);

    const bucket = buckets.get(key) ?? { pessimista: 0, realista: 0, otimista: 0, count: 0 };
    bucket.otimista += value;
    bucket.realista += value * probability;
    if ((deal.probability ?? 0) > 70) bucket.pessimista += value;
    bucket.count++;
    buckets.set(key, bucket);
  }

  const months = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      month: key,
      label: monthLabel(key),
      pessimista: Math.round(v.pessimista),
      realista: Math.round(v.realista),
      otimista: Math.round(v.otimista),
      dealCount: v.count,
    }));

  const currentMonth = months.find((m) => m.month === currentMonthKey) ?? null;

  return {
    currentMonth,
    months,
    totalPessimista: months.reduce((s, m) => s + m.pessimista, 0),
    totalRealista: months.reduce((s, m) => s + m.realista, 0),
    totalOtimista: months.reduce((s, m) => s + m.otimista, 0),
  };
}
