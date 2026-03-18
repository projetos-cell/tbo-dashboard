"use client";

// ── ConciliacaoMatchRow ────────────────────────────────────────────────────────
// Linha do split-view: transação bancária (esq) + lançamento interno (dir) + ações.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReconciliationCandidate } from "@/features/financeiro/services/reconciliation-engine";
import type { BankTransaction } from "@/lib/supabase/types/bank-reconciliation";
import type { FinanceTransaction } from "@/features/financeiro/services/finance-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/features/financeiro/lib/formatters";
import {
  IconCheck,
  IconX,
  IconSparkles,
  IconRobot,
  IconLink,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number; tier: "auto" | "suggest" }) {
  const colorClass =
    tier === "auto"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${colorClass}`}>
      {tier === "auto" ? <IconRobot className="size-3" /> : <IconSparkles className="size-3" />}
      {score}pts
    </span>
  );
}

// ── Bank transaction cell ──────────────────────────────────────────────────────

function BankTxCell({ tx, highlight }: { tx: BankTransaction; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex-1 rounded-lg border p-3 text-sm transition-colors",
      highlight
        ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30"
        : "border-border bg-card"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-xs leading-snug line-clamp-2">{tx.description}</p>
        <span className={cn(
          "text-sm font-bold shrink-0",
          tx.type === "credit" ? "text-emerald-600" : "text-red-600"
        )}>
          {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(tx.transaction_date + "T12:00:00").toLocaleDateString("pt-BR")}
        {tx.category && ` · ${tx.category}`}
      </p>
    </div>
  );
}

// ── Finance transaction cell ──────────────────────────────────────────────────

function FinanceTxCell({ tx, highlight }: { tx: FinanceTransaction; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex-1 rounded-lg border p-3 text-sm transition-colors",
      highlight
        ? "border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30"
        : "border-border bg-card"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-xs leading-snug line-clamp-2">{tx.description}</p>
        <span className={cn(
          "text-sm font-bold shrink-0",
          tx.type === "receita" ? "text-emerald-600" : "text-red-600"
        )}>
          {fmt(tx.amount)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR")}
        {tx.counterpart && ` · ${tx.counterpart}`}
      </p>
      <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1">{tx.status}</Badge>
    </div>
  );
}

// ── Match row (suggested / auto) ──────────────────────────────────────────────

interface MatchRowProps {
  candidate: ReconciliationCandidate;
  onApprove: (c: ReconciliationCandidate) => void;
  onReject: (bankTxId: string) => void;
  isApproving: boolean;
}

export function ConciliacaoMatchRow({ candidate, onApprove, onReject, isApproving }: MatchRowProps) {
  const isAuto = candidate.tier === "auto";
  return (
    <div className="flex items-center gap-2 py-1.5">
      <BankTxCell tx={candidate.bankTx} highlight />
      {/* center link */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-16">
        <ScoreBadge score={candidate.score} tier={candidate.tier} />
        <IconLink className="size-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-6 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Aprovar conciliação"
            disabled={isApproving}
            onClick={() => onApprove(candidate)}
          >
            <IconCheck className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Rejeitar match"
            disabled={isApproving}
            onClick={() => onReject(candidate.bankTxId)}
          >
            <IconX className="size-3.5" />
          </Button>
        </div>
      </div>
      <FinanceTxCell tx={candidate.financeTx} highlight />
      {isAuto && (
        <Badge variant="outline" className="text-[10px] shrink-0 border-emerald-300 text-emerald-700">
          Auto
        </Badge>
      )}
    </div>
  );
}

// ── Unmatched bank tx row ─────────────────────────────────────────────────────

interface UnmatchedRowProps {
  tx: BankTransaction;
  onManualLink?: (tx: BankTransaction) => void;
}

export function ConciliacaoUnmatchedRow({ tx, onManualLink }: UnmatchedRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <BankTxCell tx={tx} />
      <div className="flex flex-col items-center gap-1 shrink-0 w-16">
        <span className="text-[10px] text-muted-foreground">sem match</span>
        {onManualLink && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs px-2 gap-1"
            onClick={() => onManualLink(tx)}
          >
            <IconLink className="size-3" />
            Vincular
          </Button>
        )}
      </div>
      <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/30 p-3 flex items-center justify-center text-xs text-muted-foreground">
        Nenhum lançamento encontrado
      </div>
    </div>
  );
}
