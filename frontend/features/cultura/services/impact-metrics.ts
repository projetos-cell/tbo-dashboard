import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  IMPACT_METRICS,
  IMPACT_METRIC_MAP,
  periodToDateRange,
  normalizeMetricValue,
  type ImpactMetricDef,
} from "@/features/performance/utils/performance-constants";

// ============================================================================
// Types
// ============================================================================

export interface ImpactMetricRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  period: string;
  on_time_delivery: number | null;
  rework_rate: number | null;
  project_margin: number | null;
  okr_completion: number | null;
  decision_participation: number | null;
  recognitions_received: number | null;
  raw_data: Record<string, unknown>;
  impact_score: number | null;
  computed_at: string;
  created_at: string;
}

export interface ImpactConfigRow {
  id: string;
  tenant_id: string;
  metric_id: string;
  weight: number;
  threshold: number;
  is_inverted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RawMetricResult {
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
 * Entregas no Prazo: % of tasks completed within due_date
 * Source: os_tasks WHERE assignee_id = employee AND completed in period
 */
async function fetchOnTimeDelivery(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawMetricResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("os_tasks" as never)
    .select("id, due_date, completed_at, is_completed" as never)
    .eq("assignee_id", employeeId)
    .eq("is_completed", true)
    .gte("completed_at", start)
    .lte("completed_at", end);

  if (error) throw error;

  const tasks = (data ?? []) as Array<{
    id: string;
    due_date: string | null;
    completed_at: string | null;
    is_completed: boolean;
  }>;

  if (tasks.length === 0) {
    return {
      metricId: "on_time_delivery",
      rawValue: null,
      normalizedScore: null,
      details: { total: 0, onTime: 0 },
      available: true,
    };
  }

  const withDueDate = tasks.filter((t) => t.due_date && t.completed_at);
  if (withDueDate.length === 0) {
    return {
      metricId: "on_time_delivery",
      rawValue: null,
      normalizedScore: null,
      details: { total: tasks.length, withDueDate: 0 },
      available: true,
    };
  }

  const onTime = withDueDate.filter((t) => {
    const due = new Date(t.due_date! + "T23:59:59");
    const completed = new Date(t.completed_at!);
    return completed <= due;
  });

  const pct = (onTime.length / withDueDate.length) * 100;

  return {
    metricId: "on_time_delivery",
    rawValue: Math.round(pct * 10) / 10,
    normalizedScore: Math.round(pct * 10) / 10,
    details: {
      total: tasks.length,
      withDueDate: withDueDate.length,
      onTime: onTime.length,
    },
    available: true,
  };
}

/**
 * Rework Rate: % of tasks where updated_at > completed_at + 1h
 * Heuristic: reopened tasks (edited significantly after completion)
 * Inverted: lower = better
 */
async function fetchReworkRate(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawMetricResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("os_tasks" as never)
    .select("id, completed_at, updated_at, is_completed" as never)
    .eq("assignee_id", employeeId)
    .eq("is_completed", true)
    .gte("completed_at", start)
    .lte("completed_at", end);

  if (error) throw error;

  const tasks = (data ?? []) as Array<{
    id: string;
    completed_at: string | null;
    updated_at: string | null;
    is_completed: boolean;
  }>;

  if (tasks.length === 0) {
    return {
      metricId: "rework_rate",
      rawValue: null,
      normalizedScore: null,
      details: { total: 0, reworked: 0 },
      available: true,
    };
  }

  const ONE_HOUR = 60 * 60 * 1000;
  const reworked = tasks.filter((t) => {
    if (!t.completed_at || !t.updated_at) return false;
    const completedMs = new Date(t.completed_at).getTime();
    const updatedMs = new Date(t.updated_at).getTime();
    return updatedMs > completedMs + ONE_HOUR;
  });

  const reworkPct = (reworked.length / tasks.length) * 100;

  return {
    metricId: "rework_rate",
    rawValue: Math.round(reworkPct * 10) / 10,
    normalizedScore: Math.round(reworkPct * 10) / 10, // will be inverted during normalization
    details: {
      total: tasks.length,
      reworked: reworked.length,
    },
    available: true,
  };
}

/**
 * Project Margin: placeholder — no cost data available
 */
async function fetchProjectMargin(): Promise<RawMetricResult> {
  return {
    metricId: "project_margin",
    rawValue: null,
    normalizedScore: null,
    details: { reason: "No cost data available — placeholder for future implementation" },
    available: false,
  };
}

/**
 * OKR Completion: % of key results completed where employee is owner
 */
async function fetchOKRCompletion(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawMetricResult> {
  const { start, end } = periodToDateRange(period);

  // Get KRs owned by employee, created or active in period
  const { data, error } = await supabase
    .from("okr_key_results" as never)
    .select("id, status, current_value, target_value" as never)
    .eq("owner_id", employeeId)
    .lte("created_at", end);

  if (error) throw error;

  const krs = (data ?? []) as Array<{
    id: string;
    status: string;
    current_value: number | null;
    target_value: number | null;
  }>;

  if (krs.length === 0) {
    return {
      metricId: "okr_completion",
      rawValue: null,
      normalizedScore: null,
      details: { totalKRs: 0 },
      available: true,
    };
  }

  // Calculate completion by progress ratio
  let totalProgress = 0;
  let countWithTarget = 0;

  for (const kr of krs) {
    if (kr.status === "completed") {
      totalProgress += 100;
      countWithTarget++;
    } else if (kr.status === "cancelled") {
      // skip cancelled
    } else if (kr.target_value && kr.target_value > 0) {
      const progress = Math.min(
        ((kr.current_value ?? 0) / kr.target_value) * 100,
        100
      );
      totalProgress += progress;
      countWithTarget++;
    }
  }

  const avgCompletion =
    countWithTarget > 0 ? totalProgress / countWithTarget : 0;

  return {
    metricId: "okr_completion",
    rawValue: Math.round(avgCompletion * 10) / 10,
    normalizedScore: Math.round(avgCompletion * 10) / 10,
    details: {
      totalKRs: krs.length,
      countWithTarget,
      completed: krs.filter((k) => k.status === "completed").length,
    },
    available: true,
  };
}

/**
 * Decision Participation: count of decisions where decided_by ILIKE employee name
 * Uses text matching because decided_by is TEXT not UUID
 */
async function fetchDecisionParticipation(
  supabase: SB,
  _employeeId: string,
  period: string,
  employeeName: string
): Promise<RawMetricResult> {
  if (!employeeName || employeeName === "Desconhecido") {
    return {
      metricId: "decision_participation",
      rawValue: 0,
      normalizedScore: 0,
      details: { reason: "No employee name for text matching" },
      available: true,
    };
  }

  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("decisions" as never)
    .select("id" as never)
    .ilike("decided_by", `%${employeeName}%`)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const count = (data ?? []).length;

  return {
    metricId: "decision_participation",
    rawValue: count,
    normalizedScore: count, // will be scaled by threshold during normalization
    details: { count, matchedName: employeeName },
    available: true,
  };
}

/**
 * Recognitions Received: count of recognitions where to_user = employee
 */
async function fetchRecognitionsReceived(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<RawMetricResult> {
  const { start, end } = periodToDateRange(period);

  const { data, error } = await supabase
    .from("recognitions" as never)
    .select("id" as never)
    .eq("to_user", employeeId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw error;

  const count = (data ?? []).length;

  return {
    metricId: "recognitions_received",
    rawValue: count,
    normalizedScore: count, // will be scaled by threshold during normalization
    details: { count },
    available: true,
  };
}

// ============================================================================
// Normalization + Computation
// ============================================================================

// normalizeMetricValue is imported from @/features/performance/utils/performance-constants (shared by Impact + Culture)
export { normalizeMetricValue } from "@/features/performance/utils/performance-constants";

/**
 * Compute weighted average impact score from normalized metrics
 * Skips nulls and renormalizes weights among available metrics
 */
export function computeImpactScore(
  metrics: RawMetricResult[],
  configs?: ImpactConfigRow[]
): number | null {
  const configMap = new Map((configs ?? []).map((c) => [c.metric_id, c]));

  const entries: Array<{ score: number; weight: number }> = [];

  for (const m of metrics) {
    if (!m.available || m.normalizedScore == null) continue;

    const def = IMPACT_METRIC_MAP.get(m.metricId);
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
 * Compute all impact metrics for a single employee
 * Returns the upserted row with all 6 metrics + composite score
 */
export async function computeEmployeeImpact(
  supabase: SB,
  tenantId: string,
  employeeId: string,
  period: string,
  employeeName: string
): Promise<ImpactMetricRow> {
  // Fetch all 6 metrics in parallel
  const results = await Promise.allSettled([
    fetchOnTimeDelivery(supabase, employeeId, period),
    fetchReworkRate(supabase, employeeId, period),
    fetchProjectMargin(),
    fetchOKRCompletion(supabase, employeeId, period),
    fetchDecisionParticipation(supabase, employeeId, period, employeeName),
    fetchRecognitionsReceived(supabase, employeeId, period),
  ]);

  const metrics: RawMetricResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    // Fallback for rejected promises
    return {
      metricId: IMPACT_METRICS[i].id,
      rawValue: null,
      normalizedScore: null,
      details: { error: r.reason?.message ?? "Unknown error" },
      available: false,
    };
  });

  // Get configs for normalization
  const configs = await getImpactConfig(supabase);

  // Normalize each metric
  const configMap = new Map((configs ?? []).map((c) => [c.metric_id, c]));
  const normalizedMetrics = metrics.map((m) => {
    const def = IMPACT_METRIC_MAP.get(m.metricId);
    if (!def || !m.available || m.rawValue == null) return m;

    const cfg = configMap.get(m.metricId);
    const threshold = cfg?.threshold ?? def.defaultThreshold;
    const normalized = normalizeMetricValue(m.rawValue, def, threshold);

    return { ...m, normalizedScore: normalized };
  });

  // Compute composite score
  const impactScore = computeImpactScore(normalizedMetrics, configs);

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
    .from("employee_impact_metrics" as never)
    .upsert(
      {
        tenant_id: tenantId,
        employee_id: employeeId,
        period,
        on_time_delivery: getMetricScore("on_time_delivery"),
        rework_rate: getMetricScore("rework_rate"),
        project_margin: getMetricScore("project_margin"),
        okr_completion: getMetricScore("okr_completion"),
        decision_participation: getMetricScore("decision_participation"),
        recognitions_received: getMetricScore("recognitions_received"),
        raw_data: rawData,
        impact_score: impactScore,
        computed_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,employee_id,period" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ImpactMetricRow;
}

/**
 * Compute impact for all employees with skill scores in the period
 */
export async function computeAllEmployeesImpact(
  supabase: SB,
  tenantId: string,
  period: string,
  getName: (id: string) => string
): Promise<ImpactMetricRow[]> {
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
  const results: ImpactMetricRow[] = [];
  for (const employeeId of employeeIds) {
    const name = getName(employeeId);
    const row = await computeEmployeeImpact(
      supabase,
      tenantId,
      employeeId,
      period,
      name
    );
    results.push(row);
  }

  return results;
}

// ============================================================================
// CRUD / Read
// ============================================================================

export async function getImpactMetrics(
  supabase: SB,
  employeeId: string,
  period: string
): Promise<ImpactMetricRow | null> {
  const { data, error } = await supabase
    .from("employee_impact_metrics" as never)
    .select("*")
    .eq("employee_id", employeeId)
    .eq("period", period)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ImpactMetricRow | null;
}

export async function getImpactMetricsByPeriod(
  supabase: SB,
  period: string
): Promise<ImpactMetricRow[]> {
  const { data, error } = await supabase
    .from("employee_impact_metrics" as never)
    .select("*")
    .eq("period", period);

  if (error) throw error;
  return (data ?? []) as unknown as ImpactMetricRow[];
}

export async function getImpactConfig(
  supabase: SB
): Promise<ImpactConfigRow[]> {
  const { data, error } = await supabase
    .from("impact_metric_config" as never)
    .select("*");

  if (error) throw error;
  return (data ?? []) as unknown as ImpactConfigRow[];
}

export async function upsertImpactConfig(
  supabase: SB,
  tenantId: string,
  config: {
    metric_id: string;
    weight?: number;
    threshold?: number;
    is_inverted?: boolean;
    is_active?: boolean;
  }
): Promise<ImpactConfigRow> {
  const { data, error } = await supabase
    .from("impact_metric_config" as never)
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
  return data as unknown as ImpactConfigRow;
}
