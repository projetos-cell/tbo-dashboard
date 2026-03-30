import type { SupabaseClient } from "@supabase/supabase-js";

type UntypedClient = SupabaseClient;

// ── Types ─────────────────────────────────────────────────────────────────────

export type YoYMetric =
  | "revenue"
  | "expenses"
  | "margin"
  | "deals_won"
  | "projects_completed"
  | "headcount";

export interface MonthlyData {
  month: number; // 1-12
  label: string; // "Jan", "Fev", ...
  value: number;
}

export interface YoYResult {
  metric: YoYMetric;
  label: string;
  currentYear: MonthlyData[];
  previousYear: MonthlyData[];
  current_total: number;
  previous_total: number;
  change_pct: number;
}

export interface YoYSummary {
  revenue: YoYResult;
  expenses: YoYResult;
  margin: YoYResult;
  deals_won: YoYResult;
  projects_completed: YoYResult;
  headcount: YoYResult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function emptyMonthly(): MonthlyData[] {
  return MONTH_LABELS.map((label, i) => ({ month: i + 1, label, value: 0 }));
}

export function computeYoYChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ── Revenue & Expenses ────────────────────────────────────────────────────────

async function fetchFinanceByYear(
  supabase: UntypedClient,
  year: number,
  type: "income" | "expense"
): Promise<MonthlyData[]> {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("amount, date")
    .eq("type", type)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`);

  if (error) throw error;

  const monthly = emptyMonthly();
  for (const row of data ?? []) {
    const m = new Date(String(row.date)).getMonth(); // 0-indexed
    monthly[m].value += Number(row.amount ?? 0);
  }
  return monthly;
}

// ── Deals Won ─────────────────────────────────────────────────────────────────

async function fetchDealsWonByYear(
  supabase: UntypedClient,
  year: number
): Promise<MonthlyData[]> {
  const { data, error } = await supabase
    .from("crm_deals")
    .select("value, updated_at")
    .eq("stage", "won")
    .gte("updated_at", `${year}-01-01`)
    .lte("updated_at", `${year}-12-31`);

  if (error) throw error;

  const monthly = emptyMonthly();
  for (const row of data ?? []) {
    const m = new Date(String(row.updated_at)).getMonth();
    monthly[m].value += Number(row.value ?? 0);
  }
  return monthly;
}

// ── Projects Completed ────────────────────────────────────────────────────────

async function fetchProjectsCompletedByYear(
  supabase: UntypedClient,
  year: number
): Promise<MonthlyData[]> {
  const { data, error } = await supabase
    .from("os_tasks")
    .select("updated_at")
    .eq("status", "done")
    .gte("updated_at", `${year}-01-01`)
    .lte("updated_at", `${year}-12-31`);

  if (error) throw error;

  const monthly = emptyMonthly();
  for (const row of data ?? []) {
    const m = new Date(String(row.updated_at)).getMonth();
    monthly[m].value += 1;
  }
  return monthly;
}

// ── Headcount ─────────────────────────────────────────────────────────────────

async function fetchHeadcountForYear(
  supabase: UntypedClient,
  year: number
): Promise<MonthlyData[]> {
  // Use current headcount for current year; for previous, check collaborator_history
  const { data, error } = await supabase
    .from("profiles")
    .select("created_at, is_active");

  if (error) throw error;

  const monthly = emptyMonthly();
  for (let m = 0; m < 12; m++) {
    const monthEnd = new Date(year, m + 1, 0);
    const count = (data ?? []).filter((p) => {
      const created = new Date(String(p.created_at));
      return created <= monthEnd;
    }).length;
    monthly[m].value = count;
  }
  return monthly;
}

// ── Main API ──────────────────────────────────────────────────────────────────

export async function getYoYMetrics(
  supabase: UntypedClient,
  metric: YoYMetric
): Promise<YoYResult> {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  let currentYearData: MonthlyData[];
  let previousYearData: MonthlyData[];
  let label: string;

  switch (metric) {
    case "revenue": {
      label = "Receita";
      [currentYearData, previousYearData] = await Promise.all([
        fetchFinanceByYear(supabase, currentYear, "income"),
        fetchFinanceByYear(supabase, previousYear, "income"),
      ]);
      break;
    }

    case "expenses": {
      label = "Despesas";
      [currentYearData, previousYearData] = await Promise.all([
        fetchFinanceByYear(supabase, currentYear, "expense"),
        fetchFinanceByYear(supabase, previousYear, "expense"),
      ]);
      break;
    }

    case "margin": {
      label = "Margem";
      const [curRev, prevRev, curExp, prevExp] = await Promise.all([
        fetchFinanceByYear(supabase, currentYear, "income"),
        fetchFinanceByYear(supabase, previousYear, "income"),
        fetchFinanceByYear(supabase, currentYear, "expense"),
        fetchFinanceByYear(supabase, previousYear, "expense"),
      ]);
      currentYearData = curRev.map((r, i) => ({
        ...r,
        value: r.value - curExp[i].value,
      }));
      previousYearData = prevRev.map((r, i) => ({
        ...r,
        value: r.value - prevExp[i].value,
      }));
      break;
    }

    case "deals_won": {
      label = "Negócios Fechados";
      [currentYearData, previousYearData] = await Promise.all([
        fetchDealsWonByYear(supabase, currentYear),
        fetchDealsWonByYear(supabase, previousYear),
      ]);
      break;
    }

    case "projects_completed": {
      label = "Tarefas Concluídas";
      [currentYearData, previousYearData] = await Promise.all([
        fetchProjectsCompletedByYear(supabase, currentYear),
        fetchProjectsCompletedByYear(supabase, previousYear),
      ]);
      break;
    }

    case "headcount": {
      label = "Headcount";
      [currentYearData, previousYearData] = await Promise.all([
        fetchHeadcountForYear(supabase, currentYear),
        fetchHeadcountForYear(supabase, previousYear),
      ]);
      break;
    }
  }

  const current_total = currentYearData.reduce((s, d) => s + d.value, 0);
  const previous_total = previousYearData.reduce((s, d) => s + d.value, 0);

  return {
    metric,
    label,
    currentYear: currentYearData,
    previousYear: previousYearData,
    current_total,
    previous_total,
    change_pct: computeYoYChange(current_total, previous_total),
  };
}

export async function getYoYSummary(
  supabase: UntypedClient
): Promise<YoYSummary> {
  const metrics: YoYMetric[] = [
    "revenue",
    "expenses",
    "margin",
    "deals_won",
    "projects_completed",
    "headcount",
  ];

  const results = await Promise.all(
    metrics.map((m) => getYoYMetrics(supabase, m))
  );

  return {
    revenue: results[0],
    expenses: results[1],
    margin: results[2],
    deals_won: results[3],
    projects_completed: results[4],
    headcount: results[5],
  };
}
