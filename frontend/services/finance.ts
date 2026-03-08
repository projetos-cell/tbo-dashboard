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

const TABLE_TRANSACTIONS = "finance_transactions" as never;
const TABLE_CATEGORIES = "finance_categories" as never;
const TABLE_COST_CENTERS = "finance_cost_centers" as never;
const TABLE_SNAPSHOTS = "finance_snapshots_daily" as never;

export async function getFinanceTransactions(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters: FinanceFilters = {}
): Promise<{ data: FinanceTransaction[]; count: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase as any)
    .from(TABLE_TRANSACTIONS)
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
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
  tenantId: string,
  activeOnly = true
): Promise<FinanceCategory[]> {
  let query = (supabase as any)
    .from(TABLE_CATEGORIES)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name");

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceCategory[];
}

export async function getFinanceCostCenters(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  activeOnly = true
): Promise<FinanceCostCenter[]> {
  let query = (supabase as any)
    .from(TABLE_COST_CENTERS)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("code");

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceCostCenter[];
}

export async function getFinanceSnapshots(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  days = 30
): Promise<FinanceSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await (supabase as any)
    .from(TABLE_SNAPSHOTS)
    .select("*")
    .eq("tenant_id", tenantId)
    .gte("snapshot_date", sinceStr)
    .order("snapshot_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FinanceSnapshot[];
}

