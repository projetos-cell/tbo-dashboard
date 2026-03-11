import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getFinanceCashFlowProjection,
  getBankStatements,
  getLatestBankStatementBalance,
  getBankStatementCashFlow,
} from "../services/finance-cashflow";
import type { FinanceSupabase } from "../services/finance-types";

// ── Mock Supabase Factory ─────────────────────────────────────────────────────

type ChainResult = {
  data: unknown;
  error: null | { message: string };
  count?: number | null;
};

/**
 * Creates a chainable mock that mimics Supabase's query builder.
 * Every chainable method (.select, .eq, .gte, .lte, .order, etc.) returns `this`
 * so calls can be stacked in any order. The final result is resolved via
 * implicit thenable (await), returning `resolveValue`.
 */
function createChainMock(resolveValue: ChainResult) {
  const chain: Record<string, unknown> = {};

  const chainMethods = [
    "select",
    "eq",
    "neq",
    "in",
    "not",
    "gte",
    "lte",
    "gt",
    "lt",
    "order",
    "limit",
    "range",
    "maybeSingle",
    "single",
  ];

  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // Make the chain thenable so `await query` resolves to resolveValue
  chain.then = (resolve: (v: ChainResult) => void) => {
    resolve(resolveValue);
    return Promise.resolve(resolveValue);
  };

  return chain;
}

/**
 * Creates a mock SupabaseClient where `.from(table)` returns a specific
 * chain per call index. Pass an array of ChainResults — one per `.from()` call.
 */
function createMockSupabase(calls: ChainResult[]) {
  let callIndex = 0;
  const fromFn = vi.fn().mockImplementation(() => {
    const idx = callIndex++;
    return createChainMock(calls[idx] ?? { data: null, error: null });
  });

  return { from: fromFn } as unknown as FinanceSupabase;
}

// Freeze "today" for deterministic tests
const FIXED_TODAY = new Date("2026-03-11T00:00:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});

// ── getFinanceCashFlowProjection ────────────────────────────────────────────

describe("getFinanceCashFlowProjection", () => {
  it("accumulates running balance from starting balance + daily inflows - outflows", async () => {
    const supabase = createMockSupabase([
      // 1st call: bank_statements balance
      { data: { balance: 10000 }, error: null },
      // 2nd call: cash_entries
      { data: null, error: null },
      // 3rd call: transactions
      {
        data: [
          { type: "receita", amount: 5000, due_date: "2026-03-11" },
          { type: "despesa", amount: 2000, due_date: "2026-03-11" },
          { type: "receita", amount: 1000, due_date: "2026-03-12" },
        ],
        error: null,
      },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 3);

    expect(result).toHaveLength(4); // days 0..3
    // Day 0 (03-11): 10000 + 5000 - 2000 = 13000
    expect(result[0].balance).toBe(13000);
    expect(result[0].inflow).toBe(5000);
    expect(result[0].outflow).toBe(2000);
    // Day 1 (03-12): 13000 + 1000 - 0 = 14000
    expect(result[1].balance).toBe(14000);
    expect(result[1].inflow).toBe(1000);
    expect(result[1].outflow).toBe(0);
    // Day 2 (03-13): 14000 + 0 - 0 = 14000
    expect(result[2].balance).toBe(14000);
  });

  it("uses bank statement balance as starting balance (priority 1)", async () => {
    const supabase = createMockSupabase([
      { data: { balance: 50000 }, error: null },
      { data: { amount: 30000 }, error: null }, // cash entry — should be ignored
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 1);

    // balance starts at 50000, no transactions → stays 50000
    expect(result[0].balance).toBe(50000);
  });

  it("falls back to manual cash entry when no bank statement balance", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null }, // no bank statement
      { data: { amount: 20000 }, error: null }, // cash entry fallback
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 1);

    expect(result[0].balance).toBe(20000);
  });

  it("defaults to 0 when neither bank statement nor cash entry exists", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 1);

    expect(result[0].balance).toBe(0);
  });

  it("returns flat balance across days when no transactions exist", async () => {
    const supabase = createMockSupabase([
      { data: { balance: 5000 }, error: null },
      { data: null, error: null },
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 3);

    expect(result).toHaveLength(4);
    for (const point of result) {
      expect(point.balance).toBe(5000);
      expect(point.inflow).toBe(0);
      expect(point.outflow).toBe(0);
    }
  });

  it("skips transactions without due_date", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      {
        data: [
          { type: "receita", amount: 1000, due_date: null },
          { type: "receita", amount: 2000, due_date: "2026-03-11" },
        ],
        error: null,
      },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 1);

    // Only the 2000 receita counts
    expect(result[0].inflow).toBe(2000);
    expect(result[0].balance).toBe(2000);
  });

  it("allows negative balance (overdraft)", async () => {
    const supabase = createMockSupabase([
      { data: { balance: 1000 }, error: null },
      { data: null, error: null },
      {
        data: [{ type: "despesa", amount: 5000, due_date: "2026-03-11" }],
        error: null,
      },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 1);

    expect(result[0].balance).toBe(-4000); // 1000 - 5000
  });

  it("defaults to 30 days when no days parameter is given", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase);

    expect(result).toHaveLength(31); // day 0..30 inclusive
  });

  it("respects custom days parameter", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 7);

    expect(result).toHaveLength(8); // day 0..7 inclusive
  });

  it("formats labels as DD/MM with zero-padding", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      { data: [], error: null },
    ]);

    const result = await getFinanceCashFlowProjection(supabase, 0);

    // March 11 → "11/03"
    expect(result[0].label).toBe("11/03");
  });

  it("throws on supabase error", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: { message: "connection failed" } },
    ]);

    await expect(getFinanceCashFlowProjection(supabase, 1)).rejects.toThrow(
      "connection failed"
    );
  });
});

