import { describe, it, expect } from "vitest";
import {
  financeFiltersSchema,
  bankStatementFiltersSchema,
  dateRangeSchema,
  createCashEntrySchema,
  upsertOperationalIndicatorSchema,
  daysParamSchema,
} from "../services/finance-schemas";

// ── financeFiltersSchema ────────────────────────────────────────────────────

describe("financeFiltersSchema", () => {
  it("accepts empty object", () => {
    expect(financeFiltersSchema.parse({})).toBeDefined();
  });

  it("accepts valid full filter", () => {
    const input = {
      type: "receita",
      status: "pago",
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      dateField: "date",
      search: "teste",
      page: 1,
      pageSize: 50,
    };
    const result = financeFiltersSchema.parse(input);
    expect(result.type).toBe("receita");
    expect(result.dateFrom).toBe("2026-01-01");
  });

  it("rejects invalid type", () => {
    expect(() => financeFiltersSchema.parse({ type: "invalid" })).toThrow();
  });

  it("rejects invalid date format", () => {
    expect(() => financeFiltersSchema.parse({ dateFrom: "01/01/2026" })).toThrow();
  });

  it("rejects search > 200 chars", () => {
    expect(() => financeFiltersSchema.parse({ search: "x".repeat(201) })).toThrow();
  });

  it("coerces page and pageSize from strings", () => {
    const result = financeFiltersSchema.parse({ page: "3", pageSize: "25" });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(25);
  });

  it("rejects pageSize > 500", () => {
    expect(() => financeFiltersSchema.parse({ pageSize: 501 })).toThrow();
  });
});

// ── bankStatementFiltersSchema ──────────────────────────────────────────────

describe("bankStatementFiltersSchema", () => {
  it("accepts empty object", () => {
    expect(bankStatementFiltersSchema.parse({})).toBeDefined();
  });

  it("accepts valid filters", () => {
    const result = bankStatementFiltersSchema.parse({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      type: "credit",
    });
    expect(result.type).toBe("credit");
  });

  it("rejects invalid statement type", () => {
    expect(() => bankStatementFiltersSchema.parse({ type: "receita" })).toThrow();
  });
});

// ── dateRangeSchema ─────────────────────────────────────────────────────────

describe("dateRangeSchema", () => {
  it("accepts valid range", () => {
    const result = dateRangeSchema.parse({
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
    });
    expect(result.dateFrom).toBe("2026-01-01");
  });

  it("rejects dateFrom > dateTo", () => {
    expect(() =>
      dateRangeSchema.parse({
        dateFrom: "2026-12-31",
        dateTo: "2026-01-01",
      })
    ).toThrow();
  });

  it("accepts same date (dateFrom === dateTo)", () => {
    expect(
      dateRangeSchema.parse({ dateFrom: "2026-06-15", dateTo: "2026-06-15" })
    ).toBeDefined();
  });

  it("rejects missing dateFrom", () => {
    expect(() => dateRangeSchema.parse({ dateTo: "2026-12-31" })).toThrow();
  });
});

// ── createCashEntrySchema ───────────────────────────────────────────────────

describe("createCashEntrySchema", () => {
  it("accepts valid entry", () => {
    const result = createCashEntrySchema.parse({
      amount: 1500.5,
      note: "Entrada manual",
      recorded_at: "2026-03-11",
    });
    expect(result.amount).toBe(1500.5);
  });

  it("rejects zero amount", () => {
    expect(() => createCashEntrySchema.parse({ amount: 0 })).toThrow();
  });

  it("accepts negative amount", () => {
    const result = createCashEntrySchema.parse({ amount: -100 });
    expect(result.amount).toBe(-100);
  });

  it("rejects note > 500 chars", () => {
    expect(() =>
      createCashEntrySchema.parse({ amount: 100, note: "x".repeat(501) })
    ).toThrow();
  });

  it("note and recorded_at are optional", () => {
    const result = createCashEntrySchema.parse({ amount: 50 });
    expect(result.note).toBeUndefined();
    expect(result.recorded_at).toBeUndefined();
  });
});

// ── upsertOperationalIndicatorSchema ────────────────────────────────────────

describe("upsertOperationalIndicatorSchema", () => {
  it("accepts valid input", () => {
    const result = upsertOperationalIndicatorSchema.parse({
      month: "2026-03",
      headcount: 15,
      folha_pagamento: 120000,
      meta_margem: 35.5,
    });
    expect(result.month).toBe("2026-03");
    expect(result.meta_margem).toBe(35.5);
  });

  it("rejects invalid month format", () => {
    expect(() =>
      upsertOperationalIndicatorSchema.parse({ month: "2026-3" })
    ).toThrow();
    expect(() =>
      upsertOperationalIndicatorSchema.parse({ month: "03-2026" })
    ).toThrow();
  });

  it("rejects meta_margem > 100", () => {
    expect(() =>
      upsertOperationalIndicatorSchema.parse({ month: "2026-03", meta_margem: 101 })
    ).toThrow();
  });

  it("rejects negative headcount", () => {
    expect(() =>
      upsertOperationalIndicatorSchema.parse({ month: "2026-03", headcount: -1 })
    ).toThrow();
  });

  it("accepts null values", () => {
    const result = upsertOperationalIndicatorSchema.parse({
      month: "2026-03",
      headcount: null,
      folha_pagamento: null,
    });
    expect(result.headcount).toBeNull();
  });
});

// ── daysParamSchema ─────────────────────────────────────────────────────────

describe("daysParamSchema", () => {
  it("defaults to 30", () => {
    expect(daysParamSchema.parse(undefined)).toBe(30);
  });

  it("coerces string to number", () => {
    expect(daysParamSchema.parse("90")).toBe(90);
  });

  it("rejects > 365", () => {
    expect(() => daysParamSchema.parse(366)).toThrow();
  });

  it("rejects < 1", () => {
    expect(() => daysParamSchema.parse(0)).toThrow();
  });
});
