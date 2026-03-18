// ── Reconciliation Engine ─────────────────────────────────────────────────────
// Motor de conciliação automática: exact match, fuzzy match, rule-based match
// Score 0-100 → auto (≥86), suggest (50-85), unmatched (<50)
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { BankTransaction, ReconciliationRule } from "@/lib/supabase/types/bank-reconciliation";
import type { FinanceTransaction } from "./finance-types";

// ── Exported types ────────────────────────────────────────────────────────────

export type MatchType = "exact" | "fuzzy" | "rule";
export type MatchTier = "auto" | "suggest";

export interface ScoringBreakdown {
  amountScore: number;   // 0-40
  dateScore: number;     // 0-35
  descScore: number;     // 0-15
  ruleBoost: number;     // 0-10
  total: number;         // 0-100
}

export interface ReconciliationCandidate {
  bankTxId: string;
  bankTx: BankTransaction;
  financeTxId: string;
  financeTx: FinanceTransaction;
  score: number;
  tier: MatchTier;
  matchType: MatchType;
  ruleId: string | null;
  breakdown: ScoringBreakdown;
}

export interface ReconciliationResult {
  auto: ReconciliationCandidate[];
  suggest: ReconciliationCandidate[];
  unmatched: BankTransaction[];
  stats: {
    totalBankTxs: number;
    autoCount: number;
    suggestCount: number;
    unmatchedCount: number;
  };
}

// ── Config schema (Zod) ───────────────────────────────────────────────────────

export const EngineConfigSchema = z.object({
  /** % tolerance for amount fuzzy match (default 5%) */
  amountTolerancePct: z.number().min(0).max(20).default(5),
  /** Max days window for date fuzzy match (default 7) */
  dateWindowDays: z.number().min(0).max(30).default(7),
  /** Score threshold for auto-reconcile */
  autoThreshold: z.number().min(50).max(100).default(86),
  /** Score threshold for suggest */
  suggestThreshold: z.number().min(0).max(100).default(50),
});

export type EngineConfig = z.infer<typeof EngineConfigSchema>;

// ── Default config ────────────────────────────────────────────────────────────

export const AUTO_THRESHOLD = 86;
export const SUGGEST_THRESHOLD = 50;

// ── Score: amount (0-40 pts) ──────────────────────────────────────────────────

function scoreAmount(bankAmt: number, financeAmt: number): number {
  if (financeAmt === 0) return 0;
  const diffPct = Math.abs(bankAmt - financeAmt) / Math.abs(financeAmt);
  if (diffPct === 0) return 40;
  if (diffPct <= 0.005) return 35;
  if (diffPct <= 0.01) return 30;
  if (diffPct <= 0.02) return 20;
  if (diffPct <= 0.05) return 10;
  return 0;
}

// ── Score: date (0-35 pts) ────────────────────────────────────────────────────

function daysDiff(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(
    Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay)
  );
}

function scoreDate(bankDate: string, financeDate: string): number {
  const diff = daysDiff(bankDate, financeDate);
  if (diff === 0) return 35;
  if (diff === 1) return 28;
  if (diff === 2) return 21;
  if (diff === 3) return 14;
  if (diff <= 5) return 7;
  return 0;
}

// ── Score: description similarity (0-15 pts) ─────────────────────────────────
// Token-Jaccard: intersection / union of word sets

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1)
  );
}

function tokenSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function scoreDescription(bankDesc: string, financeDesc: string): number {
  return Math.round(tokenSimilarity(bankDesc, financeDesc) * 15);
}

// ── Rule-based match (0-10 pts boost) ────────────────────────────────────────

function matchRule(
  bankDescription: string,
  rules: ReconciliationRule[]
): { boost: number; ruleId: string } | null {
  for (const rule of rules) {
    try {
      if (new RegExp(rule.pattern, "i").test(bankDescription)) {
        return { boost: 10, ruleId: rule.id };
      }
    } catch {
      // Invalid regex — skip silently
    }
  }
  return null;
}

// ── Type alignment ────────────────────────────────────────────────────────────

function financeTxTypeFor(
  bankType: "credit" | "debit"
): "receita" | "despesa" {
  return bankType === "credit" ? "receita" : "despesa";
}

