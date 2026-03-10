import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  CULTURE_METRICS,
  CULTURE_METRIC_MAP,
  periodToDateRange,
  normalizeMetricValue,
} from "@/features/performance/utils/performance-constants";

// ============================================================================
// Types
// ============================================================================

export interface CultureMetricRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  period: string;
  values_alignment: number | null;
  feedback_engagement: number | null;
  feedback_given: number | null;
  one_on_one_participation: number | null;
  collaboration_index: number | null;
  peer_review_score: number | null;
  raw_data: Record<string, unknown>;
  culture_score: number | null;
  computed_at: string;
  created_at: string;
}

export interface CultureConfigRow {
  id: string;
  tenant_id: string;
  metric_id: string;
  weight: number;
  threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RawCultureResult {
  metricId: string;
  rawValue: number | null;
  normalizedScore: number | null;
  details: Record<string, unknown>;
  available: boolean;
}

type SB = SupabaseClient<Database>;

// ============================================================================
// Individual Metric Fetchers
// ============================================================================

/**
 * Values Alignment: COUNT(DISTINCT value_id) from recognitions WHERE to_user
 * Measures diversity of TBO values recognized (0-6 distinct values)
 */
async function fetchValuesAlignment(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("recognitions" as never)
    .select("id, value_id" as never)
    .eq("to_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const recognitions = (data ?? []) as Array<{
    id: string;
    value_id: string | null;
  }>;

  if (recognitions.length === 0) {
    return {
      metricId: "values_alignment",
      rawValue: null,
      normalizedScore: null,
      details: { totalRecognitions: 0, distinctValues: 0 },
      available: true,
    };
  }

  const distinctValues = new Set(
    recognitions.map((r) => r.value_id).filter(Boolean)
  );

  return {
    metricId: "values_alignment",
    rawValue: distinctValues.size,
    normalizedScore: distinctValues.size, // will be scaled by threshold (6)
    details: {
      totalRecognitions: recognitions.length,
      distinctValues: distinctValues.size,
      values: [...distinctValues],
    },
    available: true,
  };
}

/**
 * Feedback Engagement: COUNT of feedbacks received in the period
 */
async function fetchFeedbackEngagement(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("feedbacks" as never)
    .select("id" as never)
    .eq("to_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const count = (data ?? []).length;

  return {
    metricId: "feedback_engagement",
    rawValue: count === 0 ? null : count,
    normalizedScore: count === 0 ? null : count, // will be scaled by threshold (5)
    details: { count },
    available: true,
  };
}

/**
 * Feedback Given: COUNT of feedbacks sent in the period
 */
async function fetchFeedbackGiven(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("feedbacks" as never)
    .select("id" as never)
    .eq("from_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const count = (data ?? []).length;

  return {
    metricId: "feedback_given",
    rawValue: count === 0 ? null : count,
    normalizedScore: count === 0 ? null : count,
    details: { count },
    available: true,
  };
}

/**
 * 1:1 Participation: completed / (completed + no_show)
 * Excludes cancelled from denominator
 */
async function fetchOneOnOneParticipation(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("one_on_ones" as never)
    .select("id, status" as never)
    .eq("collaborator_id", employeeId)
    .gte("scheduled_date", start)
    .lte("scheduled_date", end);

  if (error) throw error;

  const sessions = (data ?? []) as Array<{
    id: string;
    status: string;
  }>;

  // Exclude cancelled from denominator
  const nonCancelled = sessions.filter((s) => s.status !== "cancelled");

  if (nonCancelled.length === 0) {
    return {
      metricId: "one_on_one_participation",
      rawValue: null,
      normalizedScore: null,
      details: { total: sessions.length, nonCancelled: 0, completed: 0 },
      available: true,
    };
  }

  const completed = nonCancelled.filter((s) => s.status === "completed");
  const pct = (completed.length / nonCancelled.length) * 100;

  return {
    metricId: "one_on_one_participation",
    rawValue: Math.round(pct * 10) / 10,
    normalizedScore: Math.round(pct * 10) / 10,
    details: {
      total: sessions.length,
      nonCancelled: nonCancelled.length,
      completed: completed.length,
      noShow: nonCancelled.length - completed.length,
    },
    available: true,
  };
}

/**
 * Collaboration Index: recognitions given + feedbacks given in the period
 */
async function fetchCollaborationIndex(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  // Count recognitions given
  const { data: recData, error: recErr } = await supabase
    .from("recognitions" as never)
    .select("id" as never)
    .eq("from_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (recErr) throw recErr;

  // Count feedbacks given
  const { data: fbData, error: fbErr } = await supabase
    .from("feedbacks" as never)
    .select("id" as never)
    .eq("from_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (fbErr) throw fbErr;

  const recognitionsGiven = (recData ?? []).length;
  const feedbacksGiven = (fbData ?? []).length;
  const total = recognitionsGiven + feedbacksGiven;

  return {
    metricId: "collaboration_index",
    rawValue: total === 0 ? null : total,
    normalizedScore: total === 0 ? null : total, // will be scaled by threshold (10)
    details: { recognitionsGiven, feedbacksGiven, total },
    available: true,
  };
}

/**
 * Peer Review Score: average of performance_reviews where type='peer' and submitted
 * Scale: 0-5 → 0-100 via (average/5)*100
 */
async function fetchPeerReviewScore(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawCultureResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("performance_reviews" as never)
    .select("id, average" as never)
    .eq("target_user", employeeId)
    .eq("review_type", "peer")
    .eq("is_submitted", true)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const reviews = (data ?? []) as Array<{
    id: string;
    average: number | null;
  }>;

  const withScore = reviews.filter((r) => r.average != null);

  if (withScore.length === 0) {
    return {
      metricId: "peer_review_score",
      rawValue: null,
      normalizedScore: null,
      details: { totalReviews: reviews.length, withScore: 0 },
      available: true,
    };
  }

  // Average of averages, convert 0-5 → 0-100
  const avgRaw =
    withScore.reduce((sum, r) => sum + (r.average ?? 0), 0) / withScore.length;
  const pct = (avgRaw / 5) * 100;

  return {
    metricId: "peer_review_score",
    rawValue: Math.round(pct * 10) / 10,
    normalizedScore: Math.round(pct * 10) / 10,
    details: {
      totalReviews: reviews.length,
      withScore: withScore.length,
      avgRaw: Math.round(avgRaw * 100) / 100,
    },
    available: true,
  };
}

// ============================================================================
// Computation
// ============================================================================

/**
 * Compute weighted average culture score from normalized metrics
 * Skips nulls and renormalizes weights among available metrics
 */
export function computeCultureScore(
  metrics: RawCultureResult[],
  configs?: CultureConfigRow[]
): number | null {
  const configMap = new Map((configs ?? []).map((c) => [c.metric_id, c]));

  const entries: Array<{ score: number; weight: number }> = [];

  for (const m of metrics) {
    if (!m.available || m.normalizedScore == null) continue;

    const def = CULTURE_METRIC_MAP.get(m.metricId);
    if (!def || !def.available) continue;

    const cfg = configMap.get(m.metricId);
    const weight = cfg?.weight ?? def.defaultWeight;
    const threshold = cfg?.threshold ?? def.defaultThreshold;
    const isActive = cfg?.is_active ?? true;

    if (!isActive) continue;

    const normalized = normalizeMetricValue(m.rawValue, def, threshold);
    if (normalized == null) continue;

    entries.push({ score: normalized, weight });
  }

  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const weighted = entries.reduce(
    (sum, e) => sum + e.score * (e.weight / totalWeight),
    0
  );

  return Math.round(weighted * 10) / 10;
}

// ============================================================================
// Orchestration
// ============================================================================

/**
 * Compute all culture metrics for a single employee
 * Returns the upserted row with all 6 metrics + composite score
 */
export async function computeEmployeeCulture(
  supabase: SB,
  tenantId: string,
  employeeId: string,
  period: string
): Promise<CultureMetricRow> {
  // Fetch all 6 metrics in parallel
  const results = await Promise.allSettled([
    fetchValuesAlignment(supabase, employeeId, period),
    fetchFeedbackEngagement(supabase, employeeId, period),
    fetchFeedbackGiven(supabase, employeeId, period),
    fetchOneOnOneParticipation(supabase, employeeId, period),
    fetchCollaborationIndex(supabase, employeeId, period),
    fetchPeerReviewScore(supabase, employeeId, period),
  ]);

  const metrics: RawCultureResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      metricId: CULTURE_METRICS[i].id,
      rawValue: null,
      normalizedScore: null,
      details: { error: r.reason?.message ?? "Unknown error" },
      available: false,
    };
  });

  // Get configs for normalization
  const configs = await getCultureConfig(supabase);

  // Normalize each metric
  const configMap = new Map((configs ?? []).map((c) => [c.metric_id, c]));
  const normalizedMetrics = metrics.map((m) => {
    const def = CULTURE_METRIC_MAP.get(m.metricId);
    if (!def || !m.available || m.rawValue == null) return m;

    const cfg = configMap.get(m.metricId);
    const threshold = cfg?.threshold ?? def.defaultThreshold;
    const normalized = normalizeMetricValue(m.rawValue, def, threshold);

    return { ...m, normalizedScore: normalized };
  });

  // Compute composite score
  const cultureScore = computeCultureScore(normalizedMetrics, configs);

  // Build raw_data for audit
  const rawData: Record<string, unknown> = {};
  for (const m of normalizedMetrics) {
    rawData[m.metricId] = {
      raw: m.rawValue,
      normalized: m.normalizedScore,
      available: m.available,
      details: m.details,
    };
  }

  // Find normalized scores by metric id
  function getMetricScore(id: string): number | null {
    const m = normalizedMetrics.find((x) => x.metricId === id);
    return m?.normalizedScore ?? null;
  }

  // Upsert
  const { data, error } = await supabase
    .from("employee_culture_metrics" as never)
    .upsert(
      {
        tenant_id: tenantId,
        employee_id: employeeId,
        period,
        values_alignment: getMetricScore("values_alignment"),
        feedback_engagement: getMetricScore("feedback_engagement"),
        feedback_given: getMetricScore("feedback_given"),
        one_on_one_participation: getMetricScore("one_on_one_participation"),
        collaboration_index: getMetricScore("collaboration_index"),
        peer_review_score: getMetricScore("peer_review_score"),
        raw_data: rawData,
        culture_score: cultureScore,
        computed_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,employee_id,period" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CultureMetricRow;
}

/**
 * Compute culture for all employees with skill scores in the period
 */
export async function computeAllEmployeesCulture(
  supabase: SB,
  tenantId: string,
  period: string
): Promise<CultureMetricRow[]> {
  // Get all employees who have skill scores in this period
  const { data: skillScores, error } = await supabase
    .from("employee_skill_scores" as never)
    .select("employee_id" as never)
    .eq("period", period);

  if (error) throw error;

  // Deduplicate employee IDs
  const employeeIds = [
    ...new Set(
      ((skillScores ?? []) as Array<{ employee_id: string }>).map(
        (s) => s.employee_id
      )
    ),
  ];

  // Process sequentially to avoid overwhelming DB
  const results: CultureMetricRow[] = [];
  for (const employeeId of employeeIds) {
    const row = await computeEmployeeCulture(
      supabase,
      tenantId,
      employeeId,
      period
    );
    results.push(row);
  }

  return results;
}

// ============================================================================
// CRUD / Read
// ============================================================================

export async function getCultureMetrics(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<CultureMetricRow | null> {
  const { data, error } = await supabase
    .from("employee_culture_metrics" as never)
    .select("*")
    .eq("employee_id", employeeId)
    .eq("period", period)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as CultureMetricRow | null;
}

export async function getCultureMetricsByPeriod(
  supabase: SB,
  period: string
): Promise<CultureMetricRow[]> {
  const { data, error } = await supabase
    .from("employee_culture_metrics" as never)
    .select("*")
    .eq("period", period);

  if (error) throw error;
  return (data ?? []) as unknown as CultureMetricRow[];
}

export async function getCultureConfig(
  supabase: SB
): Promise<CultureConfigRow[]> {
  const { data, error } = await supabase
    .from("culture_metric_config" as never)
    .select("*");

  if (error) throw error;
  return (data ?? []) as unknown as CultureConfigRow[];
}

export async function upsertCultureConfig(
  supabase: SB,
  tenantId: string,
  config: {
    metric_id: string;
    weight?: number;
    threshold?: number;
    is_active?: boolean;
  }
): Promise<CultureConfigRow> {
  const { data, error } = await supabase
    .from("culture_metric_config" as never)
    .upsert(
      {
        tenant_id: tenantId,
        ...config,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,metric_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CultureConfigRow;
}
