import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];
type CategoryRow = Database["public"]["Tables"]["fin_categories"]["Row"];
type CostCenterRow = Database["public"]["Tables"]["fin_cost_centers"]["Row"];
type VendorRow = Database["public"]["Tables"]["fin_vendors"]["Row"];
type FinClientRow = Database["public"]["Tables"]["fin_clients"]["Row"];

// ── Payables ──────────────────────────────────────────────────

export async function listPayables(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    cost_center_id?: string;
    search?: string;
  }
): Promise<PayableRow[]> {
  let query = supabase
    .from("fin_payables")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.cost_center_id)
    query = query.eq("cost_center_id", filters.cost_center_id);
  if (filters?.search)
    query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PayableRow[];
}

export async function getPayable(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<PayableRow | null> {
  const { data, error } = await supabase
    .from("fin_payables")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as PayableRow;
}

export async function createPayable(
  supabase: SupabaseClient<Database>,
  payable: Database["public"]["Tables"]["fin_payables"]["Insert"]
): Promise<PayableRow> {
  const { data, error } = await supabase
    .from("fin_payables")
    .insert(payable as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as PayableRow;
}

export async function updatePayable(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_payables"]["Update"]
): Promise<PayableRow> {
  const payload = { ...updates, updated_at: new Date().toISOString() };

  if (updates.status === "pago") {
    payload.paid_date = payload.paid_date ?? new Date().toISOString();
    payload.amount_paid = payload.amount_paid ?? undefined;
  }

  const { data, error } = await supabase
    .from("fin_payables")
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as PayableRow;
}

export async function deletePayable(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("fin_payables")
    .update({ status: "cancelado", updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

// ── Receivables ───────────────────────────────────────────────

export async function listReceivables(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    client_id?: string;
    search?: string;
  }
): Promise<ReceivableRow[]> {
  let query = supabase
    .from("fin_receivables")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.client_id) query = query.eq("client_id", filters.client_id);
  if (filters?.search)
    query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ReceivableRow[];
}

export async function createReceivable(
  supabase: SupabaseClient<Database>,
  receivable: Database["public"]["Tables"]["fin_receivables"]["Insert"]
): Promise<ReceivableRow> {
  const { data, error } = await supabase
    .from("fin_receivables")
    .insert(receivable as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReceivableRow;
}

export async function updateReceivable(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_receivables"]["Update"]
): Promise<ReceivableRow> {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (updates.status === "pago") {
    payload.paid_date = payload.paid_date ?? new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("fin_receivables")
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReceivableRow;
}

export async function deleteReceivable(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("fin_receivables")
    .update({ status: "cancelado", updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

// ── Categories ────────────────────────────────────────────────

export async function listCategories(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  type?: string
): Promise<CategoryRow[]> {
  let query = supabase
    .from("fin_categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

// ── Cost Centers ──────────────────────────────────────────────

export async function listCostCenters(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<CostCenterRow[]> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as CostCenterRow[];
}

export async function createCostCenter(
  supabase: SupabaseClient<Database>,
  cc: Database["public"]["Tables"]["fin_cost_centers"]["Insert"]
): Promise<CostCenterRow> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .insert(cc as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as CostCenterRow;
}

export async function updateCostCenter(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_cost_centers"]["Update"]
): Promise<CostCenterRow> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as CostCenterRow;
}

// ── Vendors ───────────────────────────────────────────────────

export async function listVendors(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  search?: string
): Promise<VendorRow[]> {
  let query = supabase
    .from("fin_vendors")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as VendorRow[];
}

export async function createVendor(
  supabase: SupabaseClient<Database>,
  vendor: Database["public"]["Tables"]["fin_vendors"]["Insert"]
): Promise<VendorRow> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .insert(vendor as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as VendorRow;
}

export async function updateVendor(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_vendors"]["Update"]
): Promise<VendorRow> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as VendorRow;
}

// ── Fin Clients ───────────────────────────────────────────────

export async function listFinClients(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  search?: string
): Promise<FinClientRow[]> {
  let query = supabase
    .from("fin_clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinClientRow[];
}

export async function createFinClient(
  supabase: SupabaseClient<Database>,
  client: Database["public"]["Tables"]["fin_clients"]["Insert"]
): Promise<FinClientRow> {
  const { data, error } = await supabase
    .from("fin_clients")
    .insert(client as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as FinClientRow;
}

export async function updateFinClient(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_clients"]["Update"]
): Promise<FinClientRow> {
  const { data, error } = await supabase
    .from("fin_clients")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as FinClientRow;
}

// ── KPI helpers (client-side aggregation) ─────────────────────

export interface FinancialKPIs {
  totalPayable: number;
  totalReceivable: number;
  totalPaid: number;
  totalReceived: number;
  overdue: number;
  countPayable: number;
  countReceivable: number;
}

export function computeFinancialKPIs(
  payables: PayableRow[],
  receivables: ReceivableRow[]
): FinancialKPIs {
  const openPayStatuses = ["aberto", "parcial", "atrasado", "aprovado"];
  const openRecStatuses = ["aberto", "parcial", "atrasado", "emitido"];
  const today = new Date().toISOString().slice(0, 10);

  let totalPayable = 0;
  let totalPaid = 0;
  let overdue = 0;

  for (const p of payables) {
    if (openPayStatuses.includes(p.status ?? "")) totalPayable += p.amount - (p.amount_paid ?? 0);
    if (p.status === "pago") totalPaid += p.amount;
    if (p.status === "atrasado" || (openPayStatuses.includes(p.status ?? "") && p.due_date < today))
      overdue += p.amount - (p.amount_paid ?? 0);
  }

  let totalReceivable = 0;
  let totalReceived = 0;

  for (const r of receivables) {
    if (openRecStatuses.includes(r.status ?? "")) totalReceivable += r.amount - (r.amount_paid ?? 0);
    if (r.status === "pago") totalReceived += r.amount;
  }

  return {
    totalPayable,
    totalReceivable,
    totalPaid,
    totalReceived,
    overdue,
    countPayable: payables.length,
    countReceivable: receivables.length,
  };
}

// ── Cash flow helper ──────────────────────────────────────────

export interface CashFlowDay {
  date: string;
  inflows: number;
  outflows: number;
  balance: number;
}

export function computeCashFlow(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  days: number = 30
): CashFlowDay[] {
  const today = new Date();
  const result: CashFlowDay[] = [];
  let runningBalance = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayInflows = receivables
      .filter((r) => r.due_date.slice(0, 10) === dateStr && r.status !== "cancelado")
      .reduce((sum, r) => sum + (r.amount - (r.amount_paid ?? 0)), 0);

    const dayOutflows = payables
      .filter((p) => p.due_date.slice(0, 10) === dateStr && p.status !== "cancelado")
      .reduce((sum, p) => sum + (p.amount - (p.amount_paid ?? 0)), 0);

    runningBalance += dayInflows - dayOutflows;
    result.push({ date: dateStr, inflows: dayInflows, outflows: dayOutflows, balance: runningBalance });
  }

  return result;
}

// ── Inbox alerts helper ───────────────────────────────────────

export interface InboxAlert {
  id: string;
  type: "overdue_payable" | "overdue_receivable" | "pending_approval" | "no_cost_center" | "no_project";
  label: string;
  count: number;
  severity: "danger" | "warning" | "info";
}

export function computeInboxAlerts(
  payables: PayableRow[],
  receivables: ReceivableRow[]
): InboxAlert[] {
  const today = new Date().toISOString().slice(0, 10);
  const alerts: InboxAlert[] = [];

  const overduePayables = payables.filter(
    (p) => !["pago", "cancelado"].includes(p.status ?? "") && p.due_date < today
  );
  if (overduePayables.length) {
    alerts.push({
      id: "overdue_payable",
      type: "overdue_payable",
      label: "Contas a pagar vencidas",
      count: overduePayables.length,
      severity: "danger",
    });
  }

  const overdueReceivables = receivables.filter(
    (r) => !["pago", "cancelado"].includes(r.status ?? "") && r.due_date < today
  );
  if (overdueReceivables.length) {
    alerts.push({
      id: "overdue_receivable",
      type: "overdue_receivable",
      label: "Contas a receber vencidas",
      count: overdueReceivables.length,
      severity: "danger",
    });
  }

  const pendingApproval = payables.filter((p) => p.status === "aguardando_aprovacao");
  if (pendingApproval.length) {
    alerts.push({
      id: "pending_approval",
      type: "pending_approval",
      label: "Aguardando aprovação",
      count: pendingApproval.length,
      severity: "warning",
    });
  }

  const noCostCenter = payables.filter(
    (p) => !p.cost_center_id && !["cancelado", "pago"].includes(p.status ?? "")
  );
  if (noCostCenter.length) {
    alerts.push({
      id: "no_cost_center",
      type: "no_cost_center",
      label: "Sem centro de custo",
      count: noCostCenter.length,
      severity: "info",
    });
  }

  return alerts;
}

// ── Bank Transactions ────────────────────────────────────────

type BankTransactionRow = Database["public"]["Tables"]["bank_transactions"]["Row"];
type BankImportRow = Database["public"]["Tables"]["bank_imports"]["Row"];
type ReconciliationRuleRow = Database["public"]["Tables"]["reconciliation_rules"]["Row"];
type FinTransactionRow = Database["public"]["Tables"]["fin_transactions"]["Row"];
type MonthlyClosingRow = Database["public"]["Tables"]["monthly_closings"]["Row"];

export async function listBankTransactions(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: { import_id?: string; match_status?: string }
): Promise<BankTransactionRow[]> {
  let query = supabase
    .from("bank_transactions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (filters?.import_id) query = query.eq("import_id", filters.import_id);
  if (filters?.match_status) query = query.eq("match_status", filters.match_status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BankTransactionRow[];
}

export async function listBankImports(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<BankImportRow[]> {
  const { data, error } = await supabase
    .from("bank_imports")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BankImportRow[];
}

export async function listReconciliationRules(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<ReconciliationRuleRow[]> {
  const { data, error } = await supabase
    .from("reconciliation_rules")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("priority", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReconciliationRuleRow[];
}

export async function createReconciliationRule(
  supabase: SupabaseClient<Database>,
  rule: Database["public"]["Tables"]["reconciliation_rules"]["Insert"]
): Promise<ReconciliationRuleRow> {
  const { data, error } = await supabase
    .from("reconciliation_rules")
    .insert(rule as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReconciliationRuleRow;
}

export async function updateReconciliationRule(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["reconciliation_rules"]["Update"]
): Promise<ReconciliationRuleRow> {
  const { data, error } = await supabase
    .from("reconciliation_rules")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ReconciliationRuleRow;
}

export async function deleteReconciliationRule(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("reconciliation_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Financial Transactions (Ledger) ─────────────────────────

export async function listFinTransactions(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: { category_id?: string; type?: string; month?: string }
): Promise<FinTransactionRow[]> {
  let query = supabase
    .from("fin_transactions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (filters?.category_id) query = query.eq("category_id", filters.category_id);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.month) {
    const start = `${filters.month}-01`;
    const endDate = new Date(parseInt(filters.month.split("-")[0]), parseInt(filters.month.split("-")[1]), 0);
    const end = endDate.toISOString().slice(0, 10);
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinTransactionRow[];
}

// ── Monthly Closings ────────────────────────────────────────

export async function listMonthlyClosings(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<MonthlyClosingRow[]> {
  const { data, error } = await supabase
    .from("monthly_closings")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MonthlyClosingRow[];
}

// ── Balance Snapshots ─────────────────────────────────────────

type BalanceSnapshotRow = Database["public"]["Tables"]["fin_balance_snapshots"]["Row"];

export async function getLatestBalanceSnapshot(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<BalanceSnapshotRow | null> {
  const { data, error } = await supabase
    .from("fin_balance_snapshots")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as BalanceSnapshotRow | null;
}

export async function createBalanceSnapshot(
  supabase: SupabaseClient<Database>,
  snapshot: Database["public"]["Tables"]["fin_balance_snapshots"]["Insert"]
): Promise<BalanceSnapshotRow> {
  const { data, error } = await supabase
    .from("fin_balance_snapshots")
    .insert(snapshot as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as BalanceSnapshotRow;
}

// ── Executive KPI helpers ─────────────────────────────────────

export type HealthStatus = "saudavel" | "atencao" | "critico";

export interface ExecutiveKPIs {
  currentCash: number;
  monthRevenue: number;
  monthExpenses: number;
  netMarginPct: number;
  burnRate: number;
  runway: number;
  // Variations vs previous month
  revenueVariation: number;
  expenseVariation: number;
  marginVariation: number;
  burnRateVariation: number;
  // Previous month values
  prevMonthRevenue: number;
  prevMonthExpenses: number;
  prevMonthMarginPct: number;
}

function getMonthRange(offset: number): { start: string; end: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = d.toISOString().slice(0, 10);
  const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export function computeExecutiveKPIs(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  initialBalance: number
): ExecutiveKPIs {
  const currentMonth = getMonthRange(0);
  const prevMonth = getMonthRange(-1);

  // Current cash = initialBalance + all received - all paid
  let totalReceived = 0;
  let totalPaid = 0;
  for (const r of receivables) {
    if (r.status === "pago" && r.paid_date) totalReceived += r.amount;
  }
  for (const p of payables) {
    if (p.status === "pago" && p.paid_date) totalPaid += p.amount;
  }
  const currentCash = initialBalance + totalReceived - totalPaid;

  // Current month revenue & expenses (all statuses except cancelado)
  let monthRevenue = 0;
  let monthExpenses = 0;
  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const dd = r.due_date.slice(0, 10);
    if (dd >= currentMonth.start && dd <= currentMonth.end) monthRevenue += r.amount;
  }
  for (const p of payables) {
    if (p.status === "cancelado") continue;
    const dd = p.due_date.slice(0, 10);
    if (dd >= currentMonth.start && dd <= currentMonth.end) monthExpenses += p.amount;
  }

  // Previous month
  let prevMonthRevenue = 0;
  let prevMonthExpenses = 0;
  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const dd = r.due_date.slice(0, 10);
    if (dd >= prevMonth.start && dd <= prevMonth.end) prevMonthRevenue += r.amount;
  }
  for (const p of payables) {
    if (p.status === "cancelado") continue;
    const dd = p.due_date.slice(0, 10);
    if (dd >= prevMonth.start && dd <= prevMonth.end) prevMonthExpenses += p.amount;
  }

  // Net margin %
  const netMarginPct = monthRevenue > 0
    ? ((monthRevenue - monthExpenses) / monthRevenue) * 100
    : 0;
  const prevMonthMarginPct = prevMonthRevenue > 0
    ? ((prevMonthRevenue - prevMonthExpenses) / prevMonthRevenue) * 100
    : 0;

  // Burn rate (average expenses last 3 months)
  let burnRateTotal = 0;
  let burnMonthCount = 0;
  for (let i = -1; i >= -3; i--) {
    const m = getMonthRange(i);
    let mExpenses = 0;
    for (const p of payables) {
      if (p.status === "cancelado") continue;
      const dd = p.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mExpenses += p.amount;
    }
    if (mExpenses > 0) {
      burnRateTotal += mExpenses;
      burnMonthCount++;
    }
  }
  const burnRate = burnMonthCount > 0 ? burnRateTotal / burnMonthCount : monthExpenses;

  // Previous burn rate (months -2 to -4)
  let prevBurnTotal = 0;
  let prevBurnCount = 0;
  for (let i = -2; i >= -4; i--) {
    const m = getMonthRange(i);
    let mExpenses = 0;
    for (const p of payables) {
      if (p.status === "cancelado") continue;
      const dd = p.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mExpenses += p.amount;
    }
    if (mExpenses > 0) {
      prevBurnTotal += mExpenses;
      prevBurnCount++;
    }
  }
  const prevBurnRate = prevBurnCount > 0 ? prevBurnTotal / prevBurnCount : 0;

  // Runway
  const runway = burnRate > 0 ? currentCash / burnRate : Infinity;

  // Variations
  const revenueVariation = prevMonthRevenue > 0
    ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : 0;
  const expenseVariation = prevMonthExpenses > 0
    ? ((monthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
    : 0;
  const marginVariation = prevMonthMarginPct !== 0
    ? netMarginPct - prevMonthMarginPct
    : 0;
  const burnRateVariation = prevBurnRate > 0
    ? ((burnRate - prevBurnRate) / prevBurnRate) * 100
    : 0;

  return {
    currentCash,
    monthRevenue,
    monthExpenses,
    netMarginPct,
    burnRate,
    runway,
    revenueVariation,
    expenseVariation,
    marginVariation,
    burnRateVariation,
    prevMonthRevenue,
    prevMonthExpenses,
    prevMonthMarginPct,
  };
}

export function getKPIHealthStatus(metric: string, value: number): HealthStatus {
  switch (metric) {
    case "cash":
      if (value <= 0) return "critico";
      return "saudavel";
    case "margin":
      if (value < 5) return "critico";
      if (value < 15) return "atencao";
      return "saudavel";
    case "runway":
      if (value < 2) return "critico";
      if (value < 6) return "atencao";
      return "saudavel";
    case "burnRate":
      // Higher burn rate variation is worse
      if (value > 20) return "critico";
      if (value > 10) return "atencao";
      return "saudavel";
    default:
      return "saudavel";
  }
}

// ── Intelligent Cash Flow ─────────────────────────────────────

export interface CashFlowAlert {
  type: "negative_balance" | "payment_concentration" | "overdue_receivable";
  date: string;
  message: string;
  severity: "danger" | "warning";
  amount?: number;
}

export function computeIntelligentCashFlow(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  initialBalance: number,
  days: number = 30
): { days: CashFlowDay[]; alerts: CashFlowAlert[] } {
  const today = new Date();
  const result: CashFlowDay[] = [];
  const alerts: CashFlowAlert[] = [];
  let runningBalance = initialBalance;

  // Add currently realized balance
  for (const r of receivables) {
    if (r.status === "pago" && r.paid_date) {
      const pd = r.paid_date.slice(0, 10);
      if (pd < today.toISOString().slice(0, 10)) {
        runningBalance += r.amount;
      }
    }
  }
  for (const p of payables) {
    if (p.status === "pago" && p.paid_date) {
      const pd = p.paid_date.slice(0, 10);
      if (pd < today.toISOString().slice(0, 10)) {
        runningBalance -= p.amount;
      }
    }
  }

  const seenAlerts = new Set<string>();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayInflows = receivables
      .filter((r) => r.due_date.slice(0, 10) === dateStr && r.status !== "cancelado" && r.status !== "pago")
      .reduce((sum, r) => sum + (r.amount - (r.amount_paid ?? 0)), 0);

    const dayOutflows = payables
      .filter((p) => p.due_date.slice(0, 10) === dateStr && p.status !== "cancelado" && p.status !== "pago")
      .reduce((sum, p) => sum + (p.amount - (p.amount_paid ?? 0)), 0);

    // Count payables on this day for concentration alert
    const dayPayableCount = payables.filter(
      (p) => p.due_date.slice(0, 10) === dateStr && p.status !== "cancelado" && p.status !== "pago"
    ).length;

    runningBalance += dayInflows - dayOutflows;
    result.push({ date: dateStr, inflows: dayInflows, outflows: dayOutflows, balance: runningBalance });

    // Negative balance alert
    if (runningBalance < 0 && !seenAlerts.has("negative_balance")) {
      alerts.push({
        type: "negative_balance",
        date: dateStr,
        message: `Saldo negativo projetado em ${i} dias (${dateStr})`,
        severity: "danger",
        amount: runningBalance,
      });
      seenAlerts.add("negative_balance");
    }

    // Payment concentration alert
    if (dayPayableCount > 3 && !seenAlerts.has(`concentration_${dateStr}`)) {
      alerts.push({
        type: "payment_concentration",
        date: dateStr,
        message: `${dayPayableCount} pagamentos concentrados em ${dateStr}`,
        severity: "warning",
      });
      seenAlerts.add(`concentration_${dateStr}`);
    }
  }

  // Overdue receivables alert
  const todayStr = today.toISOString().slice(0, 10);
  const overdueReceivables = receivables.filter(
    (r) => !["pago", "cancelado"].includes(r.status ?? "") && r.due_date < todayStr
  );
  if (overdueReceivables.length > 0) {
    const overdueTotal = overdueReceivables.reduce((sum, r) => sum + (r.amount - (r.amount_paid ?? 0)), 0);
    alerts.push({
      type: "overdue_receivable",
      date: todayStr,
      message: `${overdueReceivables.length} recebiveis vencidos totalizando inadimplencia`,
      severity: "danger",
      amount: overdueTotal,
    });
  }

  return { days: result, alerts };
}

// ── Strategic Analysis helpers ────────────────────────────────

export interface CostCenterAnalysis {
  costCenterId: string | null;
  costCenterName: string;
  revenue: number;
  expenses: number;
  margin: number;
  marginPct: number;
}

export interface ConcentrationItem {
  clientId: string | null;
  clientName: string;
  revenue: number;
  pct: number;
  cumulativePct: number;
}

export interface RecurringVsProject {
  recurring: number;
  project: number;
  recurringPct: number;
}

export function computeCostCenterAnalysis(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  costCenters: CostCenterRow[]
): CostCenterAnalysis[] {
  const ccMap = new Map<string | null, { name: string; revenue: number; expenses: number }>();

  // Group payables by cost_center_id
  for (const p of payables) {
    if (p.status === "cancelado") continue;
    const ccId = p.cost_center_id;
    const cc = costCenters.find((c) => c.id === ccId);
    const name = cc?.name ?? "Sem Centro de Custo";
    const entry = ccMap.get(ccId) ?? { name, revenue: 0, expenses: 0 };
    entry.expenses += p.amount;
    ccMap.set(ccId, entry);
  }

  // Revenue: try to allocate via project_id matching
  // If receivable has project_id, find payables with same project_id and their cost_center
  const projectCCMap = new Map<string, string | null>();
  for (const p of payables) {
    if (p.project_id && p.cost_center_id) {
      projectCCMap.set(p.project_id, p.cost_center_id);
    }
  }

  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    let ccId: string | null = null;
    if (r.project_id) {
      ccId = projectCCMap.get(r.project_id) ?? null;
    }
    const cc = ccId ? costCenters.find((c) => c.id === ccId) : null;
    const name = cc?.name ?? "Receita Geral";
    const entry = ccMap.get(ccId) ?? { name, revenue: 0, expenses: 0 };
    entry.revenue += r.amount;
    ccMap.set(ccId, entry);
  }

  const results: CostCenterAnalysis[] = [];
  for (const [ccId, val] of ccMap) {
    const margin = val.revenue - val.expenses;
    results.push({
      costCenterId: ccId,
      costCenterName: val.name,
      revenue: val.revenue,
      expenses: val.expenses,
      margin,
      marginPct: val.revenue > 0 ? (margin / val.revenue) * 100 : val.expenses > 0 ? -100 : 0,
    });
  }

  return results.sort((a, b) => b.margin - a.margin);
}

export function computeRevenueConcentration(
  receivables: ReceivableRow[],
  clients: FinClientRow[]
): ConcentrationItem[] {
  const clientMap = new Map<string | null, { name: string; revenue: number }>();

  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const clientId = r.client_id;
    const client = clients.find((c) => c.id === clientId);
    const name = client?.name ?? "Cliente nao identificado";
    const entry = clientMap.get(clientId) ?? { name, revenue: 0 };
    entry.revenue += r.amount;
    clientMap.set(clientId, entry);
  }

  const sorted = Array.from(clientMap.entries())
    .map(([id, val]) => ({ clientId: id, clientName: val.name, revenue: val.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = sorted.reduce((sum, c) => sum + c.revenue, 0);
  let cumulative = 0;
  return sorted.map((c) => {
    const pct = totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0;
    cumulative += pct;
    return { ...c, pct, cumulativePct: cumulative };
  });
}

export function computeAverageTicket(
  receivables: ReceivableRow[],
  clients: FinClientRow[]
): { clientId: string | null; clientName: string; avgTicket: number; count: number; total: number }[] {
  const clientMap = new Map<string | null, { name: string; total: number; count: number }>();

  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const clientId = r.client_id;
    const client = clients.find((c) => c.id === clientId);
    const name = client?.name ?? "Cliente nao identificado";
    const entry = clientMap.get(clientId) ?? { name, total: 0, count: 0 };
    entry.total += r.amount;
    entry.count += 1;
    clientMap.set(clientId, entry);
  }

  return Array.from(clientMap.entries())
    .map(([id, val]) => ({
      clientId: id,
      clientName: val.name,
      avgTicket: val.count > 0 ? val.total / val.count : 0,
      count: val.count,
      total: val.total,
    }))
    .sort((a, b) => b.avgTicket - a.avgTicket);
}

export function computeRecurringVsProject(receivables: ReceivableRow[]): RecurringVsProject {
  let recurring = 0;
  let project = 0;

  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    if (r.project_id) {
      project += r.amount;
    } else {
      recurring += r.amount;
    }
  }

  const total = recurring + project;
  return {
    recurring,
    project,
    recurringPct: total > 0 ? (recurring / total) * 100 : 0,
  };
}

// ── Client Financial Profiles ─────────────────────────────────

export interface ClientFinancialProfile {
  clientId: string | null;
  clientName: string;
  totalBilled: number;
  totalPaid: number;
  totalOverdue: number;
  avgDSO: number;
  concentrationPct: number;
  overdueCount: number;
}

export function computeClientProfiles(
  receivables: ReceivableRow[],
  clients: FinClientRow[]
): ClientFinancialProfile[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalRevenue = receivables
    .filter((r) => r.status !== "cancelado")
    .reduce((sum, r) => sum + r.amount, 0);

  const clientMap = new Map<string | null, {
    name: string;
    billed: number;
    paid: number;
    overdue: number;
    overdueCount: number;
    dsoSum: number;
    dsoCount: number;
  }>();

  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const clientId = r.client_id;
    const client = clients.find((c) => c.id === clientId);
    const name = client?.name ?? "Cliente nao identificado";
    const entry = clientMap.get(clientId) ?? {
      name,
      billed: 0,
      paid: 0,
      overdue: 0,
      overdueCount: 0,
      dsoSum: 0,
      dsoCount: 0,
    };

    entry.billed += r.amount;

    if (r.status === "pago") {
      entry.paid += r.amount;
      // DSO: days between due_date and paid_date
      if (r.paid_date) {
        const due = new Date(r.due_date);
        const paid = new Date(r.paid_date);
        const dso = Math.max(0, Math.round((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        entry.dsoSum += dso;
        entry.dsoCount += 1;
      }
    } else if (r.due_date < todayStr) {
      // Overdue
      entry.overdue += r.amount - (r.amount_paid ?? 0);
      entry.overdueCount += 1;
      // DSO for overdue = today - due_date
      const due = new Date(r.due_date);
      const dso = Math.round((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
      entry.dsoSum += dso;
      entry.dsoCount += 1;
    }

    clientMap.set(clientId, entry);
  }

  return Array.from(clientMap.entries())
    .map(([id, val]) => ({
      clientId: id,
      clientName: val.name,
      totalBilled: val.billed,
      totalPaid: val.paid,
      totalOverdue: val.overdue,
      avgDSO: val.dsoCount > 0 ? Math.round(val.dsoSum / val.dsoCount) : 0,
      concentrationPct: totalRevenue > 0 ? (val.billed / totalRevenue) * 100 : 0,
      overdueCount: val.overdueCount,
    }))
    .sort((a, b) => b.totalBilled - a.totalBilled);
}

// ── Simulation ────────────────────────────────────────────────

export interface SimulationParams {
  receivablesDelayPct: number;
  expenseCutPct: number;
  revenueGrowthPct: number;
}

export interface SimulationResult {
  projectedCash: number;
  projectedRunway: number;
  projectedMarginPct: number;
  monthlyProjection: { month: string; revenue: number; expenses: number; balance: number }[];
}

export function computeSimulation(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  initialBalance: number,
  params: SimulationParams
): SimulationResult {
  // Get baseline from last 3 months
  let baseRevenue = 0;
  let baseExpenses = 0;
  let monthCount = 0;

  for (let i = -1; i >= -3; i--) {
    const m = getMonthRange(i);
    let mRev = 0;
    let mExp = 0;
    for (const r of receivables) {
      if (r.status === "cancelado") continue;
      const dd = r.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mRev += r.amount;
    }
    for (const p of payables) {
      if (p.status === "cancelado") continue;
      const dd = p.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mExp += p.amount;
    }
    baseRevenue += mRev;
    baseExpenses += mExp;
    monthCount++;
  }

  const avgRevenue = monthCount > 0 ? baseRevenue / monthCount : 0;
  const avgExpenses = monthCount > 0 ? baseExpenses / monthCount : 0;

  // Apply simulation parameters
  const simRevenue = avgRevenue * (1 + params.revenueGrowthPct / 100);
  const simExpenses = avgExpenses * (1 - params.expenseCutPct / 100);
  const delayedRevenue = simRevenue * (1 - params.receivablesDelayPct / 100);

  // Project 6 months
  const now = new Date();
  let balance = initialBalance;
  // Add realized balance
  for (const r of receivables) {
    if (r.status === "pago" && r.paid_date) balance += r.amount;
  }
  for (const p of payables) {
    if (p.status === "pago" && p.paid_date) balance -= p.amount;
  }

  const projection: SimulationResult["monthlyProjection"] = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    balance += delayedRevenue - simExpenses;
    projection.push({ month, revenue: delayedRevenue, expenses: simExpenses, balance });
  }

  const projectedMarginPct = delayedRevenue > 0
    ? ((delayedRevenue - simExpenses) / delayedRevenue) * 100
    : 0;
  const projectedRunway = simExpenses > 0 ? balance / simExpenses : Infinity;

  return {
    projectedCash: balance,
    projectedRunway: Math.max(0, projectedRunway),
    projectedMarginPct,
    monthlyProjection: projection,
  };
}

// ── Insights Engine ───────────────────────────────────────────

export interface FinancialInsight {
  id: string;
  icon: "trending-down" | "trending-up" | "alert-triangle" | "users" | "clock" | "target";
  message: string;
  severity: "danger" | "warning" | "info" | "success";
}

export function computeInsights(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  clients: FinClientRow[],
  costCenters: CostCenterRow[],
  initialBalance: number
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Margin trend (last 3 months)
  const margins: number[] = [];
  for (let i = -1; i >= -3; i--) {
    const m = getMonthRange(i);
    let mRev = 0;
    let mExp = 0;
    for (const r of receivables) {
      if (r.status === "cancelado") continue;
      const dd = r.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mRev += r.amount;
    }
    for (const p of payables) {
      if (p.status === "cancelado") continue;
      const dd = p.due_date.slice(0, 10);
      if (dd >= m.start && dd <= m.end) mExp += p.amount;
    }
    margins.push(mRev > 0 ? ((mRev - mExp) / mRev) * 100 : 0);
  }
  if (margins.length >= 2 && margins[0] < margins[margins.length - 1]) {
    const drop = Math.abs(margins[margins.length - 1] - margins[0]);
    if (drop > 3) {
      insights.push({
        id: "margin_decline",
        icon: "trending-down",
        message: `Margem caiu ${drop.toFixed(1)}% nos ultimos 3 meses.`,
        severity: drop > 10 ? "danger" : "warning",
      });
    }
  }

  // 2. Most profitable cost center
  const ccAnalysis = computeCostCenterAnalysis(payables, receivables, costCenters);
  const bestCC = ccAnalysis.find((c) => c.margin > 0 && c.costCenterId !== null);
  if (bestCC) {
    insights.push({
      id: "best_cc",
      icon: "target",
      message: `Centro "${bestCC.costCenterName}" possui maior lucratividade (margem ${bestCC.marginPct.toFixed(0)}%).`,
      severity: "success",
    });
  }

  // 3. Cash risk
  const cashFlow = computeIntelligentCashFlow(payables, receivables, initialBalance, 90);
  const negativeDay = cashFlow.days.find((d) => d.balance < 0);
  if (negativeDay) {
    const daysUntil = Math.round(
      (new Date(negativeDay.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil > 0) {
      insights.push({
        id: "cash_risk",
        icon: "alert-triangle",
        message: `Existe risco de caixa em ${daysUntil} dias.`,
        severity: "danger",
      });
    }
  }

  // 4. Revenue concentration
  const concentration = computeRevenueConcentration(receivables, clients);
  if (concentration.length >= 2) {
    const top2Pct = concentration.slice(0, 2).reduce((sum, c) => sum + c.pct, 0);
    if (top2Pct > 60) {
      insights.push({
        id: "revenue_concentration",
        icon: "users",
        message: `${top2Pct.toFixed(0)}% da receita esta concentrada em 2 clientes.`,
        severity: top2Pct > 75 ? "danger" : "warning",
      });
    }
  }

  // 5. Overdue receivables volume
  const overdueReceivables = receivables.filter(
    (r) => !["pago", "cancelado"].includes(r.status ?? "") && r.due_date < todayStr
  );
  const activeReceivables = receivables.filter((r) => r.status !== "cancelado");
  if (activeReceivables.length > 0) {
    const overduePct = (overdueReceivables.length / activeReceivables.length) * 100;
    if (overduePct > 10) {
      insights.push({
        id: "overdue_volume",
        icon: "clock",
        message: `${overduePct.toFixed(0)}% dos recebiveis estao vencidos.`,
        severity: overduePct > 25 ? "danger" : "warning",
      });
    }
  }

  // 6. Burn rate trend
  const kpis = computeExecutiveKPIs(payables, receivables, initialBalance);
  if (kpis.burnRateVariation > 10) {
    insights.push({
      id: "burn_rate_up",
      icon: "trending-up",
      message: `Taxa de queima aumentou ${kpis.burnRateVariation.toFixed(0)}% em relacao ao trimestre anterior.`,
      severity: kpis.burnRateVariation > 20 ? "danger" : "warning",
    });
  }

  // Sort by severity, return max 5
  const severityOrder = { danger: 0, warning: 1, info: 2, success: 3 };
  return insights
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);
}

// ── DRE / Margin helpers (client-side aggregation) ──────────

export interface DRELine {
  category: string;
  categoryId: string | null;
  revenue: number;
  expenses: number;
  margin: number;
  marginPct: number;
}

export function computeDRE(
  payables: PayableRow[],
  receivables: ReceivableRow[],
  categories: CategoryRow[]
): DRELine[] {
  const catMap = new Map<string, { name: string; revenue: number; expenses: number }>();

  // Group receivables by category
  for (const r of receivables) {
    if (r.status === "cancelado") continue;
    const catName = "Receitas";
    const entry = catMap.get(catName) ?? { name: catName, revenue: 0, expenses: 0 };
    entry.revenue += r.amount;
    catMap.set(catName, entry);
  }

  // Group payables by category
  for (const p of payables) {
    if (p.status === "cancelado") continue;
    const cat = categories.find((c) => c.id === p.category_id);
    const catName = cat?.name ?? "Sem Categoria";
    const entry = catMap.get(catName) ?? { name: catName, revenue: 0, expenses: 0 };
    entry.expenses += p.amount;
    catMap.set(catName, entry);
  }

  const lines: DRELine[] = [];
  for (const [key, val] of catMap) {
    const margin = val.revenue - val.expenses;
    lines.push({
      category: key,
      categoryId: null,
      revenue: val.revenue,
      expenses: val.expenses,
      margin,
      marginPct: val.revenue > 0 ? (margin / val.revenue) * 100 : val.expenses > 0 ? -100 : 0,
    });
  }

  return lines.sort((a, b) => b.margin - a.margin);
}
