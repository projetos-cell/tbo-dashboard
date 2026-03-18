"use client";

// ── ConciliacaoSplitView ───────────────────────────────────────────────────────
// Split-view principal: auto / sugestão / sem-match, com ações inline.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReconciliationResult, ReconciliationCandidate } from "@/features/financeiro/services/reconciliation-engine";
import type { BankTransaction } from "@/lib/supabase/types/bank-reconciliation";
import { useApplyReconciliation, useAutoReconcile } from "@/features/financeiro/hooks/use-reconciliation";
import { ConciliacaoMatchRow, ConciliacaoUnmatchedRow } from "./conciliacao-match-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  IconRobot,
  IconSparkles,
  IconAlertCircle,
  IconInbox,
  IconBuildingBank,
} from "@tabler/icons-react";

// ── Section header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  action?: React.ReactNode;
  colorClass?: string;
}

function SectionHeader({ icon, title, count, action, colorClass }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={colorClass}>{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
      {action}
    </div>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────

function ColumnHeaders() {
  return (
    <div className="flex items-center gap-2 py-1 mb-1">
      <div className="flex-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <IconBuildingBank className="size-3.5" />
        Transação Bancária
      </div>
      <div className="w-16 shrink-0" />
      <div className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Lançamento Interno
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

export function ConciliacaoSplitViewSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <Skeleton className="h-5 w-48 mb-3" />
          <div className="space-y-2">
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex gap-2">
                <Skeleton className="flex-1 h-16 rounded-lg" />
                <Skeleton className="w-16 h-16 rounded-lg" />
                <Skeleton className="flex-1 h-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <IconInbox className="size-12" />
      <div className="text-center">
        <p className="font-medium">Nenhuma transação pendente</p>
        <p className="text-sm mt-0.5">
          Importe um extrato OFX/CNAB para iniciar a conciliação.
        </p>
      </div>
    </div>
  );
}

// ── Main split-view ───────────────────────────────────────────────────────────

interface ConciliacaoSplitViewProps {
  result: ReconciliationResult | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ConciliacaoSplitView({
  result,
  isLoading,
  isError,
  onRetry,
}: ConciliacaoSplitViewProps) {
  const { toast } = useToast();
  const applyMutation = useApplyReconciliation();
  const autoMutation = useAutoReconcile();

  // Rejected candidate IDs (local UI state — excluded from view until next refetch)
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  if (isLoading) return <ConciliacaoSplitViewSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
        <IconAlertCircle className="size-5 text-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro ao carregar conciliação</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70">Verifique a conexão com o banco de dados.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button>
      </div>
    );
  }

  if (!result) return null;

  const autoList = result.auto.filter((c) => !rejected.has(c.bankTxId));
  const suggestList = result.suggest.filter((c) => !rejected.has(c.bankTxId));
  const unmatchedList = result.unmatched.filter((tx) => !rejected.has(tx.id));
  const total = autoList.length + suggestList.length + unmatchedList.length;

  if (total === 0) return <EmptyState />;

  function handleApprove(candidate: ReconciliationCandidate) {
    applyMutation.mutate(
      { bankTxId: candidate.bankTxId, financeTxId: candidate.financeTxId, score: candidate.score },
      {
        onSuccess: () => toast({ title: "Conciliado!", description: "Transação conciliada com sucesso." }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleReject(bankTxId: string) {
    setRejected((prev) => new Set([...prev, bankTxId]));
    toast({ title: "Match rejeitado", description: "Transação movida para sem-match." });
  }

  function handleBatchAuto() {
    autoMutation.mutate(autoList, {
      onSuccess: ({ applied, errors }) => {
        toast({
          title: `${applied} transações conciliadas automaticamente`,
          description: errors > 0 ? `${errors} erros encontrados.` : undefined,
          variant: errors > 0 ? "destructive" : "default",
        });
      },
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-8">
      <ColumnHeaders />

      {/* ── Auto-reconcile section ── */}
      {autoList.length > 0 && (
        <section>
          <SectionHeader
            icon={<IconRobot className="size-4" />}
            title="Conciliação Automática"
            count={autoList.length}
            colorClass="text-emerald-600"
            action={
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={handleBatchAuto}
                disabled={autoMutation.isPending}
              >
                <IconRobot className="size-3.5" />
                {autoMutation.isPending ? "Aplicando..." : `Aplicar ${autoList.length}`}
              </Button>
            }
          />
          <div className="divide-y divide-border/50">
            {autoList.map((c) => (
              <ConciliacaoMatchRow
                key={c.bankTxId}
                candidate={c}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={applyMutation.isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Suggested matches section ── */}
      {suggestList.length > 0 && (
        <section>
          <SectionHeader
            icon={<IconSparkles className="size-4" />}
            title="Sugestões de Conciliação"
            count={suggestList.length}
            colorClass="text-amber-500"
          />
          <div className="divide-y divide-border/50">
            {suggestList.map((c) => (
              <ConciliacaoMatchRow
                key={c.bankTxId}
                candidate={c}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={applyMutation.isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Unmatched section ── */}
      {unmatchedList.length > 0 && (
        <section>
          <SectionHeader
            icon={<IconAlertCircle className="size-4" />}
            title="Sem Correspondência"
            count={unmatchedList.length}
            colorClass="text-muted-foreground"
          />
          <div className="divide-y divide-border/50">
            {unmatchedList.map((tx: BankTransaction) => (
              <ConciliacaoUnmatchedRow key={tx.id} tx={tx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
