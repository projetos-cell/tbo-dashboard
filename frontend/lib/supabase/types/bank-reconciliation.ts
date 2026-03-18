// ── Bank Reconciliation Types ─────────────────────────────────────────────────
// Gerado manualmente para as tabelas: finance_bank_accounts,
// finance_bank_transactions, finance_reconciliation_rules
// ─────────────────────────────────────────────────────────────────────────────

export type BankAccountType = "corrente" | "poupanca" | "investimento" | "pagamento";
export type BankAccountStatus = "active" | "inactive" | "error";
export type BankTransactionType = "credit" | "debit";

// ── finance_bank_accounts ─────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  tenant_id: string;
  bank_code: string;
  bank_name: string;
  agency: string;
  account_number: string;
  account_type: BankAccountType;
  balance: number;
  last_sync_at: string | null;
  status: BankAccountStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccountInsert {
  id?: string;
  tenant_id: string;
  bank_code: string;
  bank_name?: string;
  agency: string;
  account_number: string;
  account_type?: BankAccountType;
  balance?: number;
  last_sync_at?: string | null;
  status?: BankAccountStatus;
  notes?: string | null;
}

export interface BankAccountUpdate {
  bank_name?: string;
  agency?: string;
  account_number?: string;
  account_type?: BankAccountType;
  balance?: number;
  last_sync_at?: string | null;
  status?: BankAccountStatus;
  notes?: string | null;
  updated_at?: string;
}

// ── finance_bank_transactions ─────────────────────────────────────────────────

export interface BankTransaction {
  id: string;
  tenant_id: string;
  bank_account_id: string;
  transaction_date: string;
  amount: number;
  type: BankTransactionType;
  description: string;
  category: string | null;
  reference_id: string | null;
  ofx_id: string | null;
  reconciled: boolean;
  reconciled_at: string | null;
  reconciled_by: string | null;
  finance_tx_id: string | null;
  created_at: string;
}

export interface BankTransactionInsert {
  id?: string;
  tenant_id: string;
  bank_account_id: string;
  transaction_date: string;
  amount: number;
  type: BankTransactionType;
  description?: string;
  category?: string | null;
  reference_id?: string | null;
  ofx_id?: string | null;
  reconciled?: boolean;
  reconciled_at?: string | null;
  reconciled_by?: string | null;
  finance_tx_id?: string | null;
}

export interface BankTransactionUpdate {
  description?: string;
  category?: string | null;
  reconciled?: boolean;
  reconciled_at?: string | null;
  reconciled_by?: string | null;
  finance_tx_id?: string | null;
}

// ── finance_reconciliation_rules ──────────────────────────────────────────────

export interface ReconciliationRule {
  id: string;
  tenant_id: string;
  name: string;
  pattern: string;
  category: string | null;
  description: string | null;
  auto_match: boolean;
  priority: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReconciliationRuleInsert {
  id?: string;
  tenant_id: string;
  name: string;
  pattern: string;
  category?: string | null;
  description?: string | null;
  auto_match?: boolean;
  priority?: number;
  is_active?: boolean;
  created_by?: string | null;
}

export interface ReconciliationRuleUpdate {
  name?: string;
  pattern?: string;
  category?: string | null;
  description?: string | null;
  auto_match?: boolean;
  priority?: number;
  is_active?: boolean;
  updated_at?: string;
}

// ── Filter / query types ──────────────────────────────────────────────────────

export interface BankTransactionFilters {
  bank_account_id?: string;
  reconciled?: boolean;
  type?: BankTransactionType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ReconciliationSummary {
  total: number;
  reconciled: number;
  pending: number;
  reconciledPct: number;
  totalCredit: number;
  totalDebit: number;
  balance: number;
}
