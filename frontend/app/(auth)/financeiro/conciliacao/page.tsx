"use client";

// ── Conciliação Bancária — página principal ───────────────────────────────────
// RBACGuard: diretoria+. Split-view auto/sugestão/sem-match com ações inline.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import {
  useReconciliationCandidates,
} from "@/features/financeiro/hooks/use-reconciliation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { listBankAccounts, getReconciliationSummary } from "@/features/financeiro/services/bank-reconciliation";
import { getFinanceCategories, getFinanceCostCenters, getFinanceTransactions } from "@/features/financeiro/services/finance-transactions";
import { ConciliacaoSummaryCards } from "@/features/financeiro/components/conciliacao-summary-cards";
import { ConciliacaoFilters, DEFAULT_FILTERS } from "@/features/financeiro/components/conciliacao-filters";
import { ConciliacaoSplitView } from "@/features/financeiro/components/conciliacao-split-view";
import type { ConciliacaoFiltersState } from "@/features/financeiro/components/conciliacao-filters";
import { ConciliacaoUpload } from "@/features/financeiro/components/conciliacao-upload";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

function ConciliacaoContent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [filters, setFilters] = useState<ConciliacaoFiltersState>(DEFAULT_FILTERS);

  // ── Fetch bank accounts (for filter select) ──────────────────────────────
  const supabase = createClient();
  const { data: bankAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["bank-accounts", tenantId],
    queryFn: () => listBankAccounts(supabase, tenantId!),
    enabled: !!tenantId,
  });

  // ── Fetch reconciliation summary ─────────────────────────────────────────
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["reconciliation-summary", tenantId, filters.bankAccountId],
    queryFn: () =>
      getReconciliationSummary(
        supabase,
        tenantId!,
        filters.bankAccountId || undefined
      ),
    enabled: !!tenantId,
  });

  // ── Fetch categories & cost centers (for AI panel) ──────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["finance-categories"],
    queryFn: () => getFinanceCategories(supabase as never),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: costCenters = [] } = useQuery({
    queryKey: ["finance-cost-centers"],
    queryFn: () => getFinanceCostCenters(supabase as never),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });

  // ── Fetch finance transactions (for AI panel matching) ────────────────────
  const { data: financeResult } = useQuery({
    queryKey: ["finance-transactions-for-ai", tenantId, filters.dateFrom, filters.dateTo],
    queryFn: () =>
      getFinanceTransactions(supabase as never, {
        statusIn: ["previsto", "provisionado", "pago", "liquidado", "atrasado"],
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        pageSize: 500,
      }),
    enabled: !!tenantId,
    staleTime: 1000 * 30,
  });

  // ── Saldo bancário real (da conta, atualizado via upload OFX) ───────────────
  // finance_bank_accounts.balance é atualizado no import de extrato OFX.
  const actualBankBalance = filters.bankAccountId
    ? (bankAccounts.find((a) => a.id === filters.bankAccountId)?.balance ?? null)
    : bankAccounts.length > 0
    ? bankAccounts.reduce((s, a) => s + (a.balance ?? 0), 0)
    : null;

  // ── Run reconciliation engine ─────────────────────────────────────────────
  const {
    data: reconciliationResult,
    isLoading: isLoadingEngine,
    isError,
    refetch,
  } = useReconciliationCandidates({
    bankAccountId: filters.bankAccountId || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  // ── Apply status filter locally ──────────────────────────────────────────
  const filteredResult = reconciliationResult
    ? applyStatusFilter(reconciliationResult, filters.status)
    : reconciliationResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conciliação Bancária</h1>
          <p className="text-sm text-muted-foreground">
            Reconciliação automática de transações bancárias com lançamentos internos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoadingEngine}
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${isLoadingEngine ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Upload extrato */}
      <ConciliacaoUpload
        bankAccounts={bankAccounts}
        onImportComplete={() => void refetch()}
      />

      {/* KPI cards */}
      <ConciliacaoSummaryCards
        summary={summary}
        isLoading={isLoadingSummary || isLoadingAccounts}
        actualBankBalance={actualBankBalance}
      />

      {/* Filters */}
      <ConciliacaoFilters
        filters={filters}
        onChange={setFilters}
        bankAccounts={bankAccounts}
        isLoadingAccounts={isLoadingAccounts}
      />

      {/* Split-view */}
      <ConciliacaoSplitView
        result={filteredResult}
        isLoading={isLoadingEngine}
        isError={isError}
        onRetry={refetch}
        availableFinanceTxs={financeResult?.data}
        categories={categories}
        costCenters={costCenters}
      />
    </div>
  );
}

// ── Local status filter ───────────────────────────────────────────────────────

import type { ReconciliationResult } from "@/features/financeiro/services/reconciliation-engine";
import type { ConciliacaoStatusFilter } from "@/features/financeiro/components/conciliacao-filters";

function applyStatusFilter(
  result: ReconciliationResult,
  status: ConciliacaoStatusFilter
): ReconciliationResult {
  if (status === "all") return result;
  if (status === "auto") return { ...result, suggest: [], unmatched: [] };
  if (status === "sugestao") return { ...result, auto: [], unmatched: [] };
  if (status === "pendente") return { ...result, auto: [], suggest: [] };
  // "conciliado": show empty (conciliated items are not in engine output)
  return { ...result, auto: [], suggest: [], unmatched: [] };
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function ConciliacaoPage() {
  return (
    <RBACGuard minRole="admin">
      <ConciliacaoContent />
    </RBACGuard>
  );
}
