import { describe, it, expect, vi, afterEach } from "vitest";
import { parseOmieDate, formatOmieDateParam, hasTimeRemaining } from "../_shared";

// ── parseOmieDate ───────────────────────────────────────────────────────────

describe("parseOmieDate", () => {
  it("returns null for null/undefined/empty", () => {
    expect(parseOmieDate(null)).toBeNull();
    expect(parseOmieDate(undefined)).toBeNull();
    expect(parseOmieDate("")).toBeNull();
    expect(parseOmieDate("   ")).toBeNull();
  });

  it("parses ISO format (YYYY-MM-DD)", () => {
    expect(parseOmieDate("2026-03-11")).toBe("2026-03-11");
  });

  it("parses ISO with time (takes only date part)", () => {
    expect(parseOmieDate("2026-03-11T10:30:00Z")).toBe("2026-03-11");
  });

  it("parses BR format (DD/MM/YYYY)", () => {
    expect(parseOmieDate("11/03/2026")).toBe("2026-03-11");
  });

  it("parses single-digit day/month BR format", () => {
    expect(parseOmieDate("01/01/2026")).toBe("2026-01-01");
  });

  it("returns null for unparseable strings", () => {
    expect(parseOmieDate("not-a-date")).toBeNull();
  });

  it("falls through to Date constructor for partial dates", () => {
    // "2026" is valid for new Date("2026") → Jan 1 2026
    expect(parseOmieDate("2026")).toBe("2026-01-01");
  });
});

// ── formatOmieDateParam ─────────────────────────────────────────────────────

describe("formatOmieDateParam", () => {
  it("formats to DD/MM/YYYY", () => {
    expect(formatOmieDateParam(new Date(2026, 2, 11))).toBe("11/03/2026");
  });

  it("pads single-digit day and month", () => {
    expect(formatOmieDateParam(new Date(2026, 0, 5))).toBe("05/01/2026");
  });

  it("handles Dec 31", () => {
    expect(formatOmieDateParam(new Date(2026, 11, 31))).toBe("31/12/2026");
  });
});

// ── hasTimeRemaining ────────────────────────────────────────────────────────

describe("hasTimeRemaining", () => {
  afterEach(() => vi.useRealTimers());

  it("returns true when well within time limit", () => {
    vi.useFakeTimers();
    const startTime = Date.now();
    // Advance 10 seconds
    vi.advanceTimersByTime(10_000);
    // maxDuration = 300s → limit = (300-30)*1000 = 270_000ms
    expect(hasTimeRemaining(startTime, 300)).toBe(true);
  });

  it("returns false when approaching time limit", () => {
    vi.useFakeTimers();
    const startTime = Date.now();
    // Advance 275 seconds (past the 270s threshold for maxDuration=300)
    vi.advanceTimersByTime(275_000);
    expect(hasTimeRemaining(startTime, 300)).toBe(false);
  });

  it("returns false when exactly at threshold", () => {
    vi.useFakeTimers();
    const startTime = Date.now();
    vi.advanceTimersByTime(270_000);
    expect(hasTimeRemaining(startTime, 300)).toBe(false);
  });

  it("30s safety margin: 60s max → false after 30s", () => {
    vi.useFakeTimers();
    const startTime = Date.now();
    vi.advanceTimersByTime(31_000);
    expect(hasTimeRemaining(startTime, 60)).toBe(false);
  });
});
