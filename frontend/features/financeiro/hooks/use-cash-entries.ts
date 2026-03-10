"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCashEntries,
  getLatestCashBalance,
  createCashEntry,
  type CashEntry,
  type CreateCashEntryInput,
} from "@/features/financeiro/services/cash-entries";

// ── Cash entries list ─────────────────────────────────────────────────────────

export function useCashEntries(limit = 20) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const query = useQuery<CashEntry[]>({
    queryKey: ["fin-cash-entries", tenantId, limit],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getCashEntries(supabase, limit);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60,
  });

  // Realtime: invalidate whenever fin_cash_entries changes for this tenant
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`fin-cash-entries-realtime:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_cash_entries",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["fin-cash-entries", tenantId] });
          // Also invalidate founder dashboard so effective caixa recalculates
          qc.invalidateQueries({ queryKey: ["founder-dashboard", tenantId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  return query;
}

// ── Latest balance only ───────────────────────────────────────────────────────

export function useLatestCashBalance() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<number | null>({
    queryKey: ["fin-cash-balance-latest", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const supabase = createClient();
      return getLatestCashBalance(supabase);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60,
  });
}

// ── Create entry mutation ─────────────────────────────────────────────────────

export function useCreateCashEntry() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<CashEntry, Error, CreateCashEntryInput>({
    mutationFn: async (input) => {
      if (!tenantId) throw new Error("Tenant não identificado.");
      const supabase = createClient();
      return createCashEntry(supabase, tenantId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fin-cash-entries", tenantId] });
      qc.invalidateQueries({ queryKey: ["fin-cash-balance-latest", tenantId] });
      // Propagate to founder dashboard KPIs
      qc.invalidateQueries({ queryKey: ["founder-dashboard", tenantId] });
    },
  });
}
