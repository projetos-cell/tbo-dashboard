import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FinanceTransaction {
  id: string;
  tenant_id: string;
  type: "receita" | "despesa" | "transferencia";
  status: "previsto" | "provisionado" | "pago" | "liquidado" | "parcial" | "atrasado" | "recorrente" | "cancelado";
  description: string;
  notes: string | null;
  tags: string[];
  amount: number;
  paid_amount: number;
  date: string;
  due_date: string | null;
  paid_date: string | null;
  category_id: string | null;
  cost_center_id: string | null;
  project_id: string | null;
  counterpart: string | null;
  counterpart_doc: string | null;
  payment_method: string | null;
  bank_account: string | null;
  omie_id: string | null;
  omie_synced_at: string | null;
  business_unit: string | null;
  responsible_id: string | null;
  omie_raw: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  tenant_id: string;
  name: string;
  type: "receita" | "despesa";
  omie_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceCostCenter {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  omie_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceSnapshot {
  id: string;
  tenant_id: string;
  snapshot_date: string;
  total_receitas: number;
  total_despesas: number;
  saldo_dia: number;
  saldo_acumulado: number;
  payables_open: number;
  receivables_open: number;
  created_at: string;
}

export interface FinanceStatus {
  totalTransactions: number;
  totalReceitas: number;
  totalDespesas: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  lastSyncAt: string | null;
  categoriesCount: number;
  costCentersCount: number;
}

export interface FinanceSyncResult {
  ok: boolean;
  message: string;
  inserted?: number;
  updated?: number;
  errors?: string[];
}

export interface FinanceFilters {
  type?: "receita" | "despesa" | "transferencia";
  typeIn?: string[];
  status?: string;
  statusIn?: string[];
  category_id?: string;
  cost_center_id?: string;
  business_unit?: string;
  project_id?: string;
  dateFrom?: string;
  dateTo?: string;
  dateField?: "date" | "paid_date";
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── Supabase query helpers ────────────────────────────────────────────────────

const TABLE_TRANSACTIONS = "finance_transactions";
const TABLE_CATEGORIES = "finance_categories";
const TABLE_COST_CENTERS = "finance_cost_centers";
const TABLE_SNAPSHOTS = "finance_snapshots_daily";
const TABLE_CASH_ENTRIES = "fin_cash_entries";
const TABLE_BANK_STATEMENTS = "finance_bank_statements";

export async function getFinanceTransactions(
  supabase: SupabaseClient<Database>,
  filters: FinanceFilters = {}
): Promise<{ data: FinanceTransaction[]; count: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_TRANSACTIONS)
    .select("*", { count: "exact" })
    .order("date", { ascending: false });

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.typeIn?.length) query = query.in("type", filters.typeIn);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.statusIn?.length) query = query.in("status", filters.statusIn);
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.cost_center_id)
    query = query.eq("cost_center_id", filters.cost_center_id);
  if (filters.business_unit)
    query = query.eq("business_unit", filters.business_unit);
  if (filters.project_id)
    query = query.eq("project_id", filters.project_id);
  if (filters.dateField === "paid_date") {
    if (filters.dateFrom && filters.dateTo) {
      query = query.or(
        `and(paid_date.gte.${filters.dateFrom},paid_date.lte.${filters.dateTo}),` +
        `and(paid_date.is.null,date.gte.${filters.dateFrom},date.lte.${filters.dateTo})`
      );
    } else if (filters.dateFrom) {
      query = query.or(
        `paid_date.gte.${filters.dateFrom},and(paid_date.is.null,date.gte.${filters.dateFrom})`
      );
    } else if (filters.dateTo) {
      query = query.or(
        `paid_date.lte.${filters.dateTo},and(paid_date.is.null,date.lte.${filters.dateTo})`
      );
    }
  } else {
    if (filters.dateFrom) query = query.gte("date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("date", filters.dateTo);
  }
  if (filters.search)
    query = query.ilike("description", `%${filters.search}%`);

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as FinanceTransaction[],
    count: count ?? 0,
  };
}

export async function getFinanceCategories(
  supabase: SupabaseClient<Database>,
  activeOnly = true
): Promise<FinanceCategory[]> {
  let query = supabase
    .from(TABLE_CATEGORIES)
    .select("*")
    .order("name");

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceCategory[];
}

