"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDashboardData,
  getFounderDashboardData,
  getLiderDashboardData,
  computeKPIs,
} from "@/features/dashboard/services/dashboard";
import { getFounderKPIs } from "@/features/financeiro/services/finance-kpis";
import { getFinanceCashFlowProjection } from "@/features/financeiro/services/finance-cashflow";
import type { FounderKPIs } from "@/features/financeiro/services/finance-types";
import type { CashFlowPoint } from "@/features/financeiro/services/finance-types";

export function useDashboard() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["dashboard", tenantId],
    queryFn: () => getDashboardData(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useDashboardKPIs() {
  const { data, ...rest } = useDashboard();
  return {
    ...rest,
    data: data ? computeKPIs(data) : undefined,
    rawData: data,
  };
}

export function useFounderDashboard() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["founder-dashboard", tenantId],
    queryFn: () => getFounderDashboardData(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLiderDashboard() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["lider-dashboard", tenantId],
    queryFn: () => getLiderDashboardData(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export interface FinanceDashboardData {
  kpis: FounderKPIs;
  cashFlow: CashFlowPoint[];
}

export function useFinanceDashboard() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FinanceDashboardData>({
    queryKey: ["finance-dashboard", tenantId],
    queryFn: async () => {
      const [kpis, cashFlow] = await Promise.all([
        getFounderKPIs(supabase),
        getFinanceCashFlowProjection(supabase, 30),
      ]);
      return { kpis, cashFlow };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
