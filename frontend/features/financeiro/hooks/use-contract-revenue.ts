"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getContractRevenueSummary,
  type ContractRevenueResult,
} from "@/features/financeiro/services/contract-revenue";

// ── Contract Revenue Summary ────────────────────────────────────────────────

export function useContractRevenueSummary() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["contract-revenue-summary", tenantId],
    queryFn: async () => {
      if (!tenantId) return { activeContracts: 0, totalMonthlyRevenue: 0 };
      const supabase = createClient();
      return getContractRevenueSummary(supabase);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Generate Contract Revenue (calls API route) ─────────────────────────────

export function useGenerateContractRevenue() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation<ContractRevenueResult, Error, string | undefined>({
    mutationFn: async (month?: string) => {
      const res = await fetch("/api/finance/generate-contract-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Erro (${res.status})`
        );
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-transactions", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-founder-kpis", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-status", tenantId] });
      qc.invalidateQueries({ queryKey: ["finance-status-amounts", tenantId] });
      qc.invalidateQueries({ queryKey: ["contract-revenue-summary", tenantId] });
    },
  });
}
