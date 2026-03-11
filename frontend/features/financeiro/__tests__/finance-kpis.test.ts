import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFounderKPIs, getRevenueConcentrationByClient } from "../services/finance-kpis";

// ── Mock Supabase factory ───────────────────────────────────────────────────

type SupabaseResponse = { data: unknown; error: unknown; count?: number };

/**
 * Creates a chainable query builder that records method calls and resolves
 * to the configured response. Every method returns `this` for chaining,
 * and the object itself is a thenable so `await` resolves to `{ data, error }`.
 */
function createQueryBuilder(response: SupabaseResponse) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "not",
    "gte",
    "lte",
    "gt",
    "lt",
    "is",
    "order",
    "limit",
    "single",
    "maybeSingle",
    "range",
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }

  // Make the builder thenable so `await builder` resolves to response
  builder.then = (resolve: (v: SupabaseResponse) => void) => {
    return Promise.resolve(response).then(resolve);
  };

  return builder;
}

/**
 * Creates a mock Supabase client where each `from(table)` call returns a
 * pre-configured query builder. Configure via a map of table -> response.
 *
 * For tables with multiple queries (e.g. finance_transactions called several
 * times with different filters), pass an array of responses that are consumed
 * in order.
 */
function createMockSupabase(
  tableResponses: Record<string, SupabaseResponse | SupabaseResponse[]>
) {
  const callCounts: Record<string, number> = {};

  return {
    from: vi.fn((table: string) => {
      callCounts[table] = (callCounts[table] || 0) + 1;
      const cfg = tableResponses[table];
      if (!cfg) {
        return createQueryBuilder({ data: null, error: null });
      }
      if (Array.isArray(cfg)) {
        const idx = Math.min(callCounts[table] - 1, cfg.length - 1);
        return createQueryBuilder(cfg[idx]);
      }
      return createQueryBuilder(cfg);
    }),
  } as unknown as Parameters<typeof getFounderKPIs>[0];
}

// ── getFounderKPIs ──────────────────────────────────────────────────────────