export async function getFinanceStatus(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<FinanceStatus> {
  // Fetch all in parallel
  const [txRes, catRes, ccRes] = await Promise.all([
    (supabase as any)
      .from(TABLE_TRANSACTIONS)
      .select("type, status, omie_synced_at", { count: "exact" })
      .eq("tenant_id", tenantId),
    (supabase as any)
      .from(TABLE_CATEGORIES)
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
    (supabase as any)
      .from(TABLE_COST_CENTERS)
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId)
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
  tenantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<FinanceStatusWithAmounts> {
  let query = (supabase as any)
    .from(TABLE_TRANSACTIONS)
    .select("type, status, amount, paid_amount")
    .eq("tenant_id", tenantId);

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
  supabase: SupabaseClient<Database>,
  tenantId: string
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
    (supabase as any)
      .from(TABLE_TRANSACTIONS)
      .select("type, amount, paid_amount, cost_center_id, category_id, business_unit, project_id")
      .eq("tenant_id", tenantId)
      .in("status", ["pago", "provisionado", "liquidado"])
      .gte("date", monthStart)
      .lte("date", today),
    // AP next 30d (pending despesas)
    (supabase as any)
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "despesa")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    // AR next 30d (pending receitas)
    (supabase as any)
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "receita")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    // All cost centers for name lookup
    (supabase as any)
      .from(TABLE_COST_CENTERS)
      .select("id, code, name")
      .eq("tenant_id", tenantId),
    // Latest snapshot for accumulated balance
    (supabase as any)
      .from(TABLE_SNAPSHOTS)
      .select("saldo_acumulado")
      .eq("tenant_id", tenantId)
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
    const { data: cats } = await (supabase as any)
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
    const { data: projRows } = await (supabase as any)
      .from("projects" as never)
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
    saldoAcumulado: (latestSnap.data as any)?.saldo_acumulado ?? 0,
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
  ar: number; // receivables overdue
  ap: number; // payables overdue
  arCount: number;
  apCount: number;
};

export type FinanceAgingData = {
  buckets: AgingBucket[];
  totalAr: number;
  totalAp: number;
  totalArCount: number;
  totalApCount: number;
};

const AGING_BUCKETS: Omit<AgingBucket, "ar" | "ap" | "arCount" | "apCount">[] =
  [
    { label: "1–30 dias", minDays: 1, maxDays: 30 },
    { label: "31–60 dias", minDays: 31, maxDays: 60 },
    { label: "61–90 dias", minDays: 61, maxDays: 90 },
    { label: "90+ dias", minDays: 91, maxDays: Infinity },
  ];

export async function getFinanceAging(
  supabase: SupabaseClient,
  tenantId: string
): Promise<FinanceAgingData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Fetch all pending/overdue transactions with a due date in the past
  const { data, error } = await (supabase as any)
    .from(TABLE_TRANSACTIONS)
    .select("type, status, amount, due_date")
    .eq("tenant_id", tenantId)
    .in("status", ["previsto", "atrasado", "provisionado"])
    .not("due_date", "is", null)
    .lt("due_date", todayStr);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Pick<
    FinanceTransaction,
    "type" | "status" | "amount" | "due_date"
  >[];

  const buckets: AgingBucket[] = AGING_BUCKETS.map((b) => ({
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

  for (const row of rows) {
    if (!row.due_date) continue;
    const dueDate = new Date(row.due_date);
    const daysPast = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysPast < 1) continue;

    const bucket = buckets.find(
      (b) => daysPast >= b.minDays && daysPast <= b.maxDays
    );
    if (!bucket) continue;

    const amount = Math.abs(row.amount ?? 0);
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
  }

  return { buckets, totalAr, totalAp, totalArCount, totalApCount };
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
  supabase: SupabaseClient,
  tenantId: string,
  days = 30
): Promise<CashFlowPoint[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];

  const { data, error } = await (supabase as any)
    .from(TABLE_TRANSACTIONS)
    .select("type, amount, due_date")
    .eq("tenant_id", tenantId)
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

  let balance = 0;
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
  tenantId: string,
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search"> = {}
): Promise<FinanceTransaction[]> {
  let query = (supabase as any)
    .from(TABLE_TRANSACTIONS)
    .select(
      "id, type, status, amount, paid_amount, date, due_date, category_id, cost_center_id, business_unit"
    )
    .eq("tenant_id", tenantId)
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

// ── DRE Settings ─────────────────────────────────────────────────────────────

export interface DreSettings {
  id: string;
  tenant_id: string;
  tax_rate: number;
  updated_at: string;
  updated_by: string | null;
}

export async function getDreSettings(
  supabase: SupabaseClient,
  tenantId: string
): Promise<DreSettings | null> {
  const { data, error } = await supabase
    .from("dre_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertDreSettings(
  supabase: SupabaseClient,
  tenantId: string,
  taxRate: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("dre_settings")
    .upsert(
      {
        tenant_id: tenantId,
        tax_rate: taxRate,
        updated_by: userId,
      } as never,
      { onConflict: "tenant_id" }
    );

  if (error) throw new Error(error.message);
}

// ── DRE Simplificado ─────────────────────────────────────────────────────────

export interface DreMonthColumn {
  label: string;   // e.g. "Jan/25"
  yearMonth: string; // e.g. "2025-01"
}

export interface DreRow {
  key: string;
  label: string;
  isSubtotal: boolean;
  isNegative: boolean; // display as red/deduction
  values: number[];    // one per column
  variations: (number | null)[]; // MoM % change, null for first column
}

export interface DreData {
  columns: DreMonthColumn[];
  rows: DreRow[];
  taxRate: number;
}

export async function getFinanceDRE(
  supabase: SupabaseClient,
  tenantId: string,
  months = 7,
  taxRate = 15
): Promise<DreData> {
  // Build the list of year-months to show (oldest → newest)
  const now = new Date();
  const columns: DreMonthColumn[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    columns.push({ label: label.charAt(0).toUpperCase() + label.slice(1), yearMonth });
  }

  // Fetch all paid transactions in the date range
  const dateFrom = `${columns[0].yearMonth}-01`;
  const dateTo = `${columns[columns.length - 1].yearMonth}-31`;

  const { data: txns, error: txErr } = await supabase
    .from("finance_transactions")
    .select("id, type, status, paid_amount, amount, date, cost_center_id")
    .eq("tenant_id", tenantId)
    .eq("status", "paid")
    .gte("date", dateFrom)
    .lte("date", dateTo);

  if (txErr) throw new Error(txErr.message);

  // Fetch cost centers to classify despesas
  const { data: costCenters, error: ccErr } = await supabase
    .from("finance_cost_centers")
    .select("id, code")
    .eq("tenant_id", tenantId);

  if (ccErr) throw new Error(ccErr.message);

  const ccMap = new Map<string, string>(
    (costCenters ?? []).map((cc: { id: string; code: string }) => [cc.id, cc.code])
  );

  const DIRECT_COST_CODES = new Set(["projetos_producao"]);
  const OVERHEAD_CODES = new Set(["infraestrutura_operacao", "financeiro_encargos"]);

  // Aggregate by yearMonth
  const agg: Record<string, {
    receitaBruta: number;
    custosDirectos: number;
    overhead: number;
    outrasDespesas: number;
  }> = {};

  for (const col of columns) {
    agg[col.yearMonth] = { receitaBruta: 0, custosDirectos: 0, overhead: 0, outrasDespesas: 0 };
  }

  for (const tx of txns ?? []) {
    const d = new Date(tx.date);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!agg[ym]) continue;
    const val = tx.paid_amount ?? tx.amount ?? 0;
    if (tx.type === "receita") {
      agg[ym].receitaBruta += val;
    } else {
      const code = tx.cost_center_id ? ccMap.get(tx.cost_center_id) ?? "" : "";
      if (DIRECT_COST_CODES.has(code)) {
        agg[ym].custosDirectos += val;
      } else if (OVERHEAD_CODES.has(code)) {
        agg[ym].overhead += val;
      } else {
        agg[ym].outrasDespesas += val;
      }
    }
  }

  // Build row arrays
  const colValues = (fn: (a: typeof agg[string]) => number) =>
    columns.map((c) => fn(agg[c.yearMonth]));

  const calcVariations = (vals: number[]): (number | null)[] =>
    vals.map((v, i) => {
      if (i === 0) return null;
      const prev = vals[i - 1];
      if (prev === 0) return null;
      return Math.round(((v - prev) / Math.abs(prev)) * 100);
    });

  const receitaBruta = colValues((a) => a.receitaBruta);
  const impostos = receitaBruta.map((r) => r * (taxRate / 100));
  const receitaLiquida = receitaBruta.map((r, i) => r - impostos[i]);
  const custosDirectos = colValues((a) => a.custosDirectos);
  const margemBruta = receitaLiquida.map((r, i) => r - custosDirectos[i]);
  const overhead = colValues((a) => a.overhead);
  const ebitda = margemBruta.map((m, i) => m - overhead[i]);

  const rows: DreRow[] = [
    {
      key: "receita_bruta",
      label: "(+) Receita Bruta",
      isSubtotal: false,
      isNegative: false,
      values: receitaBruta,
      variations: calcVariations(receitaBruta),
    },
    {
      key: "impostos",
      label: `(−) Impostos (${taxRate}%)`,
      isSubtotal: false,
      isNegative: true,
      values: impostos,
      variations: calcVariations(impostos),
    },
    {
      key: "receita_liquida",
      label: "(=) Receita Líquida",
      isSubtotal: true,
      isNegative: false,
      values: receitaLiquida,
      variations: calcVariations(receitaLiquida),
    },
    {
      key: "custos_diretos",
      label: "(−) Custos Diretos",
      isSubtotal: false,
      isNegative: true,
      values: custosDirectos,
      variations: calcVariations(custosDirectos),
    },
    {
      key: "margem_bruta",
      label: "(=) Margem Bruta",
      isSubtotal: true,
      isNegative: false,
      values: margemBruta,
      variations: calcVariations(margemBruta),
    },
    {
      key: "overhead",
      label: "(−) Overhead",
      isSubtotal: false,
      isNegative: true,
      values: overhead,
      variations: calcVariations(overhead),
    },
    {
      key: "ebitda",
      label: "(=) EBITDA",
      isSubtotal: true,
      isNegative: false,
      values: ebitda,
      variations: calcVariations(ebitda),
    },
  ];

  return { columns, rows, taxRate };
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
  supabase: SupabaseClient,
  tenantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<RevenueConcentrationData> {
  let query = supabase
    .from("finance_transactions")
    .select("counterpart, paid_amount, amount")
    .eq("tenant_id", tenantId)
    .eq("type", "receita")
    .eq("status", "paid")
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