// ── getBankStatements ───────────────────────────────────────────────────────

describe("getBankStatements", () => {
  it("calculates pagination range from page and pageSize", async () => {
    const chain = createChainMock({
      data: [{ id: "1" }],
      error: null,
      count: 1,
    });
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
    } as unknown as FinanceSupabase;

    await getBankStatements(supabase, { page: 2, pageSize: 10 });

    // page 2, size 10 → from=10, to=19
    expect(chain.range).toHaveBeenCalledWith(10, 19);
  });

  it("defaults to page 1 and pageSize 50", async () => {
    const chain = createChainMock({ data: [], error: null, count: 0 });
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
    } as unknown as FinanceSupabase;

    await getBankStatements(supabase);

    expect(chain.range).toHaveBeenCalledWith(0, 49);
  });

  it("applies date range filters when provided", async () => {
    const chain = createChainMock({ data: [], error: null, count: 0 });
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
    } as unknown as FinanceSupabase;

    await getBankStatements(supabase, {
      dateFrom: "2026-01-01",
      dateTo: "2026-03-31",
    });

    expect(chain.gte).toHaveBeenCalledWith("date", "2026-01-01");
    expect(chain.lte).toHaveBeenCalledWith("date", "2026-03-31");
  });

  it("applies account filter when bankAccountId is provided", async () => {
    const chain = createChainMock({ data: [], error: null, count: 0 });
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
    } as unknown as FinanceSupabase;

    await getBankStatements(supabase, { bankAccountId: "acc-123" });

    expect(chain.eq).toHaveBeenCalledWith("bank_account_id", "acc-123");
  });

  it("applies type filter when type is provided", async () => {
    const chain = createChainMock({ data: [], error: null, count: 0 });
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
    } as unknown as FinanceSupabase;

    await getBankStatements(supabase, { type: "credit" });

    expect(chain.eq).toHaveBeenCalledWith("type", "credit");
  });

  it("returns empty data and count 0 for no results", async () => {
    const supabase = createMockSupabase([
      { data: [], error: null, count: 0 },
    ]);

    const result = await getBankStatements(supabase);

    expect(result).toEqual({ data: [], count: 0 });
  });

  it("throws on supabase error", async () => {
    const supabase = createMockSupabase([
      { data: null, error: { message: "permission denied" } },
    ]);

    await expect(getBankStatements(supabase)).rejects.toThrow(
      "permission denied"
    );
  });
});