describe("getFounderKPIs", () => {
  it("calculates MTD revenue and expense using paid_amount with fallback to amount", async () => {
    const supabase = createMockSupabase({
      // mtdRes (call 1), apRes (call 2), arRes (call 3)
      finance_transactions: [
        {
          data: [
            { type: "receita", amount: 1000, paid_amount: 800, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
            { type: "receita", amount: 500, paid_amount: 0, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
            { type: "despesa", amount: 300, paid_amount: 250, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null }, // AP
        { data: [], error: null }, // AR
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    // paid_amount=800 used; paid_amount=0 falsy so fallback to amount=500
    expect(kpis.receitaMTD).toBe(800 + 500);
    // paid_amount=250 used
    expect(kpis.despesaMTD).toBe(250);
    expect(kpis.margemMTD).toBe(1300 - 250);
  });

  it("calculates margin % correctly with positive revenue", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        {
          data: [
            { type: "receita", amount: 0, paid_amount: 2000, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
            { type: "despesa", amount: 0, paid_amount: 500, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.margemPct).toBe(((2000 - 500) / 2000) * 100); // 75%
  });

  it("returns margin % = 0 when revenue is zero (no division by zero)", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        {
          data: [
            { type: "despesa", amount: 0, paid_amount: 100, cost_center_id: null, category_id: null, business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.receitaMTD).toBe(0);
    expect(kpis.margemPct).toBe(0);
  });

  it("sums A/P and A/R amounts for next 30 days", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        { data: [], error: null }, // mtd
        { data: [{ amount: 400 }, { amount: 600 }], error: null }, // AP
        { data: [{ amount: 1500 }, { amount: 2500 }], error: null }, // AR
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.apNext30).toBe(1000);
    expect(kpis.arNext30).toBe(4000);
  });

  it("builds cost center ranking (top 5, sorted desc) with metadata lookup", async () => {
    const ccId1 = "cc-1";
    const ccId2 = "cc-2";
    const ccId3 = "cc-3";

    const supabase = createMockSupabase({
      finance_transactions: [
        {
          data: [
            { type: "despesa", amount: 0, paid_amount: 300, cost_center_id: ccId1, category_id: null, business_unit: null, project_id: null },
            { type: "despesa", amount: 0, paid_amount: 700, cost_center_id: ccId2, category_id: null, business_unit: null, project_id: null },
            { type: "despesa", amount: 0, paid_amount: 200, cost_center_id: ccId1, category_id: null, business_unit: null, project_id: null },
            { type: "despesa", amount: 0, paid_amount: 100, cost_center_id: ccId3, category_id: null, business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: {
        data: [
          { id: ccId1, code: "CC01", name: "Marketing" },
          { id: ccId2, code: "CC02", name: "Operacoes" },
          { id: ccId3, code: "CC03", name: "Admin" },
        ],
        error: null,
      },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.costCenterRanking).toHaveLength(3);
    // Sorted desc: ccId2=700, ccId1=500, ccId3=100
    expect(kpis.costCenterRanking[0]).toEqual({ code: "CC02", name: "Operacoes", total: 700 });
    expect(kpis.costCenterRanking[1]).toEqual({ code: "CC01", name: "Marketing", total: 500 });
    expect(kpis.costCenterRanking[2]).toEqual({ code: "CC03", name: "Admin", total: 100 });
  });

  it("returns all zeros for empty transactions", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.receitaMTD).toBe(0);
    expect(kpis.despesaMTD).toBe(0);
    expect(kpis.margemMTD).toBe(0);
    expect(kpis.margemPct).toBe(0);
    expect(kpis.apNext30).toBe(0);
    expect(kpis.arNext30).toBe(0);
    expect(kpis.saldoAcumulado).toBe(0);
    expect(kpis.costCenterRanking).toEqual([]);
    expect(kpis.categoryRanking).toEqual([]);
    expect(kpis.buRevenue).toEqual([]);
    expect(kpis.projectRanking).toEqual([]);
  });

  it("uses fallback names when cost center metadata is missing", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        {
          data: [
            { type: "despesa", amount: 0, paid_amount: 500, cost_center_id: "unknown-cc", category_id: null, business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null }, // no matching CC
      finance_snapshots_daily: { data: null, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.costCenterRanking).toHaveLength(1);
    expect(kpis.costCenterRanking[0].code).toBe("\u2014"); // em dash fallback
    expect(kpis.costCenterRanking[0].name).toBe("Sem centro");
  });

  it("uses fallback names when category metadata is missing", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        {
          data: [
            { type: "despesa", amount: 0, paid_amount: 300, cost_center_id: null, category_id: "unknown-cat", business_unit: null, project_id: null },
          ],
          error: null,
        },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: null, error: null },
      finance_categories: { data: [], error: null }, // no matching category
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.categoryRanking).toHaveLength(1);
    expect(kpis.categoryRanking[0].name).toBe("Sem categoria");
    expect(kpis.categoryRanking[0].type).toBe("despesa");
  });

  it("reads saldoAcumulado from latest snapshot", async () => {
    const supabase = createMockSupabase({
      finance_transactions: [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ],
      finance_cost_centers: { data: [], error: null },
      finance_snapshots_daily: { data: { saldo_acumulado: 42000 }, error: null },
    });

    const kpis = await getFounderKPIs(supabase);

    expect(kpis.saldoAcumulado).toBe(42000);
  });
});

// ── getRevenueConcentrationByClient ─────────────────────────────────────────

describe("getRevenueConcentrationByClient", () => {
  it("returns clients sorted by revenue desc with correct percentages", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: "Client A", paid_amount: 3000, amount: 3000 },
          { counterpart: "Client B", paid_amount: 7000, amount: 7000 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    expect(result.clients).toHaveLength(2);
    expect(result.clients[0].client).toBe("Client B");
    expect(result.clients[0].revenue).toBe(7000);
    expect(result.clients[1].client).toBe("Client A");
    expect(result.clients[1].revenue).toBe(3000);
  });

  it("calculates percentage correctly (revenue / total * 100)", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: "Alpha", paid_amount: 250, amount: 250 },
          { counterpart: "Beta", paid_amount: 750, amount: 750 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    expect(result.totalRevenue).toBe(1000);
    expect(result.clients[0].pct).toBe(75); // Beta
    expect(result.clients[1].pct).toBe(25); // Alpha
  });

  it("assigns alert levels: >=50% critico, >=30% alta, else normal", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: "Dominante", paid_amount: 6000, amount: 6000 },
          { counterpart: "Grande", paid_amount: 3000, amount: 3000 },
          { counterpart: "Pequeno", paid_amount: 1000, amount: 1000 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    // Dominante: 60% >= 50 -> critico
    expect(result.clients[0].alertLevel).toBe("critico");
    // Grande: 30% >= 30 -> alta
    expect(result.clients[1].alertLevel).toBe("alta");
    // Pequeno: 10% < 30 -> normal
    expect(result.clients[2].alertLevel).toBe("normal");
  });

  it("calculates top5Pct as sum of first 5 client percentages", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: "C1", paid_amount: 100, amount: 100 },
          { counterpart: "C2", paid_amount: 200, amount: 200 },
          { counterpart: "C3", paid_amount: 300, amount: 300 },
          { counterpart: "C4", paid_amount: 400, amount: 400 },
          { counterpart: "C5", paid_amount: 500, amount: 500 },
          { counterpart: "C6", paid_amount: 600, amount: 600 },
          { counterpart: "C7", paid_amount: 900, amount: 900 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);
    const total = 100 + 200 + 300 + 400 + 500 + 600 + 900; // 3000

    // Top 5 sorted desc: C7=900, C6=600, C5=500, C4=400, C3=300 = 2700
    const expectedTop5Pct = (2700 / total) * 100; // 90%
    expect(result.top5Pct).toBeCloseTo(expectedTop5Pct, 5);
  });

  it("returns 0% for all clients when total revenue is zero (no division by zero)", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: "Empty", paid_amount: 0, amount: 0 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    expect(result.totalRevenue).toBe(0);
    expect(result.clients[0].pct).toBe(0);
    expect(result.top5Pct).toBe(0);
  });

  it('uses "Sem identificacao" for null counterpart (filtered out by .not("counterpart", "is", null))', async () => {
    // The query filters null counterparts at DB level, but if somehow a falsy
    // counterpart slips through, the code defaults to "Sem identificacao"
    const supabase = createMockSupabase({
      finance_transactions: {
        data: [
          { counterpart: null, paid_amount: 500, amount: 500 },
          { counterpart: "Real Client", paid_amount: 1000, amount: 1000 },
        ],
        error: null,
      },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    const fallbackClient = result.clients.find(
      (c) => c.client === "Sem identifica\u00e7\u00e3o"
    );
    expect(fallbackClient).toBeDefined();
    expect(fallbackClient!.revenue).toBe(500);
  });

  it("passes dateFrom and dateTo to query when provided", async () => {
    const fromSpy = vi.fn();
    const mockBuilder: Record<string, unknown> = {};
    const chainMethods = [
      "select", "eq", "neq", "in", "not", "gte", "lte", "gt", "lt",
      "is", "order", "limit", "single", "maybeSingle", "range",
    ];
    for (const method of chainMethods) {
      if (method === "gte" || method === "lte") {
        mockBuilder[method] = vi.fn().mockReturnValue(mockBuilder);
      } else {
        mockBuilder[method] = vi.fn().mockReturnValue(mockBuilder);
      }
    }
    mockBuilder.then = (resolve: (v: SupabaseResponse) => void) =>
      Promise.resolve({ data: [], error: null } as SupabaseResponse).then(resolve);

    const supabase = {
      from: vi.fn().mockReturnValue(mockBuilder),
    } as unknown as Parameters<typeof getRevenueConcentrationByClient>[0];

    await getRevenueConcentrationByClient(supabase, "2025-01-01", "2025-12-31");

    // Verify gte and lte were called with date params
    const gteCalls = (mockBuilder.gte as ReturnType<typeof vi.fn>).mock.calls;
    const lteCalls = (mockBuilder.lte as ReturnType<typeof vi.fn>).mock.calls;

    const gteDate = gteCalls.find(
      (call: unknown[]) => call[0] === "date" && call[1] === "2025-01-01"
    );
    const lteDate = lteCalls.find(
      (call: unknown[]) => call[0] === "date" && call[1] === "2025-12-31"
    );

    expect(gteDate).toBeDefined();
    expect(lteDate).toBeDefined();
  });

  it("throws on Supabase error", async () => {
    const supabase = createMockSupabase({
      finance_transactions: {
        data: null,
        error: { message: "connection refused" },
      },
    });

    await expect(
      getRevenueConcentrationByClient(supabase)
    ).rejects.toThrow("connection refused");
  });

  it("handles empty data (no transactions)", async () => {
    const supabase = createMockSupabase({
      finance_transactions: { data: [], error: null },
    });

    const result = await getRevenueConcentrationByClient(supabase);

    expect(result.clients).toEqual([]);
    expect(result.totalRevenue).toBe(0);
    expect(result.totalClients).toBe(0);
    expect(result.top5Pct).toBe(0);
  });
});
