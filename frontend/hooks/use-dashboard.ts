"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDashboardData,
  getFounderDashboardData,
  computeKPIs,
} from "@/services/dashboard";

export function useDashboard() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["dashboard", tenantId],
    queryFn: () => getDashboardData(supabase, tenantId!),
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
    queryFn: () => getFounderDashboardData(supabase, tenantId!),
    enabled: !!tenantId,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });
}
