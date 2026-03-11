"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getCultureMetrics,
  getCultureMetricsByPeriod,
  getCultureConfig,
  upsertCultureConfig,
  computeEmployeeCulture,
  computeAllEmployeesCulture,
  type CultureMetricRow,
  type CultureConfigRow,
} from "@/features/cultura/services/culture-metrics";

// ---------------------------------------------------------------------------
// Culture Metrics — Read
// ---------------------------------------------------------------------------

/** Culture metrics for a single employee in a period */
export function useCultureMetrics(
  employeeId: string | undefined,
  period?: string
) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["culture-metrics", tenantId, employeeId, period],
    queryFn: () =>
      getCultureMetrics(supabase, employeeId!, period!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!employeeId && !!period,
  });
}

/** All culture metrics for a period (company-wide) */
export function useAllCultureMetrics(period?: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["culture-metrics-all", tenantId, period],
    queryFn: () => getCultureMetricsByPeriod(supabase, period!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!period,
  });
}

// ---------------------------------------------------------------------------
// Culture Config
// ---------------------------------------------------------------------------

export function useCultureConfig() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["culture-config", tenantId],
    queryFn: () => getCultureConfig(supabase),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

export function useUpsertCultureConfig() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (config: {
      metric_id: string;
      weight?: number;
      threshold?: number;
      is_active?: boolean;
    }) => upsertCultureConfig(supabase, tenantId!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["culture-config"] });
      toast.success("Configuração de cultura salva");
    },
    onError: () => toast.error("Erro ao salvar configuração"),
  });
}

// ---------------------------------------------------------------------------
// Compute Mutations
// ---------------------------------------------------------------------------

/** Compute culture metrics for a single employee */
export function useComputeCulture() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: {
      employeeId: string;
      period: string;
    }) =>
      computeEmployeeCulture(
        supabase,
        tenantId!,
        payload.employeeId,
        payload.period
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["culture-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["culture-metrics-all"] });
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["employee-snapshots"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "employee_culture_metrics",
        recordId: variables.employeeId,
        after: { period: variables.period },
      });
      toast.success("Cultura calculada para o colaborador");
    },
    onError: () => toast.error("Erro ao calcular cultura"),
  });
}

/** Compute culture metrics for ALL employees in a period */
export function useComputeAllCulture() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: {
      period: string;
    }) =>
      computeAllEmployeesCulture(
        supabase,
        tenantId!,
        payload.period
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["culture-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["culture-metrics-all"] });
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["employee-snapshots"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "employee_culture_metrics",
        recordId: "batch",
        after: { count: data.length },
      });
      toast.success(`Cultura calculada para ${data.length} colaboradores`);
    },
    onError: () => toast.error("Erro ao calcular cultura em lote"),
  });
}
