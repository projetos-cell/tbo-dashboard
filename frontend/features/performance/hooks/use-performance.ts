"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getSkillScores,
  getSkillScoresByPeriod,
  upsertSkillScoresBatch,
  getPerformanceSnapshots,
  getEmployeeSnapshots,
  generateEmployeeSnapshot,
  getScorecardConfig,
  upsertScorecardConfig,
  computePerformanceKPIs,
  type SkillScoreRow,
  type PerformanceSnapshotRow,
  type ScorecardConfigRow,
} from "@/features/performance/services/performance";
import { currentPeriod } from "@/features/performance/utils/performance-constants";

// ---------------------------------------------------------------------------
// Skill Scores
// ---------------------------------------------------------------------------

/** Skill scores for a single employee (optionally filtered by period) */
export function useSkillScores(employeeId: string | undefined, period?: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["skill-scores", tenantId, employeeId, period],
    queryFn: () => getSkillScores(supabase, tenantId!, employeeId!, period),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!employeeId,
  });
}

/** All skill scores for a given period (all employees) */
export function useAllSkillScores(period?: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const p = period ?? currentPeriod();

  return useQuery({
    queryKey: ["skill-scores-all", tenantId, p],
    queryFn: () => getSkillScoresByPeriod(supabase, tenantId!, p),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

/** Mutation: batch upsert skill scores for an employee */
export function useUpsertSkillScores() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: {
      employeeId: string;
      scores: Array<{
        skill_id: string;
        level_percentage: number;
        expected_level: number;
        period: string;
        notes?: string;
      }>;
    }) => {
      const userId = useAuthStore.getState().user?.id;
      const rows = payload.scores.map((s) => ({
        employee_id: payload.employeeId,
        evaluated_by: userId,
        ...s,
      }));
      return upsertSkillScoresBatch(supabase, tenantId!, rows);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["skill-scores"] });
      queryClient.invalidateQueries({ queryKey: ["skill-scores-all"] });
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "employee_skill_scores",
        recordId: variables.employeeId,
        after: { scores_count: variables.scores.length },
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Performance Snapshots
// ---------------------------------------------------------------------------

/** All snapshots for a given period (company-wide) */
export function usePerformanceSnapshots(period?: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["performance-snapshots", tenantId, period],
    queryFn: () => getPerformanceSnapshots(supabase, tenantId!, period),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

/** Snapshot history for a single employee */
export function useEmployeeSnapshots(employeeId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["employee-snapshots", tenantId, employeeId],
    queryFn: () => getEmployeeSnapshots(supabase, tenantId!, employeeId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!employeeId,
  });
}

/** Mutation: generate/refresh snapshot for an employee */
export function useGenerateSnapshot() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: { employeeId: string; period?: string }) =>
      generateEmployeeSnapshot(supabase, tenantId!, payload.employeeId, payload.period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["employee-snapshots"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export function useScorecardConfig() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["scorecard-config", tenantId],
    queryFn: () => getScorecardConfig(supabase, tenantId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

export function useUpsertScorecardConfig() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (config: Partial<Omit<ScorecardConfigRow, "id" | "tenant_id" | "updated_at">>) =>
      upsertScorecardConfig(supabase, tenantId!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorecard-config"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      logAuditTrail({
        userId,
        action: "update",
        table: "scorecard_config",
        recordId: tenantId!,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// KPI computation hook
// ---------------------------------------------------------------------------

export { computePerformanceKPIs };
