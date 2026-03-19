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
  // 1. Get bank transaction to extract paid date and amount
  const { data: bankTx, error: bankErr } = await supabase
    .from(TABLE_BANK_TRANSACTIONS)
    .select("amount, transaction_date")
    .eq("id", bankTxId)
    .single();

  if (bankErr) throw new Error(`reconcileTransaction: ${bankErr.message}`);
  const { amount, transaction_date } = bankTx as { amount: number; transaction_date: string };

  // 2. Update bank transaction with reconciliation metadata
  const result = await updateBankTransaction(supabase, bankTxId, {
    reconciled: true,
    reconciled_at: new Date().toISOString(),
    reconciled_by: userId,
    finance_tx_id: financeTxId,
  });

  // 3. Update finance transaction: status → pago, set paid_date and paid_amount
  const { error: finErr } = await supabase
    .from("finance_transactions")
    .update({
      status: "pago",
      paid_amount: Math.abs(amount),
      paid_date: transaction_date,
      reconciled_source: "manual",
      updated_by: userId,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", financeTxId);

  if (finErr) throw new Error(`reconcileTransaction (finance_tx update): ${finErr.message}`);

  return result;
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

// ── Match Confidence Score ─────────────────────────────────────────────────────

export interface MatchCandidate {
  /** Bank transaction amount (may be negative for debits) */
  bankAmount: number;
  /** YYYY-MM-DD */
  bankDate: string;
  bankDescription: string;
  /** Finance transaction expected amount (always positive) */
  financeAmount: number;
  /** YYYY-MM-DD */
  financeDate: string;
  financeDescription: string;
  /** Whether a reconciliation rule matches this pair */
  ruleMatches?: boolean;
}

export interface MatchScore {
  /** 0–100 */
  score: number;
  /** Visual tier: "alta" ≥80, "media" ≥50, "baixa" <50 */
  tier: "alta" | "media" | "baixa";
  breakdown: {
    amount: number;
    date: number;
    description: number;
    rule: number;
  };
}

/** Word-overlap Jaccard similarity (0–1) between two strings */
function descriptionSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const wa = new Set(normalize(a));
  const wb = new Set(normalize(b));
  if (wa.size === 0 || wb.size === 0) return 0;

  let intersection = 0;
  for (const w of wa) {
    if (wb.has(w)) intersection++;
  }
  const union = wa.size + wb.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate match confidence score (0–100) between a bank transaction and a finance transaction.
 *
 * Scoring weights:
 *   +40 pts  amount matches within R$0.01 (partial credit up to +20 for near-match within R$1)
 *   +25 pts  date within ±3 days (graded: ±0 days = 25, ±1-3 = 15, ±4-7 = 5)
 *   +20 pts  description word-overlap similarity
 *   +15 pts  reconciliation rule explicitly matched
 */
export function calculateMatchScore(candidate: MatchCandidate): MatchScore {
  const {
    bankAmount,
    bankDate,
    financeAmount,
    financeDate,
    bankDescription,
    financeDescription,
    ruleMatches,
  } = candidate;

  // ── Amount (+40) ────────────────────────────────────────────────────────────
  const amountDiff = Math.abs(Math.abs(bankAmount) - Math.abs(financeAmount));
  let amountPts = 0;
  if (amountDiff <= 0.01) {
    amountPts = 40;
  } else if (amountDiff <= 0.10) {
    amountPts = 30;
  } else if (amountDiff <= 1.00) {
    amountPts = 15;
  }

  // ── Date proximity (+25) ────────────────────────────────────────────────────
  const bDate = new Date(bankDate);
  const fDate = new Date(financeDate);
  const diffDays = Math.abs((bDate.getTime() - fDate.getTime()) / (1000 * 60 * 60 * 24));
  let datePts = 0;
  if (diffDays <= 0.5) {
    datePts = 25;
  } else if (diffDays <= 3) {
    datePts = 15;
  } else if (diffDays <= 7) {
    datePts = 5;
  }

  // ── Description similarity (+20) ────────────────────────────────────────────
  const sim = descriptionSimilarity(bankDescription, financeDescription);
  const descPts = Math.round(sim * 20);

  // ── Rule match (+15) ────────────────────────────────────────────────────────
  const rulePts = ruleMatches ? 15 : 0;

  const score = Math.min(100, amountPts + datePts + descPts + rulePts);
  const tier: MatchScore["tier"] = score >= 80 ? "alta" : score >= 50 ? "media" : "baixa";

  return {
    score,
    tier,
    breakdown: {
      amount: amountPts,
      date: datePts,
      description: descPts,
      rule: rulePts,
    },
  };
}

/**
 * Find best matching finance transactions for a bank transaction.
 * Returns candidates sorted by score descending.
 */
export async function findReconciliationCandidates(
  supabase: Supabase,
  tenantId: string,
  bankTx: { id: string; amount: number; transaction_date: string; description: string; type: string },
  rules: ReconciliationRule[]
): Promise<Array<{ transactionId: string; description: string; amount: number; date: string; score: MatchScore }>> {
  // ±7 day window around bank transaction date
  const txDate = new Date(bankTx.transaction_date);
  const windowFrom = new Date(txDate);
  windowFrom.setDate(windowFrom.getDate() - 7);
  const windowTo = new Date(txDate);
  windowTo.setDate(windowTo.getDate() + 7);

  const { data, error } = await supabase
    .from("finance_transactions")
    .select("id, description, amount, date, type, status")
    .eq("tenant_id", tenantId)
    .eq("type", bankTx.type === "credit" ? "receita" : "despesa")
    .not("status", "in", '("cancelado")')
    .gte("date", windowFrom.toISOString().split("T")[0])
    .lte("date", windowTo.toISOString().split("T")[0]);

  if (error) throw new Error(`findReconciliationCandidates: ${error.message}`);

  const candidates = (data ?? []) as Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    status: string;
  }>;

  // Check which rules match this bank transaction (rules use `pattern` field)
  const matchingRules = rules.filter((r) =>
    r.pattern &&
    bankTx.description.toLowerCase().includes(r.pattern.toLowerCase())
  );
  const hasRuleMatch = matchingRules.length > 0;

  return candidates
    .map((tx) => ({
      transactionId: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      score: calculateMatchScore({
        bankAmount: bankTx.amount,
        bankDate: bankTx.transaction_date,
        bankDescription: bankTx.description,
        financeAmount: tx.amount,
        financeDate: tx.date,
        financeDescription: tx.description,
        ruleMatches: hasRuleMatch,
      }),
    }))
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, 10);
}