export async function getFinanceCostCenters(
  supabase: SupabaseClient<Database>,
  activeOnly = true
): Promise<FinanceCostCenter[]> {
  let query = supabase
    .from(TABLE_COST_CENTERS)
    .select("*")
    .order("code");

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceCostCenter[];
}

export async function getFinanceSnapshots(
  supabase: SupabaseClient<Database>,
  days = 30
): Promise<FinanceSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from(TABLE_SNAPSHOTS)
    .select("*")
    .gte("snapshot_date", sinceStr)
    .order("snapshot_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FinanceSnapshot[];
}

export async function getFinanceStatus(
  supabase: SupabaseClient<Database>
): Promise<FinanceStatus> {
  // Fetch all in parallel
  const [txRes, catRes, ccRes] = await Promise.all([
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("type, status, omie_synced_at", { count: "exact" }),
    supabase
      .from(TABLE_CATEGORIES)
      .select("id", { count: "exact" })
      .eq("is_active", true),
    supabase
      .from(TABLE_COST_CENTERS)
      .select("id", { count: "exact" })
      .eq("is_active", true),
  ]);

  const transactions = (txRes.data ?? []) as Array<{
    type: string;
    status: string;
    omie_synced_at: string | null;
  }>;

  const receitas = transactions.filter((t) => t.type === "receita").length;
  const despesas = transactions.filter((t) => t.type === "despesa").length;
  const pending = transactions.filter((t) => t.status === "previsto" || t.status === "provisionado").length;
  const paid = transactions.filter((t) => t.status === "pago" || t.status === "liquidado" || t.status === "parcial").length;
  const overdue = transactions.filter((t) => t.status === "atrasado").length;

  // Find most recent sync timestamp
  const syncDates = transactions
    .map((t) => t.omie_synced_at)
    .filter(Boolean)
    .sort()
    .reverse();

  return {
    totalTransactions: txRes.count ?? 0,
    totalReceitas: receitas,
    totalDespesas: despesas,
    pendingCount: pending,
    paidCount: paid,
    overdueCount: overdue,
    lastSyncAt: syncDates[0] ?? null,
    categoriesCount: catRes.count ?? 0,
    costCentersCount: ccRes.count ?? 0,
  };
}

// ── Status with monetary amounts (for DateRangeFilter cards) ─────────────────

export interface FinanceStatusWithAmounts {
  /** Total valor a receber (receitas pendentes/previstas) no período */
  arCount: number;
  arAmount: number;
  /** Total valor a pagar (despesas pendentes/previstas) no período */
  apCount: number;
  apAmount: number;
  /** Pendentes (qualquer tipo) no período */
  pendingCount: number;
  /** Atrasados no período */
  overdueCount: number;
  /** Gap = arAmount - apAmount */
  gap: number;
}

export async function getFinanceStatusWithAmounts(
  supabase: SupabaseClient<Database>,
  dateFrom?: string,
  dateTo?: string
): Promise<FinanceStatusWithAmounts> {
  let query = supabase
    .from(TABLE_TRANSACTIONS)
    .select("type, status, amount, paid_amount");

  if (dateFrom) query = query.gte("date", dateFrom);
  if (dateTo) query = query.lte("date", dateTo);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Array<{
    type: string;
    status: string;
    amount: number;
    paid_amount: number;
  }>;

  const isAR = (r: typeof rows[0]) =>
    r.type === "receita" &&
    (r.status === "previsto" || r.status === "provisionado" || r.status === "atrasado");

  const isAP = (r: typeof rows[0]) =>
    r.type === "despesa" &&
    (r.status === "previsto" || r.status === "provisionado" || r.status === "atrasado");

  const isPending = (r: typeof rows[0]) =>
    r.status === "previsto" || r.status === "provisionado";

  const arRows = rows.filter(isAR);
  const apRows = rows.filter(isAP);

  const arAmount = arRows.reduce((s, r) => s + (r.paid_amount || r.amount || 0), 0);
  const apAmount = apRows.reduce((s, r) => s + (r.paid_amount || r.amount || 0), 0);

  return {
    arCount: arRows.length,
    arAmount,
    apCount: apRows.length,
    apAmount,
    pendingCount: rows.filter(isPending).length,
    overdueCount: rows.filter((r) => r.status === "atrasado").length,
    gap: arAmount - apAmount,
  };
}

// ── Founder KPI aggregations ─────────────────────────────────────────────────

