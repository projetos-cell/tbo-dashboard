import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];
type BankTransactionRow = Database["public"]["Tables"]["bank_transactions"]["Row"];
type BankImportRow = Database["public"]["Tables"]["bank_imports"]["Row"];
type ReconciliationRuleRow = Database["public"]["Tables"]["reconciliation_rules"]["Row"];
type FinTransactionRow = Database["public"]["Tables"]["fin_transactions"]["Row"];
type MonthlyClosingRow = Database["public"]["Tables"]["monthly_closings"]["Row"];
type BalanceSnapshotRow = Database["public"]["Tables"]["fin_balance_snapshots"]["Row"];

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

// ── Bank Transactions ────────────────────────────────────────

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

// ── Reconciliation Rules ─────────────────────────────────────

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
