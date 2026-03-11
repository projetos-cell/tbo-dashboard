import type { FinanceSupabase } from "./finance-types";
import {
  TABLE_TRANSACTIONS,
  TABLE_BANK_STATEMENTS,
  TABLE_CASH_ENTRIES,
  type FinanceTransaction,
  type CashFlowPoint,
  type BankStatement,
  type BankStatementFilters,
} from "./finance-types";

// ── Cash Flow Projection ─────────────────────────────────────────────────────

export async function getFinanceCashFlowProjection(
  supabase: FinanceSupabase,
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

// ── Bank Statements ──────────────────────────────────────────────────────────

export async function getBankStatements(
  supabase: FinanceSupabase,
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
  supabase: FinanceSupabase
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
  supabase: FinanceSupabase,
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
