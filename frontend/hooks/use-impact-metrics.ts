"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getImpactMetrics,
  getImpactMetricsByPeriod,
  getImpactConfig,
  upsertImpactConfig,
  computeEmployeeImpact,
  computeAllEmployeesImpact,
  type ImpactMetricRow,
  type ImpactConfigRow,
} from "@/services/impact-metrics";

// ---------------------------------------------------------------------------
// Impact Metrics — Read
// ---------------------------------------------------------------------------

/** Impact metrics for a single employee in a period */
export function useImpactMetrics(
  employeeId: string | undefined,
  period?: string
) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["impact-metrics", tenantId, employeeId, period],
    queryFn: () =>
      getImpactMetrics(supabase, tenantId!, employeeId!, period!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!employeeId && !!period,
  });
}

/** All impact metrics for a period (company-wide) */
export function useAllImpactMetrics(period?: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["impact-metrics-all", tenantId, period],
    queryFn: () => getImpactMetricsByPeriod(supabase, tenantId!, period!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!period,
  });
}

// ---------------------------------------------------------------------------
// Impact Config
// ---------------------------------------------------------------------------

export function useImpactConfig() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["impact-config", tenantId],
    queryFn: () => getImpactConfig(supabase, tenantId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

export function useUpsertImpactConfig() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (config: {
      metric_id: string;
      weight?: number;
      threshold?: number;
      is_inverted?: boolean;
      is_active?: boolean;
    }) => upsertImpactConfig(supabase, tenantId!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impact-config"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Compute Mutations
// ---------------------------------------------------------------------------

/** Compute impact metrics for a single employee */
export function useComputeImpact() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: {
      employeeId: string;
      period: string;
      employeeName: string;
    }) =>
      computeEmployeeImpact(
        supabase,
        tenantId!,
        payload.employeeId,
        payload.period,
        payload.employeeName
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["impact-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["impact-metrics-all"] });
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["employee-snapshots"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "employee_impact_metrics",
        recordId: variables.employeeId,
        after: { period: variables.period },
      });
    },
  });
}

/** Compute impact metrics for ALL employees in a period */
export function useComputeAllImpact() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: {
      period: string;
      getName: (id: string) => string;
    }) =>
      computeAllEmployeesImpact(
        supabase,
        tenantId!,
        payload.period,
        payload.getName
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["impact-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["impact-metrics-all"] });
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["employee-snapshots"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "employee_impact_metrics",
        recordId: "batch",
        after: { count: data.length },
      });
    },
  });
}
