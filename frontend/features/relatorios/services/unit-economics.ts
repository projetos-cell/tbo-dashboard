import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UnitEconomics {
  cac: number;                      // Customer Acquisition Cost (R$)
  ltv: number;                      // Lifetime Value (R$)
  ltv_cac_ratio: number;            // LTV / CAC
  payback_period_months: number;    // CAC / (revenue_per_client / 12)
  avg_project_value: number;        // Average deal value
  revenue_per_employee: number;     // Total revenue / headcount
  profit_per_employee: number;      // Profit / headcount
  total_revenue: number;
  total_expenses: number;
  gross_profit: number;
  headcount: number;
  new_clients_period: number;
  marketing_spend: number;
  computed_at: string;
}

// ── CAC ───────────────────────────────────────────────────────────────────────

export async function getCAC(
  supabase: UntypedClient
): Promise<{ cac: number; marketing_spend: number; new_clients: number }> {
  const currentYear = new Date().getFullYear();
  const start = `${currentYear}-01-01`;
  const end = `${currentYear}-12-31`;

  // Marketing spend from finance_transactions with category "marketing"
  const { data: marketingRows, error: marketingError } = await supabase
    .from("finance_transactions")
    .select("amount")
    .eq("type", "expense")
    .ilike("description", "%marketing%")
    .gte("date", start)
    .lte("date", end);

  if (marketingError) throw marketingError;

  const marketing_spend = (marketingRows ?? []).reduce(
    (s, r) => s + Number(r.amount ?? 0),
    0
  );

  // New clients from crm_deals won this year
  const { data: dealsRows, error: dealsError } = await supabase
    .from("crm_deals")
    .select("id")
    .eq("stage", "won")
    .gte("updated_at", start)
    .lte("updated_at", end);

  if (dealsError) throw dealsError;

  const new_clients = (dealsRows ?? []).length;
  const cac = new_clients > 0 ? marketing_spend / new_clients : 0;

  return { cac, marketing_spend, new_clients };
}

// ── LTV ───────────────────────────────────────────────────────────────────────

export async function getLTV(
  supabase: UntypedClient
): Promise<{ ltv: number; avg_revenue_per_client: number; avg_lifespan_months: number }> {
  // Average revenue per closed deal
  const { data: dealsRows, error: dealsError } = await supabase
    .from("crm_deals")
    .select("value")
    .eq("stage", "won");

  if (dealsError) throw dealsError;

  const values = (dealsRows ?? []).map((r) => Number(r.value ?? 0));
  const avg_revenue_per_client =
    values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;

  // Estimate average lifespan from repeat deals per company
  // Simplified: assume 18 months average retention for agency model
  const avg_lifespan_months = 18;

  const ltv = avg_revenue_per_client * (avg_lifespan_months / 12);

  return { ltv, avg_revenue_per_client, avg_lifespan_months };
}

// ── Revenue per Employee ──────────────────────────────────────────────────────

export async function getRevenuePerEmployee(
  supabase: UntypedClient
): Promise<{ revenue_per_employee: number; profit_per_employee: number; total_revenue: number; total_expenses: number; headcount: number }> {
  const currentYear = new Date().getFullYear();
  const start = `${currentYear}-01-01`;
  const end = `${currentYear}-12-31`;

  const [financeResult, headcountResult] = await Promise.all([
    supabase
      .from("finance_transactions")
      .select("amount, type")
      .gte("date", start)
      .lte("date", end),
    supabase
      .from("profiles")
      .select("id")
      .eq("is_active", true),
  ]);

  if (financeResult.error) throw financeResult.error;
  if (headcountResult.error) throw headcountResult.error;

  const total_revenue = (financeResult.data ?? [])
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const total_expenses = (financeResult.data ?? [])
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const headcount = (headcountResult.data ?? []).length;

  const revenue_per_employee = headcount > 0 ? total_revenue / headcount : 0;
  const profit_per_employee =
    headcount > 0 ? (total_revenue - total_expenses) / headcount : 0;

  return {
    revenue_per_employee,
    profit_per_employee,
    total_revenue,
    total_expenses,
    headcount,
  };
}

// ── Full Unit Economics ────────────────────────────────────────────────────────

export async function getUnitEconomics(
  supabase: UntypedClient
): Promise<UnitEconomics> {
  const [cacData, ltvData, revenueData] = await Promise.all([
    getCAC(supabase),
    getLTV(supabase),
    getRevenuePerEmployee(supabase),
  ]);

  // Average project value from won deals
  const { data: dealsRows } = await supabase
    .from("crm_deals")
    .select("value")
    .eq("stage", "won");

  const dealValues = (dealsRows ?? []).map((r) => Number(r.value ?? 0));
  const avg_project_value =
    dealValues.length > 0
      ? dealValues.reduce((s, v) => s + v, 0) / dealValues.length
      : 0;

  const { cac, marketing_spend, new_clients } = cacData;
  const { ltv } = ltvData;
  const {
    revenue_per_employee,
    profit_per_employee,
    total_revenue,
    total_expenses,
    headcount,
  } = revenueData;

  const ltv_cac_ratio = cac > 0 ? ltv / cac : 0;

  // Payback = CAC / monthly revenue per client
  const monthly_revenue_per_client =
    revenueData.total_revenue > 0 && new_clients > 0
      ? revenueData.total_revenue / new_clients / 12
      : 0;
  const payback_period_months =
    monthly_revenue_per_client > 0 ? cac / monthly_revenue_per_client : 0;

  return {
    cac,
    ltv,
    ltv_cac_ratio,
    payback_period_months,
    avg_project_value,
    revenue_per_employee,
    profit_per_employee,
    total_revenue,
    total_expenses,
    gross_profit: total_revenue - total_expenses,
    headcount,
    new_clients_period: new_clients,
    marketing_spend,
    computed_at: new Date().toISOString(),
  };
}
