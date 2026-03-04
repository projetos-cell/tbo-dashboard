"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getFinanceTransactions,
  getFinanceCategories,
  getFinanceCostCenters,
  getFinanceSnapshots,
  getFinanceStatus,
  getFounderKPIs,
  triggerFinanceSync,
  type FinanceTransaction,
  type FinanceCategory,
  type FinanceCostCenter,
  type FinanceSnapshot,
  type FinanceStatus,
  type FinanceFilters,
  type FounderKPIs,
} from "@/services/finance";

// ── Transactions ──────────────────────────────────────────────────────────────

export function useFinanceTransactions(filters: FinanceFilters = {}) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  // Stable key from filters
  const filterKey = JSON.stringify(filters);

  const query = useQuery<{ data: FinanceTransaction[]; count: number }>({
    queryKey: ["finance-transactions", tenantId, filterKey],
    queryFn: async () => {
      if (!tenantId) return { data: [], count: 0 };
      const supabase = createClient();
      return getFinanceTransactions(supabase, tenantId, filters);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 30,
  });

  // Realtime subscription — invalidate on any change
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`finance-tx-realtime:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_transactions",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({
            queryKey: ["finance-transactions", tenantId],
          });
          // Also refresh status when transactions change
          qc.invalidateQueries({
            queryKey: ["finance-status", tenantId],
          });
          // Keep founder KPIs and snapshots in sync
          qc.invalidateQueries({
            queryKey: ["finance-founder-kpis", tenantId],
          });
          qc.invalidateQueries({
            queryKey: ["finance-snapshots", tenantId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  return query;
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useFinanceCategories() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FinanceCategory[]>({
    queryKey: ["finance-categories", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getFinanceCategories(supabase, tenantId);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // Categories rarely change
  });
}

// ── Cost Centers ──────────────────────────────────────────────────────────────

export function useFinanceCostCenters() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FinanceCostCenter[]>({
    queryKey: ["finance-cost-centers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getFinanceCostCenters(supabase, tenantId);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Snapshots (for charts) ────────────────────────────────────────────────────

export function useFinanceSnapshots(days = 30) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FinanceSnapshot[]>({
    queryKey: ["finance-snapshots", tenantId, days],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getFinanceSnapshots(supabase, tenantId, days);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });
}

// ── Status ────────────────────────────────────────────────────────────────────

export function useFinanceStatus() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FinanceStatus>({
    queryKey: ["finance-status", tenantId],
    queryFn: async () => {
      if (!tenantId)
        return {
          totalTransactions: 0,
          totalReceitas: 0,
          totalDespesas: 0,
          pendingCount: 0,
          paidCount: 0,
          overdueCount: 0,
          lastSyncAt: null,
          categoriesCount: 0,
          costCentersCount: 0,
        };
      const supabase = createClient();
      return getFinanceStatus(supabase, tenantId);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

// ── Founder KPIs ─────────────────────────────────────────────────────────────

export function useFounderKPIs() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FounderKPIs>({
    queryKey: ["finance-founder-kpis", tenantId],
    queryFn: async () => {
      if (!tenantId)
        return {
          receitaMTD: 0,
          despesaMTD: 0,
          margemMTD: 0,
          margemPct: 0,
          apNext30: 0,
          arNext30: 0,
          saldoAcumulado: 0,
          costCenterRanking: [],
          categoryRanking: [],
          buRevenue: [],
          projectRanking: [],
        };
      const supabase = createClient();
      return getFounderKPIs(supabase, tenantId);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

// ── Sync mutation ─────────────────────────────────────────────────────────────

export function useTriggerFinanceSync() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: triggerFinanceSync,
    onSuccess: () => {
      // Invalidate everything finance-related (including founder KPIs)
      qc.invalidateQueries({ queryKey: ["finance-transactions", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-categories", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-cost-centers", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-status", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-snapshots", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-founder-kpis", tenantId] });
    },
  });
}
