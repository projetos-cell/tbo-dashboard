import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatRelativeTime,
  resolveSyncState,
  getTotalRecords,
  buildTooltipLines,
  STATE_CONFIG,
  type SyncState,
} from "../components/omie-sync-helpers";
import type { OmieSyncLog } from "../services/omie-sync";

// ── formatRelativeTime ──────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns seconds when < 60s ago", () => {
    const thirtySecsAgo = new Date("2026-03-11T11:59:30Z").toISOString();
    expect(formatRelativeTime(thirtySecsAgo)).toBe("há 30s");
  });

  it("returns minutes when < 60min ago", () => {
    const fiveMinAgo = new Date("2026-03-11T11:55:00Z").toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("há 5min");
  });

  it("returns hours when < 24h ago", () => {
    const threeHoursAgo = new Date("2026-03-11T09:00:00Z").toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("há 3h");
  });

  it("returns days when >= 24h ago", () => {
    const twoDaysAgo = new Date("2026-03-09T12:00:00Z").toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe("há 2d");
  });

  it("returns 0s for current time", () => {
    const now = new Date("2026-03-11T12:00:00Z").toISOString();
    expect(formatRelativeTime(now)).toBe("há 0s");
  });
});

// ── resolveSyncState ────────────────────────────────────────────────────────

describe("resolveSyncState", () => {
  const makeLog = (overrides: Partial<OmieSyncLog> = {}): OmieSyncLog => ({
    id: "test-id",
    tenant_id: "t1",
    status: "success",
    started_at: "2026-03-11T10:00:00Z",
    finished_at: "2026-03-11T10:01:00Z",
    trigger_source: "manual",
    triggered_by: "user-1",
    vendors_synced: 0,
    clients_synced: 0,
    payables_synced: 0,
    receivables_synced: 0,
    categories_synced: 0,
    bank_accounts_synced: 0,
    extrato_synced: 0,
    current_phase: null,
    duration_ms: 60000,
    errors: [],
    ...overrides,
  });

  it("returns 'syncing' when isPending", () => {
    expect(resolveSyncState(null, false, true)).toBe("syncing");
  });

  it("returns 'never' when no latest log", () => {
    expect(resolveSyncState(null, false, false)).toBe("never");
  });

  it("returns 'stale' when isStale", () => {
    expect(resolveSyncState(makeLog(), true, false)).toBe("stale");
  });

  it("returns 'syncing' when status is running", () => {
    expect(resolveSyncState(makeLog({ status: "running" }), false, false)).toBe("syncing");
  });

  it("returns 'success' on success", () => {
    expect(resolveSyncState(makeLog({ status: "success" }), false, false)).toBe("success");
  });

  it("returns 'partial' on partial", () => {
    expect(resolveSyncState(makeLog({ status: "partial" }), false, false)).toBe("partial");
  });

  it("returns 'error' on error", () => {
    expect(resolveSyncState(makeLog({ status: "error" }), false, false)).toBe("error");
  });

  it("isPending takes priority over everything", () => {
    expect(resolveSyncState(makeLog({ status: "error" }), true, true)).toBe("syncing");
  });
});

// ── getTotalRecords ─────────────────────────────────────────────────────────

describe("getTotalRecords", () => {
  it("sums all synced fields", () => {
    const log = {
      vendors_synced: 10,
      clients_synced: 20,
      payables_synced: 30,
      receivables_synced: 40,
      categories_synced: 5,
      bank_accounts_synced: 3,
    } as OmieSyncLog;

    expect(getTotalRecords(log)).toBe(108);
  });

  it("handles null/undefined fields gracefully", () => {
    const log = {
      vendors_synced: null,
      clients_synced: undefined,
      payables_synced: 10,
    } as unknown as OmieSyncLog;

    expect(getTotalRecords(log)).toBe(10);
  });
});

// ── STATE_CONFIG ─────────────────────────────────────────────────────────────

describe("STATE_CONFIG", () => {
  it("has all 6 states", () => {
    const states: SyncState[] = ["success", "syncing", "partial", "error", "stale", "never"];
    for (const s of states) {
      expect(STATE_CONFIG[s]).toBeDefined();
      expect(STATE_CONFIG[s].label).toBeTruthy();
      expect(STATE_CONFIG[s].container).toBeTruthy();
      expect(STATE_CONFIG[s].dot).toBeTruthy();
    }
  });

  it("syncing has animate-pulse", () => {
    expect(STATE_CONFIG.syncing.dot).toContain("animate-pulse");
  });

  it("syncing has empty actionLabel", () => {
    expect(STATE_CONFIG.syncing.actionLabel).toBe("");
  });
});

// ── buildTooltipLines ────────────────────────────────────────────────────────

describe("buildTooltipLines", () => {
  const makeLog = (overrides: Partial<OmieSyncLog> = {}): OmieSyncLog => ({
    id: "test-id",
    tenant_id: "t1",
    status: "success",
    started_at: "2026-03-11T10:00:00Z",
    finished_at: "2026-03-11T10:01:00Z",
    trigger_source: "manual",
    triggered_by: "user-1",
    vendors_synced: 5,
    clients_synced: 10,
    payables_synced: 20,
    receivables_synced: 15,
    categories_synced: 3,
    bank_accounts_synced: 2,
    extrato_synced: 0,
    current_phase: null,
    duration_ms: 60000,
    errors: [],
    ...overrides,
  });

  it("returns empty array when no log", () => {
    expect(buildTooltipLines(null, "never")).toEqual([]);
  });

  it("includes last sync time", () => {
    const lines = buildTooltipLines(makeLog(), "success");
    expect(lines[0]).toContain("Último sync:");
  });

  it("translates trigger_source to Portuguese", () => {
    const lines = buildTooltipLines(makeLog({ trigger_source: "manual" }), "success");
    expect(lines.find((l) => l.includes("Manual"))).toBeTruthy();
  });

  it("includes duration", () => {
    const lines = buildTooltipLines(makeLog({ duration_ms: 45000 }), "success");
    expect(lines.find((l) => l.includes("45.0s"))).toBeTruthy();
  });

  it("includes record counts for success state", () => {
    const lines = buildTooltipLines(makeLog(), "success");
    expect(lines.find((l) => l.includes("Registros:"))).toBeTruthy();
  });

  it("includes record counts for partial state", () => {
    const lines = buildTooltipLines(makeLog(), "partial");
    expect(lines.find((l) => l.includes("Registros:"))).toBeTruthy();
  });

  it("does NOT include record counts for error state", () => {
    const lines = buildTooltipLines(makeLog(), "error");
    expect(lines.find((l) => l.includes("Registros:"))).toBeUndefined();
  });

  it("includes error count when errors exist", () => {
    const lines = buildTooltipLines(
      makeLog({ errors: [{ entity: "vendors", message: "fail" }] }),
      "error"
    );
    expect(lines.find((l) => l.includes("1 erro(s)"))).toBeTruthy();
  });
});