export interface FounderKPIs {
  receitaMTD: number;
  despesaMTD: number;
  margemMTD: number;
  margemPct: number;
  apNext30: number;
  arNext30: number;
  saldoAcumulado: number;
  costCenterRanking: Array<{
    code: string;
    name: string;
    total: number;
  }>;
  categoryRanking: Array<{
    name: string;
    type: string;
    total: number;
  }>;
  buRevenue: Array<{
    business_unit: string;
    total: number;
  }>;
  projectRanking: Array<{
    project_id: string;
    name: string;
    receita: number;
    despesa: number;
    margem: number;
  }>;
}

export async function getFounderKPIs(
  supabase: SupabaseClient<Database>
): Promise<FounderKPIs> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toISOString().split("T")[0];
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split("T")[0];

  // Fetch MTD transactions and upcoming payables/receivables
  const [mtdRes, apRes, arRes, ccRes, latestSnap] = await Promise.all([
    // MTD paid transactions
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("type, amount, paid_amount, cost_center_id, category_id, business_unit, project_id")
      .in("status", ["pago", "provisionado", "liquidado"])
      .gte("date", monthStart)
      .lte("date", today),
    // AP next 30d (pending despesas)
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("type", "despesa")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    // AR next 30d (pending receitas)
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("type", "receita")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    // All cost centers for name lookup
    supabase
      .from(TABLE_COST_CENTERS)
      .select("id, code, name"),
    // Latest snapshot for accumulated balance
    supabase
      .from(TABLE_SNAPSHOTS)
      .select("saldo_acumulado")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const mtd = (mtdRes.data ?? []) as Array<{
    type: string;
    amount: number;
    paid_amount: number;
    cost_center_id: string | null;
    category_id: string | null;
    business_unit: string | null;
    project_id: string | null;
  }>;

  const receitaMTD = mtd
    .filter((t) => t.type === "receita")
    .reduce((s, t) => s + (t.paid_amount || t.amount || 0), 0);
  const despesaMTD = mtd
    .filter((t) => t.type === "despesa")
    .reduce((s, t) => s + (t.paid_amount || t.amount || 0), 0);
  const margemMTD = receitaMTD - despesaMTD;
  const margemPct = receitaMTD > 0 ? (margemMTD / receitaMTD) * 100 : 0;

  const apNext30 = ((apRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0),
    0
  );
  const arNext30 = ((arRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0),
    0
  );

  // Cost center ranking (top despesas)
  const ccMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "despesa" && t.cost_center_id) {
      ccMap.set(
        t.cost_center_id,
        (ccMap.get(t.cost_center_id) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }
  const ccLookup = new Map(
    ((ccRes.data ?? []) as Array<{ id: string; code: string; name: string }>).map(
      (c) => [c.id, c]
    )
  );
  const costCenterRanking = Array.from(ccMap.entries())
    .map(([id, total]) => ({
      code: ccLookup.get(id)?.code ?? "—",
      name: ccLookup.get(id)?.name ?? "Sem centro",
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Category ranking (top despesas by category)
  const catMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "despesa" && t.category_id) {
      catMap.set(
        t.category_id,
        (catMap.get(t.category_id) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }

  // Fetch category names for the top ones
  const topCatIds = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let categoryRanking: FounderKPIs["categoryRanking"] = [];
  if (topCatIds.length > 0) {
    const { data: cats } = await supabase
      .from(TABLE_CATEGORIES)
      .select("id, name, type")
      .in("id", topCatIds);
    const catLookup = new Map(
      ((cats ?? []) as Array<{ id: string; name: string; type: string }>).map(
        (c) => [c.id, c]
      )
    );
    categoryRanking = topCatIds.map((id) => ({
      name: catLookup.get(id)?.name ?? "Sem categoria",
      type: catLookup.get(id)?.type ?? "despesa",
      total: catMap.get(id) ?? 0,
    }));
  }

  // BU revenue ranking (receitas grouped by business_unit)
  const buMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "receita" && t.business_unit) {
      buMap.set(
        t.business_unit,
        (buMap.get(t.business_unit) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }
  const buRevenue = Array.from(buMap.entries())
    .map(([business_unit, total]) => ({ business_unit, total }))
    .sort((a, b) => b.total - a.total);

  // Project ranking (receita vs despesa per project)
  const projReceitaMap = new Map<string, number>();
  const projDespesaMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.project_id) {
      const val = t.paid_amount || t.amount || 0;
      if (t.type === "receita") {
        projReceitaMap.set(t.project_id, (projReceitaMap.get(t.project_id) || 0) + val);
      } else if (t.type === "despesa") {
        projDespesaMap.set(t.project_id, (projDespesaMap.get(t.project_id) || 0) + val);
      }
    }
  }
  const allProjectIds = Array.from(
    new Set([...projReceitaMap.keys(), ...projDespesaMap.keys()])
  );

  let projectRanking: FounderKPIs["projectRanking"] = [];
  if (allProjectIds.length > 0) {
    // Look up project names from the projects table
    const { data: projRows } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", allProjectIds.slice(0, 10));
    const projLookup = new Map(
      ((projRows ?? []) as Array<{ id: string; name: string }>).map((p) => [p.id, p.name])
    );
    projectRanking = allProjectIds
      .map((pid) => {
        const receita = projReceitaMap.get(pid) ?? 0;
        const despesa = projDespesaMap.get(pid) ?? 0;
        return {
          project_id: pid,
          name: projLookup.get(pid) ?? "Sem projeto",
          receita,
          despesa,
          margem: receita - despesa,
        };
      })
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10);
  }

  return {
    receitaMTD,
    despesaMTD,
    margemMTD,
    margemPct,
    apNext30,
    arNext30,
    saldoAcumulado: latestSnap.data?.saldo_acumulado ?? 0,
    costCenterRanking,
    categoryRanking,
    buRevenue,
    projectRanking,
  };
}

// ── Aging AR/AP ───────────────────────────────────────────────────────────────

export type AgingBucket = {
  label: string;
  minDays: number;
  maxDays: number;
  direction: "past" | "future"; // past = overdue, future = projected
  ar: number;
  ap: number;
  arCount: number;
  apCount: number;
};

export type FinanceAgingData = {
  buckets: AgingBucket[];
  totalAr: number;
  totalAp: number;
  totalArCount: number;
  totalApCount: number;
  // Projected AR (future — up to 12 months)
  projectedAr: number;
  projectedArCount: number;
};

type BucketDef = Omit<AgingBucket, "ar" | "ap" | "arCount" | "apCount">;

const OVERDUE_BUCKETS: BucketDef[] = [
  { label: "1–30 dias", minDays: 1, maxDays: 30, direction: "past" },
  { label: "31–60 dias", minDays: 31, maxDays: 60, direction: "past" },
  { label: "61–90 dias", minDays: 61, maxDays: 90, direction: "past" },
  { label: "90+ dias", minDays: 91, maxDays: Infinity, direction: "past" },
];

const PROJECTED_BUCKETS: BucketDef[] = [
  { label: "1–30 dias", minDays: 1, maxDays: 30, direction: "future" },
  { label: "31–60 dias", minDays: 31, maxDays: 60, direction: "future" },
  { label: "61–90 dias", minDays: 61, maxDays: 90, direction: "future" },
  { label: "3–6 meses", minDays: 91, maxDays: 180, direction: "future" },
  { label: "6–12 meses", minDays: 181, maxDays: 365, direction: "future" },
];

export async function getFinanceAging(
  supabase: SupabaseClient<Database>
): Promise<FinanceAgingData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // 12 months from today for projected AR
  const futureLimit = new Date(today);
  futureLimit.setMonth(futureLimit.getMonth() + 12);
  const futureLimitStr = futureLimit.toISOString().split("T")[0];

  // Fetch ALL pending transactions: overdue (past) + projected AR (future up to 12m)
  const { data, error } = await supabase
    .from(TABLE_TRANSACTIONS)
    .select("type, status, amount, due_date")
    .in("status", ["previsto", "atrasado", "provisionado"])
    .not("due_date", "is", null)
    .lte("due_date", futureLimitStr);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Pick<
    FinanceTransaction,
    "type" | "status" | "amount" | "due_date"
  >[];

  const overdueBuckets: AgingBucket[] = OVERDUE_BUCKETS.map((b) => ({
    ...b,
    ar: 0,
    ap: 0,
    arCount: 0,
    apCount: 0,
  }));

  const projBuckets: AgingBucket[] = PROJECTED_BUCKETS.map((b) => ({
    ...b,
    ar: 0,
    ap: 0,
    arCount: 0,
    apCount: 0,
  }));

  let totalAr = 0;
  let totalAp = 0;
  let totalArCount = 0;
  let totalApCount = 0;
  let projectedAr = 0;
  let projectedArCount = 0;

  for (const row of rows) {
    if (!row.due_date) continue;
    const dueDate = new Date(row.due_date + "T00:00:00");
    const diffDays = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const amount = Math.abs(row.amount ?? 0);

    if (diffDays >= 1) {
      // Overdue (past due)
      const bucket = overdueBuckets.find(
        (b) => diffDays >= b.minDays && diffDays <= b.maxDays
      );
      if (!bucket) continue;

      if (row.type === "receita") {
        bucket.ar += amount;
        bucket.arCount += 1;
        totalAr += amount;
        totalArCount += 1;
      } else if (row.type === "despesa") {
        bucket.ap += amount;
        bucket.apCount += 1;
        totalAp += amount;
        totalApCount += 1;
      }
    } else if (diffDays <= 0 && row.type === "receita") {
      // Projected AR (future)
      const daysAhead = Math.abs(diffDays) + 1; // tomorrow = 1
      const bucket = projBuckets.find(
        (b) => daysAhead >= b.minDays && daysAhead <= b.maxDays
      );
      if (!bucket) continue;

      bucket.ar += amount;
      bucket.arCount += 1;
      projectedAr += amount;
      projectedArCount += 1;
    }
    // AP future entries are excluded — only AR is projected
  }

  return {
    buckets: [...overdueBuckets, ...projBuckets],
    totalAr,
    totalAp,
    totalArCount,
    totalApCount,
    projectedAr,
    projectedArCount,
  };
}

// ── Cash Flow Projection ──────────────────────────────────────────────────────

export type CashFlowPoint = {
  date: string; // YYYY-MM-DD
  label: string; // "07/03"
  inflow: number;
  outflow: number;
  balance: number; // cumulative
};

export async function getFinanceCashFlowProjection(
  supabase: SupabaseClient<Database>,
  days = 30
): Promise<CashFlowPoint[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];

  // Fetch starting balance: prefer real balance from bank_statements, fallback to manual cash entries
  const { data: bsBalance } = await supabase
    .from(TABLE_BANK_STATEMENTS)
    .select("balance")
    .not("balance", "is", null)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: cbData } = await supabase
    .from(TABLE_CASH_ENTRIES)
    .select("amount")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from(TABLE_TRANSACTIONS)
    .select("type, amount, due_date")
    .in("status", ["previsto", "provisionado"])
    .not("due_date", "is", null)
    .gte("due_date", todayStr)
    .lte("due_date", futureStr);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Pick<
    FinanceTransaction,
    "type" | "amount" | "due_date"
  >[];

  // Build a map: date → { inflow, outflow }
  const map = new Map<string, { inflow: number; outflow: number }>();
  for (let i = 0; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    map.set(d.toISOString().split("T")[0], { inflow: 0, outflow: 0 });
  }

  for (const row of rows) {
    if (!row.due_date) continue;
    const entry = map.get(row.due_date);
    if (!entry) continue;
    const amount = Math.abs(row.amount ?? 0);
    if (row.type === "receita") entry.inflow += amount;
    else if (row.type === "despesa") entry.outflow += amount;
  }

  // Starting balance: real bank statement > manual cash entry > 0
  let balance =
    (bsBalance as { balance?: number } | null)?.balance ??
    (cbData as { amount?: number } | null)?.amount ??
    0;
  const points: CashFlowPoint[] = [];
  for (const [date, { inflow, outflow }] of map.entries()) {
    balance += inflow - outflow;
    const d = new Date(date + "T00:00:00");
    points.push({
      date,
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      inflow,
      outflow,
      balance,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

// ── Chart data (unpaginated, for client-side aggregation) ────────────────────

export async function getFinanceChartData(
  supabase: SupabaseClient<Database>,
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search"> = {}
): Promise<FinanceTransaction[]> {
  let query = supabase
    .from(TABLE_TRANSACTIONS)
    .select(
      "id, type, status, amount, paid_amount, date, due_date, category_id, cost_center_id, business_unit"
    )
    .order("date", { ascending: true })
    .limit(500);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.typeIn?.length) query = query.in("type", filters.typeIn);
  if (filters.statusIn?.length) query = query.in("status", filters.statusIn);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.business_unit) query = query.eq("business_unit", filters.business_unit);

  const dateField = filters.dateField ?? "date";
  if (filters.dateFrom) query = query.gte(dateField, filters.dateFrom);
  if (filters.dateTo) query = query.lte(dateField, filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceTransaction[];
}

// ── Client-side API wrappers ──────────────────────────────────────────────────

export async function triggerFinanceSync(): Promise<FinanceSyncResult> {
  const res = await fetch("/api/finance/sync-omie", { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      message: body.error ?? `Sync failed (${res.status})`,
    };
  }
  return res.json();
}

export async function fetchFinanceStatus(): Promise<FinanceStatus> {
  const res = await fetch("/api/finance/status");
  if (!res.ok) throw new Error(`Failed to fetch status (${res.status})`);
  return res.json();
}


// ── Revenue Concentration by Client ──────────────────────────────────────────

export interface ClientConcentration {
  client: string;
  revenue: number;
  pct: number;
  txCount: number;
  alertLevel: "normal" | "alta" | "critico";
}

export interface RevenueConcentrationData {
  clients: ClientConcentration[];
  totalRevenue: number;
  totalClients: number;
  top5Pct: number;
}

export async function getRevenueConcentrationByClient(
  supabase: SupabaseClient<Database>,
  dateFrom?: string,
  dateTo?: string
): Promise<RevenueConcentrationData> {
  let query = supabase
    .from("finance_transactions")
    .select("counterpart, paid_amount, amount")
    .eq("type", "receita")
    .in("status", ["pago", "parcial", "liquidado"])
    .not("counterpart", "is", null);

  if (dateFrom) query = query.gte("date", dateFrom);
  if (dateTo) query = query.lte("date", dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Aggregate by counterpart (client name)
  const clientMap = new Map<string, { revenue: number; count: number }>();
  for (const tx of data ?? []) {
    const name: string = (tx.counterpart as string) || "Sem identificação";
    const val: number = (tx.paid_amount as number) ?? (tx.amount as number) ?? 0;
    const cur = clientMap.get(name) ?? { revenue: 0, count: 0 };
    clientMap.set(name, { revenue: cur.revenue + val, count: cur.count + 1 });
  }

  const totalRevenue = Array.from(clientMap.values()).reduce((s, c) => s + c.revenue, 0);
  const totalClients = clientMap.size;

  // Sort desc by revenue
  const sorted = Array.from(clientMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue);

  let cumPct = 0;
  const clients: ClientConcentration[] = sorted.map(([client, { revenue, count }]) => {
    const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    cumPct += pct;
    let alertLevel: ClientConcentration["alertLevel"] = "normal";
    if (pct >= 50) alertLevel = "critico";
    else if (pct >= 30) alertLevel = "alta";
    return { client, revenue, pct, txCount: count, alertLevel };
  });

  const top5Pct = clients.slice(0, 5).reduce((s, c) => s + c.pct, 0);

  return { clients, totalRevenue, totalClients, top5Pct };
}

// ── Payroll Breakdown (Auto-detect from transactions) ────────────────────────

export const FOLHA_KEYWORDS = [
  "folha", "salário", "salario", "benefício", "beneficio", "encargo",
  "clt", "pj", "prolabore", "pró-labore", "inss", "fgts", "férias", "ferias", "13",
];

export const FOLHA_VENDORS = [
  "ruy", "arqfreelas", "nathalia", "rafaela", "lucca", "marco",
  "nelson", "celso", "mariane", "tiago", "eduarda", "carol lima",
];

export interface PayrollVendor {
  vendor: string;
  total: number;
  count: number;
}

export interface PayrollBreakdownData {
  vendors: PayrollVendor[];
  totalFolha: number;
  totalOperacional: number;
  headcount: number;
}

export async function getPayrollBreakdown(
  supabase: SupabaseClient<Database>,
  dateFrom: string,
  dateTo: string
): Promise<PayrollBreakdownData> {
  // Fetch all despesas in the period
  const { data, error } = await supabase
    .from(TABLE_TRANSACTIONS)
    .select("id, counterpart, amount, paid_amount, cost_center_id, status")
    .eq("type", "despesa")
    .in("status", ["pago", "parcial", "liquidado", "previsto", "provisionado", "atrasado"])
    .gte("date", dateFrom)
    .lte("date", dateTo);

  if (error) throw new Error(error.message);

  // Fetch cost center names for keyword matching
  const ccIds = [...new Set((data ?? []).filter((r) => r.cost_center_id).map((r) => r.cost_center_id!))];
  const ccLookup = new Map<string, string>();
  if (ccIds.length > 0) {
    const { data: ccs } = await supabase
      .from(TABLE_COST_CENTERS)
      .select("id, name")
      .in("id", ccIds.slice(0, 100));
    for (const cc of (ccs ?? []) as Array<{ id: string; name: string }>) {
      ccLookup.set(cc.id, cc.name);
    }
  }

  const vendorMap = new Map<string, { total: number; count: number }>();
  let totalFolha = 0;
  let totalOperacional = 0;

  for (const row of data ?? []) {
    const val = Math.abs((row.paid_amount as number) || (row.amount as number) || 0);
    const ccName = (row.cost_center_id ? ccLookup.get(row.cost_center_id) ?? "" : "").toLowerCase();
    const counterpart = String((row as Record<string, unknown>).counterpart ?? "").toLowerCase();

    const isFolha =
      FOLHA_KEYWORDS.some((kw) => ccName.includes(kw)) ||
      FOLHA_VENDORS.some((name) => counterpart.includes(name));

    if (isFolha) {
      totalFolha += val;
      // Group by vendor name (title case)
      const vendorName = counterpart
        ? counterpart.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Sem identificação";
      const cur = vendorMap.get(vendorName) ?? { total: 0, count: 0 };
      vendorMap.set(vendorName, { total: cur.total + val, count: cur.count + 1 });
    } else {
      totalOperacional += val;
    }
  }

  const vendors: PayrollVendor[] = Array.from(vendorMap.entries())
    .map(([vendor, { total, count }]) => ({ vendor, total, count }))
    .sort((a, b) => b.total - a.total);

  return {
    vendors,
    totalFolha,
    totalOperacional,
    headcount: vendors.length,
  };
}

// ── Overdue Entries (Contas a Pagar / Receber em Atraso) ─────────────────────

export interface OverdueEntry {
  id: string;
  type: "receita" | "despesa";
  status: string;
  description: string;
  counterpart: string | null;
  amount: number;
  due_date: string;
  days_overdue: number; // positive = overdue, negative = days until due
  category_name: string | null;
  isProjected: boolean; // true = future AR entry
}

export interface OverdueEntriesData {
  entries: OverdueEntry[];
  projectedEntries: OverdueEntry[]; // AR entries with due_date in the future (up to 12m)
  totalAr: number;
  totalAp: number;
  totalArCount: number;
  totalApCount: number;
  projectedAr: number;
  projectedArCount: number;
}

export async function getOverdueEntries(
  supabase: SupabaseClient<Database>,
  type: "ar" | "ap" | "all" = "all"
): Promise<OverdueEntriesData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // 12 months from today for projected AR
  const futureLimit = new Date(today);
  futureLimit.setMonth(futureLimit.getMonth() + 12);
  const futureLimitStr = futureLimit.toISOString().split("T")[0];

  // For AR (or "all"), we fetch up to 12 months ahead; for AP-only, just overdue
  const upperBound = type === "ap" ? todayStr : futureLimitStr;

  let query = supabase
    .from(TABLE_TRANSACTIONS)
    .select("id, type, status, description, counterpart, amount, due_date, category_id")
    .in("status", ["previsto", "atrasado", "provisionado"])
    .not("due_date", "is", null)
    .lte("due_date", upperBound)
    .order("due_date", { ascending: true });

  if (type === "ar") query = query.eq("type", "receita");
  else if (type === "ap") query = query.eq("type", "despesa");

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    type: "receita" | "despesa";
    status: string;
    description: string;
    counterpart: string | null;
    amount: number;
    due_date: string;
    category_id: string | null;
  }>;

  // Fetch category names for display
  const catIds = [...new Set(rows.filter((r) => r.category_id).map((r) => r.category_id!))];
  const catLookup = new Map<string, string>();
  if (catIds.length > 0) {
    const { data: cats } = await supabase
      .from(TABLE_CATEGORIES)
      .select("id, name")
      .in("id", catIds.slice(0, 50));
    for (const c of (cats ?? []) as Array<{ id: string; name: string }>) {
      catLookup.set(c.id, c.name);
    }
  }

  let totalAr = 0;
  let totalAp = 0;
  let totalArCount = 0;
  let totalApCount = 0;
  let projectedAr = 0;
  let projectedArCount = 0;

  const entries: OverdueEntry[] = [];
  const projectedEntries: OverdueEntry[] = [];

  for (const row of rows) {
    const dueDate = new Date(row.due_date + "T00:00:00");
    const diffDays = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const amount = Math.abs(row.amount ?? 0);
    const isProjected = diffDays < 1 && row.type === "receita";

    const entry: OverdueEntry = {
      id: row.id,
      type: row.type,
      status: row.status,
      description: row.description,
      counterpart: row.counterpart,
      amount,
      due_date: row.due_date,
      days_overdue: diffDays,
      category_name: row.category_id ? catLookup.get(row.category_id) ?? null : null,
      isProjected,
    };

    if (isProjected) {
      projectedAr += amount;
      projectedArCount += 1;
      projectedEntries.push(entry);
    } else {
      if (row.type === "receita") {
        totalAr += amount;
        totalArCount += 1;
      } else {
        totalAp += amount;
        totalApCount += 1;
      }
      entries.push(entry);
    }
  }

  return {
    entries,
    projectedEntries,
    totalAr,
    totalAp,
    totalArCount,
    totalApCount,
    projectedAr,
    projectedArCount,
  };
}

// ── Bank Statements (Extrato Bancário) ──────────────────────────────────────

export interface BankStatement {
  id: string;
  tenant_id: string;
  bank_account_id: string | null;
  omie_id: string | null;
  date: string;
  description: string | null;
  amount: number;
  balance: number | null;
  type: "credit" | "debit";
  category: string | null;
  document_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankStatementFilters {
  dateFrom?: string;
  dateTo?: string;
  bankAccountId?: string;
  type?: "credit" | "debit";
  page?: number;
  pageSize?: number;
}

/** Get bank statements with optional filters and pagination */
export async function getBankStatements(
  supabase: SupabaseClient<Database>,
  filters: BankStatementFilters = {}
): Promise<{ data: BankStatement[]; count: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_BANK_STATEMENTS)
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .range(from, to);

  if (filters.dateFrom) query = query.gte("date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("date", filters.dateTo);
  if (filters.bankAccountId) query = query.eq("bank_account_id", filters.bankAccountId);
  if (filters.type) query = query.eq("type", filters.type);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: (data ?? []) as BankStatement[], count: count ?? 0 };
}

/** Get the most recent bank statement balance (real cash position) */
export async function getLatestBankStatementBalance(
  supabase: SupabaseClient<Database>
): Promise<{ balance: number; date: string } | null> {
  const { data, error } = await supabase
    .from(TABLE_BANK_STATEMENTS)
    .select("balance, date")
    .not("balance", "is", null)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return { balance: data.balance as number, date: data.date as string };
}

/** Get daily aggregated cash flow from bank statements (real historical data) */
export async function getBankStatementCashFlow(
  supabase: SupabaseClient<Database>,
  dateFrom: string,
  dateTo: string
): Promise<CashFlowPoint[]> {
  const { data, error } = await supabase
    .from(TABLE_BANK_STATEMENTS)
    .select("date, amount, type, balance")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  type BsRow = { date: string; amount: number; type: string; balance: number | null };

  // Aggregate by date
  const map = new Map<string, { inflow: number; outflow: number; lastBalance: number | null }>();
  for (const row of (data ?? []) as BsRow[]) {
    const entry = map.get(row.date) ?? { inflow: 0, outflow: 0, lastBalance: null };
    const amt = Math.abs(row.amount ?? 0);
    if (row.type === "credit") entry.inflow += amt;
    else entry.outflow += amt;
    if (row.balance != null) entry.lastBalance = row.balance;
    map.set(row.date, entry);
  }

  const points: CashFlowPoint[] = [];
  let runningBalance = 0;
  for (const [date, { inflow, outflow, lastBalance }] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    // Use actual balance from extrato when available, otherwise accumulate
    if (lastBalance != null) {
      runningBalance = lastBalance;
    } else {
      runningBalance += inflow - outflow;
    }
    const d = new Date(date + "T00:00:00");
    points.push({
      date,
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      inflow,
      outflow,
      balance: runningBalance,
    });
  }

  return points;
}
