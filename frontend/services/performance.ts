import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  SCORECARD_SKILLS,
  DEFAULT_WEIGHTS,
  getScoreBand,
  currentPeriod,
  type TrendDirection,
} from "@/lib/performance-constants";
import { getImpactMetrics } from "@/services/impact-metrics";
import { getCultureMetrics } from "@/services/culture-metrics";

// ============================================================================
// Types
// ============================================================================

export interface SkillScoreRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  skill_id: string;
  level_percentage: number;
  expected_level: number;
  period: string;
  evaluated_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerformanceSnapshotRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  skill_score: number | null;
  impact_score: number | null;
  culture_score: number | null;
  final_score: number | null;
  trend: TrendDirection | null;
  period: string;
  created_at: string;
}

export interface ScorecardConfigRow {
  id: string;
  tenant_id: string;
  skill_weight: number;
  impact_weight: number;
  culture_weight: number;
  elite_threshold: number;
  high_perf_threshold: number;
  stable_threshold: number;
  evaluation_period: "monthly" | "quarterly";
  updated_at: string;
}

export interface SkillWeightRow {
  id: string;
  tenant_id: string;
  skill_id: string;
  role_name: string;
  weight: number;
  expected_level: number;
  created_at: string;
}

// ============================================================================
// KPI aggregation
// ============================================================================

export interface PerformanceKPIs {
  avgScore: number;
  eliteCount: number;
  highCount: number;
  stableCount: number;
  attentionCount: number;
  totalEvaluated: number;
  topPerformer: { name: string; score: number } | null;
  monthTrend: { up: number; down: number; stable: number };
}

