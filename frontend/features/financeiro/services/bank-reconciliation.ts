import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BankAccount,
  BankAccountInsert,
  BankAccountUpdate,
  BankTransaction,
  BankTransactionInsert,
  BankTransactionUpdate,
  BankTransactionFilters,
  ReconciliationRule,
  ReconciliationRuleInsert,
  ReconciliationRuleUpdate,
  ReconciliationSummary,
} from "@/lib/supabase/types/bank-reconciliation";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE_BANK_ACCOUNTS = "finance_bank_accounts" as const;
const TABLE_BANK_TRANSACTIONS = "finance_bank_transactions" as const;
const TABLE_RECONCILIATION_RULES = "finance_reconciliation_rules" as const;

const DEFAULT_PAGE_SIZE = 50;

// Use untyped client — tables not yet in generated Database type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Supabase = SupabaseClient<any>;

// ── Bank Accounts ─────────────────────────────────────────────────────────────

export async function listBankAccounts(
  supabase: Supabase,
  tenantId: string,
  onlyActive = true
): Promise<BankAccount[]> {
  let query = supabase
    .from(TABLE_BANK_ACCOUNTS)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("bank_name", { ascending: true });

  if (onlyActive) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;
  if (error) throw new Error(`listBankAccounts: ${error.message}`);
  return (data ?? []) as unknown as BankAccount[];
}

export async function getBankAccount(
  supabase: Supabase,
  id: string
): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from(TABLE_BANK_ACCOUNTS)
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getBankAccount: ${error.message}`);
  }
  return data as unknown as BankAccount;
}

export async function createBankAccount(
  supabase: Supabase,
  payload: BankAccountInsert
): Promise<BankAccount> {
  const { data, error } = await supabase
    .from(TABLE_BANK_ACCOUNTS)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw new Error(`createBankAccount: ${error.message}`);
  return data as unknown as BankAccount;
}

export async function updateBankAccount(
  supabase: Supabase,
  id: string,
  payload: BankAccountUpdate
): Promise<BankAccount> {
  const { data, error } = await supabase
    .from(TABLE_BANK_ACCOUNTS)
    .update({ ...payload, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateBankAccount: ${error.message}`);
  return data as unknown as BankAccount;
}

// ── Bank Transactions ─────────────────────────────────────────────────────────

export async function listBankTransactions(
  supabase: Supabase,
  tenantId: string,
  filters: BankTransactionFilters = {}
): Promise<{ data: BankTransaction[]; count: number }> {
  const {
    bank_account_id,
    reconciled,
    type,
    dateFrom,
    dateTo,
    search,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_BANK_TRANSACTIONS)
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("transaction_date", { ascending: false })
    .range(from, to);

  if (bank_account_id) query = query.eq("bank_account_id", bank_account_id);
  if (reconciled !== undefined) query = query.eq("reconciled", reconciled);
  if (type) query = query.eq("type", type);
  if (dateFrom) query = query.gte("transaction_date", dateFrom);
  if (dateTo) query = query.lte("transaction_date", dateTo);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(`listBankTransactions: ${error.message}`);
  return { data: (data ?? []) as unknown as BankTransaction[], count: count ?? 0 };
}

export async function insertBankTransactions(
  supabase: Supabase,
  transactions: BankTransactionInsert[]
): Promise<{ inserted: number; skipped: number }> {
  if (transactions.length === 0) return { inserted: 0, skipped: 0 };

  // upsert with conflict on (bank_account_id, ofx_id) — skip duplicates
  const { data, error } = await supabase
    .from(TABLE_BANK_TRANSACTIONS)
    .upsert(transactions as never, {
      onConflict: "bank_account_id,ofx_id",
      ignoreDuplicates: true,
    })
    .select("id");

  if (error) throw new Error(`insertBankTransactions: ${error.message}`);
  const inserted = data?.length ?? 0;
  return { inserted, skipped: transactions.length - inserted };
}

export async function updateBankTransaction(
  supabase: Supabase,
  id: string,
  payload: BankTransactionUpdate
): Promise<BankTransaction> {
  const { data, error } = await supabase
    .from(TABLE_BANK_TRANSACTIONS)
    .update(payload as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateBankTransaction: ${error.message}`);
  return data as unknown as BankTransaction;
}

export async function reconcileTransaction(
  supabase: Supabase,
  bankTxId: string,
  financeTxId: string,
  userId: string
): Promise<BankTransaction> {
  return updateBankTransaction(supabase, bankTxId, {
    reconciled: true,
    reconciled_at: new Date().toISOString(),
    reconciled_by: userId,
    finance_tx_id: financeTxId,
  });
}

export async function unreconcileTransaction(
  supabase: Supabase,
  bankTxId: string
): Promise<BankTransaction> {
  return updateBankTransaction(supabase, bankTxId, {
    reconciled: false,
    reconciled_at: null,
    reconciled_by: null,
    finance_tx_id: null,
  });
}

// ── Reconciliation Summary ────────────────────────────────────────────────────

export async function getReconciliationSummary(
  supabase: Supabase,
  tenantId: string,
  bankAccountId?: string
): Promise<ReconciliationSummary> {
  let query = supabase
    .from(TABLE_BANK_TRANSACTIONS)
    .select("amount, type, reconciled")
    .eq("tenant_id", tenantId);

  if (bankAccountId) query = query.eq("bank_account_id", bankAccountId);

  const { data, error } = await query;
  if (error) throw new Error(`getReconciliationSummary: ${error.message}`);

  const rows = (data ?? []) as unknown as Pick<BankTransaction, "amount" | "type" | "reconciled">[];
  const total = rows.length;
  const reconciled = rows.filter((r) => r.reconciled).length;
  const totalCredit = rows
    .filter((r) => r.type === "credit")
    .reduce((acc, r) => acc + r.amount, 0);
  const totalDebit = rows
    .filter((r) => r.type === "debit")
    .reduce((acc, r) => acc + r.amount, 0);

  return {
    total,
    reconciled,
    pending: total - reconciled,
    reconciledPct: total > 0 ? Math.round((reconciled / total) * 100) : 0,
    totalCredit,
    totalDebit,
    balance: totalCredit - totalDebit,
  };
}

// ── Reconciliation Rules ──────────────────────────────────────────────────────

export async function listReconciliationRules(
  supabase: Supabase,
  tenantId: string
): Promise<ReconciliationRule[]> {
  const { data, error } = await supabase
    .from(TABLE_RECONCILIATION_RULES)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("priority", { ascending: true });
  if (error) throw new Error(`listReconciliationRules: ${error.message}`);
  return (data ?? []) as unknown as ReconciliationRule[];
}

export async function createReconciliationRule(
  supabase: Supabase,
  payload: ReconciliationRuleInsert
): Promise<ReconciliationRule> {
  const { data, error } = await supabase
    .from(TABLE_RECONCILIATION_RULES)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw new Error(`createReconciliationRule: ${error.message}`);
  return data as unknown as ReconciliationRule;
}

export async function updateReconciliationRule(
  supabase: Supabase,
  id: string,
  payload: ReconciliationRuleUpdate
): Promise<ReconciliationRule> {
  const { data, error } = await supabase
    .from(TABLE_RECONCILIATION_RULES)
    .update({ ...payload, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateReconciliationRule: ${error.message}`);
  return data as unknown as ReconciliationRule;
}

export async function deleteReconciliationRule(
  supabase: Supabase,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_RECONCILIATION_RULES)
    .update({ is_active: false, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw new Error(`deleteReconciliationRule: ${error.message}`);
}
