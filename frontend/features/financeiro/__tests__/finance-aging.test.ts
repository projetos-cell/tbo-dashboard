import { describe, it, expect } from "vitest";
import {
  classifyIntoBuckets,
  OVERDUE_BUCKETS,
  PROJECTED_BUCKETS,
} from "../services/finance-aging";

const TODAY = new Date("2026-03-11T00:00:00");

function makeRow(overrides: {
  type: "receita" | "despesa";
  amount: number;
  due_date: string;
}) {
  return { status: "previsto" as const, ...overrides };
}

// ── classifyIntoBuckets ─────────────────────────────────────────────────────

describe("classifyIntoBuckets", () => {
  it("returns zero totals for empty rows", () => {
    const result = classifyIntoBuckets([], TODAY);
    expect(result.totalAr).toBe(0);
    expect(result.totalAp).toBe(0);
    expect(result.projectedAr).toBe(0);
    expect(result.buckets.length).toBe(
      OVERDUE_BUCKETS.length + PROJECTED_BUCKETS.length
    );
  });

  it("classifies 15-day overdue receita into 1-30 AR bucket", () => {
    const rows = [
      makeRow({ type: "receita", amount: 1000, due_date: "2026-02-24" }), // 15 days ago
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    const bucket1_30 = result.buckets.find(
      (b) => b.direction === "past" && b.minDays === 1 && b.maxDays === 30
    );
    expect(bucket1_30?.ar).toBe(1000);
    expect(bucket1_30?.arCount).toBe(1);
    expect(result.totalAr).toBe(1000);
    expect(result.totalArCount).toBe(1);
  });

  it("classifies 45-day overdue despesa into 31-60 AP bucket", () => {
    const rows = [
      makeRow({ type: "despesa", amount: 2000, due_date: "2026-01-25" }), // ~45 days ago
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    const bucket31_60 = result.buckets.find(
      (b) => b.direction === "past" && b.minDays === 31 && b.maxDays === 60
    );
    expect(bucket31_60?.ap).toBe(2000);
    expect(bucket31_60?.apCount).toBe(1);
    expect(result.totalAp).toBe(2000);
  });

  it("classifies 100-day overdue into 90+ bucket", () => {
    const rows = [
      makeRow({ type: "despesa", amount: 500, due_date: "2025-12-02" }), // ~99 days
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    const bucket90plus = result.buckets.find(
      (b) => b.direction === "past" && b.minDays === 91
    );
    expect(bucket90plus?.ap).toBe(500);
  });

  it("classifies future receita into projected buckets", () => {
    const rows = [
      makeRow({ type: "receita", amount: 3000, due_date: "2026-03-25" }), // 14 days ahead → daysAhead=15
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    const projBucket1_30 = result.buckets.find(
      (b) => b.direction === "future" && b.minDays === 1 && b.maxDays === 30
    );
    expect(projBucket1_30?.ar).toBe(3000);
    expect(result.projectedAr).toBe(3000);
    expect(result.projectedArCount).toBe(1);
  });

  it("does NOT project future despesa (only receita)", () => {
    const rows = [
      makeRow({ type: "despesa", amount: 500, due_date: "2026-04-01" }),
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    expect(result.totalAp).toBe(0);
    expect(result.projectedAr).toBe(0);
    // Despesa with future due_date should not appear in any bucket
    const allAmounts = result.buckets.reduce((sum, b) => sum + b.ar + b.ap, 0);
    expect(allAmounts).toBe(0);
  });

  it("uses absolute value of amount", () => {
    const rows = [
      makeRow({ type: "receita", amount: -1500, due_date: "2026-03-01" }), // 10 days ago
    ];
    const result = classifyIntoBuckets(rows, TODAY);
    expect(result.totalAr).toBe(1500);
  });

  it("skips rows without due_date", () => {
    const rows = [
      { type: "receita" as const, status: "previsto" as const, amount: 100, due_date: null },
    ];
    const result = classifyIntoBuckets(rows, TODAY);
    expect(result.totalAr).toBe(0);
  });

  it("accumulates multiple rows in same bucket", () => {
    const rows = [
      makeRow({ type: "receita", amount: 1000, due_date: "2026-03-01" }), // 10 days
      makeRow({ type: "receita", amount: 2000, due_date: "2026-02-20" }), // 19 days
      makeRow({ type: "despesa", amount: 500, due_date: "2026-03-05" }),  // 6 days
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    const bucket1_30_past = result.buckets.find(
      (b) => b.direction === "past" && b.minDays === 1 && b.maxDays === 30
    );
    expect(bucket1_30_past?.ar).toBe(3000);
    expect(bucket1_30_past?.arCount).toBe(2);
    expect(bucket1_30_past?.ap).toBe(500);
    expect(bucket1_30_past?.apCount).toBe(1);
  });

  it("today's due_date (diffDays=0) goes to projected for receita", () => {
    const rows = [
      makeRow({ type: "receita", amount: 800, due_date: "2026-03-11" }), // today → diffDays=0 → daysAhead=1
    ];
    const result = classifyIntoBuckets(rows, TODAY);

    expect(result.totalAr).toBe(0); // not overdue
    expect(result.projectedAr).toBe(800);
    const projBucket1_30 = result.buckets.find(
      (b) => b.direction === "future" && b.minDays === 1 && b.maxDays === 30
    );
    expect(projBucket1_30?.ar).toBe(800);
  });
});

// ── Bucket definitions ──────────────────────────────────────────────────────

describe("bucket definitions", () => {
  it("overdue buckets cover 1 to Infinity", () => {
    expect(OVERDUE_BUCKETS[0].minDays).toBe(1);
    expect(OVERDUE_BUCKETS[OVERDUE_BUCKETS.length - 1].maxDays).toBe(Infinity);
  });

  it("projected buckets cover 1 to 365", () => {
    expect(PROJECTED_BUCKETS[0].minDays).toBe(1);
    expect(PROJECTED_BUCKETS[PROJECTED_BUCKETS.length - 1].maxDays).toBe(365);
  });

  it("no gaps between overdue bucket ranges", () => {
    for (let i = 1; i < OVERDUE_BUCKETS.length; i++) {
      expect(OVERDUE_BUCKETS[i].minDays).toBe(OVERDUE_BUCKETS[i - 1].maxDays + 1);
    }
  });

  it("no gaps between projected bucket ranges", () => {
    for (let i = 1; i < PROJECTED_BUCKETS.length; i++) {
      expect(PROJECTED_BUCKETS[i].minDays).toBe(PROJECTED_BUCKETS[i - 1].maxDays + 1);
    }
  });
});
