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