// ── getLatestBankStatementBalance ────────────────────────────────────────────

describe("getLatestBankStatementBalance", () => {
  it("returns latest non-null balance with date", async () => {
    const supabase = createMockSupabase([
      {
        data: { balance: 42000, date: "2026-03-10" },
        error: null,
      },
    ]);

    const result = await getLatestBankStatementBalance(supabase);

    expect(result).toEqual({ balance: 42000, date: "2026-03-10" });
  });

  it("returns null when no statements exist", async () => {
    const supabase = createMockSupabase([
      { data: null, error: null },
    ]);

    const result = await getLatestBankStatementBalance(supabase);

    expect(result).toBeNull();
  });

  it("throws on supabase error", async () => {
    const supabase = createMockSupabase([
      { data: null, error: { message: "timeout" } },
    ]);

    await expect(getLatestBankStatementBalance(supabase)).rejects.toThrow(
      "timeout"
    );
  });
});

// ── getBankStatementCashFlow ────────────────────────────────────────────────

describe("getBankStatementCashFlow", () => {
  it("aggregates daily inflows and outflows", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-03-10", amount: 5000, type: "credit", balance: null },
          { date: "2026-03-10", amount: 2000, type: "debit", balance: null },
          { date: "2026-03-10", amount: 3000, type: "credit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-10"
    );

    expect(result).toHaveLength(1);
    expect(result[0].inflow).toBe(8000); // 5000 + 3000
    expect(result[0].outflow).toBe(2000);
  });

  it("maps credit type to inflow and anything else to outflow", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-03-10", amount: 1000, type: "credit", balance: null },
          { date: "2026-03-10", amount: 500, type: "debit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-10"
    );

    expect(result[0].inflow).toBe(1000);
    expect(result[0].outflow).toBe(500);
  });

  it("uses lastBalance snapshot when available instead of accumulating", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-03-10", amount: 1000, type: "credit", balance: 15000 },
          { date: "2026-03-11", amount: 500, type: "debit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-11"
    );

    // Day 1: has balance snapshot → use 15000
    expect(result[0].balance).toBe(15000);
    // Day 2: no snapshot → runningBalance(15000) + inflow(0) - outflow(500) = 14500
    expect(result[1].balance).toBe(14500);
  });

  it("accumulates running balance when no lastBalance is present", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-03-10", amount: 3000, type: "credit", balance: null },
          { date: "2026-03-11", amount: 1000, type: "debit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-11"
    );

    // Day 1: 0 + 3000 - 0 = 3000
    expect(result[0].balance).toBe(3000);
    // Day 2: 3000 + 0 - 1000 = 2000
    expect(result[1].balance).toBe(2000);
  });

  it("formats labels as DD/MM zero-padded", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-01-05", amount: 100, type: "credit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-01-05",
      "2026-01-05"
    );

    expect(result[0].label).toBe("05/01");
  });

  it("returns sorted points by date ascending", async () => {
    const supabase = createMockSupabase([
      {
        data: [
          { date: "2026-03-12", amount: 100, type: "credit", balance: null },
          { date: "2026-03-10", amount: 200, type: "credit", balance: null },
          { date: "2026-03-11", amount: 300, type: "debit", balance: null },
        ],
        error: null,
      },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-12"
    );

    expect(result.map((p) => p.date)).toEqual([
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
    ]);
  });

  it("returns empty array when no data", async () => {
    const supabase = createMockSupabase([
      { data: [], error: null },
    ]);

    const result = await getBankStatementCashFlow(
      supabase,
      "2026-03-10",
      "2026-03-10"
    );

    expect(result).toEqual([]);
  });

  it("throws on supabase error", async () => {
    const supabase = createMockSupabase([
      { data: null, error: { message: "table not found" } },
    ]);

    await expect(
      getBankStatementCashFlow(supabase, "2026-03-10", "2026-03-10")
    ).rejects.toThrow("table not found");
  });
});