export function computePerformanceKPIs(
  snapshots: PerformanceSnapshotRow[],
  getName: (id: string) => string
): PerformanceKPIs {
  const withScore = snapshots.filter((s) => s.final_score != null);
  const avgScore =
    withScore.length > 0
      ? withScore.reduce((sum, s) => sum + (s.final_score ?? 0), 0) / withScore.length
      : 0;

  let eliteCount = 0;
  let highCount = 0;
  let stableCount = 0;
  let attentionCount = 0;

  for (const s of withScore) {
    const band = getScoreBand(s.final_score);
    switch (band.key) {
      case "elite":     eliteCount++; break;
      case "high":      highCount++; break;
      case "stable":    stableCount++; break;
      case "attention": attentionCount++; break;
    }
  }

  const sorted = [...withScore].sort(
    (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
  );
  const topPerformer =
    sorted.length > 0
      ? { name: getName(sorted[0].employee_id), score: sorted[0].final_score ?? 0 }
      : null;

  const monthTrend = { up: 0, down: 0, stable: 0 };
  for (const s of snapshots) {
    if (s.trend === "up") monthTrend.up++;
    else if (s.trend === "down") monthTrend.down++;
    else monthTrend.stable++;
  }

  return {
    avgScore: Math.round(avgScore * 10) / 10,
    eliteCount,
    highCount,
    stableCount,
    attentionCount,
    totalEvaluated: withScore.length,
    topPerformer,
    monthTrend,
  };
}

// ============================================================================
// Skill Score CRUD
// ============================================================================

type SB = SupabaseClient<Database>;

export async function getSkillScores(
  supabase: SB,
  tenantId: string,
  employeeId: string,
  period?: string
): Promise<SkillScoreRow[]> {
  let query = supabase
    .from("employee_skill_scores" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("employee_id", employeeId);

  if (period) {
    query = query.eq("period", period);
  }

  query = query.order("skill_id" as never);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SkillScoreRow[];
}

export async function getSkillScoresByPeriod(
  supabase: SB,
  tenantId: string,
  period: string
): Promise<SkillScoreRow[]> {
  const { data, error } = await supabase
    .from("employee_skill_scores" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("period", period)
    .order("employee_id" as never);

  if (error) throw error;
  return (data ?? []) as unknown as SkillScoreRow[];
}

export async function upsertSkillScore(
  supabase: SB,
  tenantId: string,
  payload: {
    employee_id: string;
    skill_id: string;
    level_percentage: number;
    expected_level: number;
    period: string;
    evaluated_by?: string;
    notes?: string;
  }
): Promise<SkillScoreRow> {
  const { data, error } = await supabase
    .from("employee_skill_scores" as never)
    .upsert(
      {
        tenant_id: tenantId,
        ...payload,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,employee_id,skill_id,period" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as SkillScoreRow;
}

export async function upsertSkillScoresBatch(
  supabase: SB,
  tenantId: string,
  scores: Array<{
    employee_id: string;
    skill_id: string;
    level_percentage: number;
    expected_level: number;
    period: string;
    evaluated_by?: string;
    notes?: string;
  }>
): Promise<SkillScoreRow[]> {
  const rows = scores.map((s) => ({
    tenant_id: tenantId,
    ...s,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("employee_skill_scores" as never)
    .upsert(rows as never, { onConflict: "tenant_id,employee_id,skill_id,period" })
    .select();

  if (error) throw error;
  return (data ?? []) as unknown as SkillScoreRow[];
}

// ============================================================================
// Performance Snapshots
// ============================================================================

export async function getPerformanceSnapshots(
  supabase: SB,
  tenantId: string,
  period?: string
): Promise<PerformanceSnapshotRow[]> {
  let query = supabase
    .from("employee_performance_snapshot" as never)
    .select("*")
    .eq("tenant_id", tenantId);

  if (period) {
    query = query.eq("period", period);
  }

  query = query.order("final_score" as never, { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PerformanceSnapshotRow[];
}

export async function getEmployeeSnapshots(
  supabase: SB,
  tenantId: string,
  employeeId: string
): Promise<PerformanceSnapshotRow[]> {
  const { data, error } = await supabase
    .from("employee_performance_snapshot" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("employee_id", employeeId)
    .order("period" as never, { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as PerformanceSnapshotRow[];
}

export async function upsertSnapshot(
  supabase: SB,
  tenantId: string,
  payload: {
    employee_id: string;
    skill_score: number | null;
    impact_score: number | null;
    culture_score: number | null;
    final_score: number | null;
    trend: TrendDirection | null;
    period: string;
  }
): Promise<PerformanceSnapshotRow> {
  const { data, error } = await supabase
    .from("employee_performance_snapshot" as never)
    .upsert(
      { tenant_id: tenantId, ...payload } as never,
      { onConflict: "tenant_id,employee_id,period" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PerformanceSnapshotRow;
}

// ============================================================================
// Config
// ============================================================================

export async function getScorecardConfig(
  supabase: SB,
  tenantId: string
): Promise<ScorecardConfigRow | null> {
  const { data, error } = await supabase
    .from("scorecard_config" as never)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ScorecardConfigRow | null;
}

export async function upsertScorecardConfig(
  supabase: SB,
  tenantId: string,
  config: Partial<Omit<ScorecardConfigRow, "id" | "tenant_id" | "updated_at">>
): Promise<ScorecardConfigRow> {
  const { data, error } = await supabase
    .from("scorecard_config" as never)
    .upsert(
      {
        tenant_id: tenantId,
        ...config,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ScorecardConfigRow;
}

// ============================================================================
// Skill Score computation
// ============================================================================

/** Compute weighted average skill score for an employee given their skill scores */
export function computeSkillScore(
  scores: SkillScoreRow[],
  _weights?: SkillWeightRow[]
): number | null {
  if (scores.length === 0) return null;

  // For now, equal weight for all skills (Fase 1 simple)
  // TODO: Use role-based weights from scorecard_skill_weights when available
  const total = scores.reduce((sum, s) => sum + s.level_percentage, 0);
  return Math.round((total / scores.length) * 10) / 10;
}

/** Compute final score from 3 layers with given weights */
export function computeFinalScore(
  skillScore: number | null,
  impactScore: number | null,
  cultureScore: number | null,
  weights = DEFAULT_WEIGHTS
): number | null {
  // Fase 1: only skill_score is available
  // Return weighted score with available layers
  const layers: Array<{ score: number; weight: number }> = [];

  if (skillScore != null) layers.push({ score: skillScore, weight: weights.skill });
  if (impactScore != null) layers.push({ score: impactScore, weight: weights.impact });
  if (cultureScore != null) layers.push({ score: cultureScore, weight: weights.culture });

  if (layers.length === 0) return null;

  // Normalize weights to sum to 1.0
  const totalWeight = layers.reduce((sum, l) => sum + l.weight, 0);
  const weighted = layers.reduce((sum, l) => sum + l.score * (l.weight / totalWeight), 0);

  return Math.round(weighted * 10) / 10;
}

/** Determine trend based on current and previous final_score */
export function computeTrend(
  currentScore: number | null,
  previousScore: number | null
): TrendDirection {
  if (currentScore == null || previousScore == null) return "stable";
  const diff = currentScore - previousScore;
  if (diff > 2) return "up";
  if (diff < -2) return "down";
  return "stable";
}

/** Generate snapshot for an employee for the current period */
export async function generateEmployeeSnapshot(
  supabase: SB,
  tenantId: string,
  employeeId: string,
  period?: string
): Promise<PerformanceSnapshotRow> {
  const targetPeriod = period ?? currentPeriod();

  // Get current skill scores
  const scores = await getSkillScores(supabase, tenantId, employeeId, targetPeriod);
  const skillScore = computeSkillScore(scores);

  // Get impact score from pre-computed impact metrics (Fase 2)
  const impactRow = await getImpactMetrics(supabase, tenantId, employeeId, targetPeriod);
  const impactScore = impactRow?.impact_score ?? null;

  // Get culture score from pre-computed culture metrics (Fase 3)
  const cultureRow = await getCultureMetrics(supabase, tenantId, employeeId, targetPeriod);
  const cultureScore = cultureRow?.culture_score ?? null;

  const finalScore = computeFinalScore(skillScore, impactScore, cultureScore);

  // Get previous snapshot for trend
  const history = await getEmployeeSnapshots(supabase, tenantId, employeeId);
  const previousSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const trend = computeTrend(finalScore, previousSnapshot?.final_score ?? null);

  return upsertSnapshot(supabase, tenantId, {
    employee_id: employeeId,
    skill_score: skillScore,
    impact_score: impactScore,
    culture_score: cultureScore,
    final_score: finalScore,
    trend,
    period: targetPeriod,
  });
}
