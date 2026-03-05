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
  if (filters.dateFrom) query = query.gte("date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("date", filters.dateTo);
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
