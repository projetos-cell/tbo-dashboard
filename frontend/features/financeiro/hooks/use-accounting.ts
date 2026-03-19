/**
 * use-accounting.ts
 * React Query hooks para DRE e integração contábil.
 * Item 07 — Integração Contábil.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
  getDRESnapshot,
  getDRETrend,
  computeAndUpsertDRE,
  updateDREMeta,
  getChartOfAccounts,
  buildDRESummary,
  type DRESnapshot,
  type DRESummary,
  type DRETrend,
  type ChartOfAccount,
} from "../services/finance-accounting";

function useSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── DRE snapshot for a single month ──────────────────────────────────────────

export function useDRESnapshot(month: string) {
  const supabase = useSupabase();
  return useQuery<DRESnapshot | null>({
    queryKey: ["dre-snapshot", month],
    queryFn: () => getDRESnapshot(supabase, month),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDRESummary(month: string) {
  const supabase = useSupabase();
  return useQuery<DRESummary | null>({
    queryKey: ["dre-summary", month],
    queryFn: async () => {
      const snap = await getDRESnapshot(supabase, month);
      if (!snap) return null;
      return buildDRESummary(snap);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── DRE trend (last N months) ─────────────────────────────────────────────────

export function useDRETrend(months = 12) {
  const supabase = useSupabase();
  return useQuery<DRETrend[]>({
    queryKey: ["dre-trend", months],
    queryFn: () => getDRETrend(supabase, months),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Compute / refresh DRE for a month ────────────────────────────────────────

export function useComputeDRE() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation<DRESnapshot, Error, string>({
    mutationFn: (month: string) => computeAndUpsertDRE(supabase, month),
    onSuccess: (data) => {
      qc.setQueryData(["dre-snapshot", data.month], data);
      qc.setQueryData(["dre-summary", data.month], buildDRESummary(data));
      void qc.invalidateQueries({ queryKey: ["dre-trend"] });
    },
  });
}

// ── Update DRE meta (targets) ─────────────────────────────────────────────────

export function useUpdateDREMeta() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation<void, Error, { month: string; meta_receita?: number; meta_ebitda?: number }>({
    mutationFn: ({ month, ...meta }) => updateDREMeta(supabase, month, meta),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["dre-snapshot", vars.month] });
      void qc.invalidateQueries({ queryKey: ["dre-summary", vars.month] });
    },
  });
}

// ── Chart of accounts ────────────────────────────────────────────────────────

export function useChartOfAccounts() {
  const supabase = useSupabase();
  return useQuery<ChartOfAccount[]>({
    queryKey: ["chart-of-accounts"],
    queryFn: () => getChartOfAccounts(supabase),
    staleTime: 10 * 60 * 1000,
  });
}