// ── Core pair scorer ──────────────────────────────────────────────────────────

function scorePair(
  bankTx: BankTransaction,
  financeTx: FinanceTransaction,
  rules: ReconciliationRule[],
  cfg: EngineConfig
): ScoringBreakdown | null {
  // Skip type mismatch
  if (financeTxTypeFor(bankTx.type) !== financeTx.type) return null;

  // Effective finance amount
  const financeAmt =
    financeTx.paid_amount > 0 ? financeTx.paid_amount : financeTx.amount;

  // Early exit: amount too far off
  const diffPct =
    financeAmt === 0
      ? Infinity
      : Math.abs(bankTx.amount - financeAmt) / Math.abs(financeAmt);
  if (diffPct > cfg.amountTolerancePct / 100) return null;

  // Effective finance date
  const financeDate = financeTx.paid_date ?? financeTx.date;

  // Early exit: date out of window
  if (daysDiff(bankTx.transaction_date, financeDate) > cfg.dateWindowDays) {
    return null;
  }

  const amountScore = scoreAmount(bankTx.amount, financeAmt);
  const dateScore = scoreDate(bankTx.transaction_date, financeDate);
  const descScore = scoreDescription(bankTx.description, financeTx.description);
  const ruleMatch = matchRule(bankTx.description, rules);
  const ruleBoost = ruleMatch?.boost ?? 0;
  const total = Math.min(100, amountScore + dateScore + descScore + ruleBoost);

  return { amountScore, dateScore, descScore, ruleBoost, total };
}

// ── Determine match type from breakdown ──────────────────────────────────────

function classifyMatchType(
  breakdown: ScoringBreakdown,
  bankTx: BankTransaction,
  rules: ReconciliationRule[]
): { matchType: MatchType; ruleId: string | null } {
  if (breakdown.amountScore === 40 && breakdown.dateScore === 35) {
    return { matchType: "exact", ruleId: null };
  }
  if (breakdown.ruleBoost > 0) {
    const rule = matchRule(bankTx.description, rules);
    return { matchType: "rule", ruleId: rule?.ruleId ?? null };
  }
  return { matchType: "fuzzy", ruleId: null };
}

// ── Main engine export ────────────────────────────────────────────────────────

export function runReconciliationEngine(
  bankTransactions: BankTransaction[],
  financeTransactions: FinanceTransaction[],
  rules: ReconciliationRule[],
  configOverrides: Partial<EngineConfig> = {}
): ReconciliationResult {
  const cfg = EngineConfigSchema.parse(configOverrides);

  const unreconciled = bankTransactions.filter((t) => !t.reconciled);
  const available = financeTransactions.filter(
    (t) => t.status !== "cancelado"
  );

  const auto: ReconciliationCandidate[] = [];
  const suggest: ReconciliationCandidate[] = [];
  const unmatched: BankTransaction[] = [];

  for (const bankTx of unreconciled) {
    let best: ReconciliationCandidate | null = null;

    for (const financeTx of available) {
      const breakdown = scorePair(bankTx, financeTx, rules, cfg);
      if (!breakdown || breakdown.total < cfg.suggestThreshold) continue;

      const tier: MatchTier =
        breakdown.total >= cfg.autoThreshold ? "auto" : "suggest";
      const { matchType, ruleId } = classifyMatchType(breakdown, bankTx, rules);

      const candidate: ReconciliationCandidate = {
        bankTxId: bankTx.id,
        bankTx,
        financeTxId: financeTx.id,
        financeTx,
        score: breakdown.total,
        tier,
        matchType,
        ruleId,
        breakdown,
      };

      if (!best || breakdown.total > best.score) {
        best = candidate;
      }
    }

    if (best) {
      if (best.tier === "auto") auto.push(best);
      else suggest.push(best);
    } else {
      unmatched.push(bankTx);
    }
  }

  return {
    auto,
    suggest,
    unmatched,
    stats: {
      totalBankTxs: unreconciled.length,
      autoCount: auto.length,
      suggestCount: suggest.length,
      unmatchedCount: unmatched.length,
    },
  };
}
