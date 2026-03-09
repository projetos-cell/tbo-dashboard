// ============================================================================
// Scorecard TBO 2.0 — Constants (Fase 1-3: Skill + Impact + Culture)
// ============================================================================

// ---------------------------------------------------------------------------
// 10 Skills (matching legacy _habilidadesPDI IDs)
// ---------------------------------------------------------------------------

export interface SkillDefinition {
  id: string;
  name: string;
  category: "technical" | "behavioral";
  sortOrder: number;
}

export const SCORECARD_SKILLS: readonly SkillDefinition[] = [
  { id: "project_mgmt",    name: "Gestão de Projetos & Rituais", category: "technical",   sortOrder: 1 },
  { id: "technical",       name: "Habilidades Técnicas",         category: "technical",   sortOrder: 2 },
  { id: "deadline",        name: "Atendimento de Prazo",         category: "technical",   sortOrder: 3 },
  { id: "communication",   name: "Comunicação & Colaboração",    category: "behavioral",  sortOrder: 4 },
  { id: "leadership",      name: "Liderança & Engajamento",      category: "behavioral",  sortOrder: 5 },
  { id: "creativity",      name: "Criatividade",                 category: "behavioral",  sortOrder: 6 },
  { id: "quality",         name: "Qualidade de Entrega",         category: "technical",   sortOrder: 7 },
  { id: "productivity",    name: "Produtividade",                category: "technical",   sortOrder: 8 },
  { id: "learning",        name: "Aprendizado & Desenvolvimento",category: "behavioral",  sortOrder: 9 },
  { id: "problem_solving", name: "Resolução de Problemas",       category: "technical",   sortOrder: 10 },
] as const;

export const SKILL_MAP = new Map(SCORECARD_SKILLS.map((s) => [s.id, s]));

// ---------------------------------------------------------------------------
// Score Bands (faixas de performance)
// ---------------------------------------------------------------------------

export type ScoreBand = "elite" | "high" | "stable" | "attention";

export interface ScoreBandDef {
  key: ScoreBand;
  label: string;
  min: number;
  max: number;
  color: string;       // tailwind-friendly hex
  bgClass: string;     // badge background
  textClass: string;   // badge text
}

export const SCORE_BANDS: readonly ScoreBandDef[] = [
  { key: "elite",     label: "Elite",             min: 90, max: 100, color: "#10b981", bgClass: "bg-emerald-100 dark:bg-emerald-950/40", textClass: "text-emerald-700 dark:text-emerald-400" },
  { key: "high",      label: "Alta Performance",  min: 75, max: 89,  color: "#3b82f6", bgClass: "bg-blue-100 dark:bg-blue-950/40",     textClass: "text-blue-700 dark:text-blue-400" },
  { key: "stable",    label: "Estável",           min: 60, max: 74,  color: "#f59e0b", bgClass: "bg-amber-100 dark:bg-amber-950/40",   textClass: "text-amber-700 dark:text-amber-400" },
  { key: "attention", label: "Atenção",           min: 0,  max: 59,  color: "#ef4444", bgClass: "bg-red-100 dark:bg-red-950/40",       textClass: "text-red-700 dark:text-red-400" },
] as const;

export function getScoreBand(score: number | null | undefined): ScoreBandDef {
  if (score == null) return SCORE_BANDS[3]; // attention as fallback
  for (const band of SCORE_BANDS) {
    if (score >= band.min) return band;
  }
  return SCORE_BANDS[3];
}

// ---------------------------------------------------------------------------
// Layer Weights (defaults, configurable via scorecard_config)
// ---------------------------------------------------------------------------

export const DEFAULT_WEIGHTS = {
  skill: 0.35,
  impact: 0.45,
  culture: 0.20,
} as const;

// ---------------------------------------------------------------------------
// Trend helpers
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "stable";

export const TREND_CONFIG: Record<TrendDirection, { icon: string; label: string; color: string }> = {
  up:     { icon: "↑", label: "Subindo",  color: "text-emerald-600" },
  down:   { icon: "↓", label: "Caindo",   color: "text-red-600" },
  stable: { icon: "→", label: "Estável",  color: "text-gray-500" },
};

// ---------------------------------------------------------------------------
// Status helpers for table display
// ---------------------------------------------------------------------------

export function getStatusIcon(score: number | null | undefined): string {
  const band = getScoreBand(score);
  switch (band.key) {
    case "elite":     return "🟢";
    case "high":      return "🟢";
    case "stable":    return "🟡";
    case "attention": return "🔴";
  }
}

// ---------------------------------------------------------------------------
// Period helpers
// ---------------------------------------------------------------------------

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

/** Convert period "2026-03" to date range { start, end } ISO strings */
export function periodToDateRange(period: string): { start: string; end: string } {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Impact Metrics (Fase 2) — 6 metricas automaticas
// ---------------------------------------------------------------------------

export interface ImpactMetricDef {
  id: string;
  name: string;
  description: string;
  unit: "percent" | "count" | "currency";
  isInverted: boolean;       // true = lower is better (e.g. rework)
  defaultWeight: number;     // peso relativo default
  defaultThreshold: number;  // para contagem → score (ex: 5 reconhecimentos = 100)
  dataSource: string;        // tabela fonte
  available: boolean;        // false = placeholder, skip no calculo
}

export const IMPACT_METRICS: readonly ImpactMetricDef[] = [
  {
    id: "on_time_delivery",
    name: "Entregas no Prazo",
    description: "Percentual de tarefas concluidas dentro do prazo",
    unit: "percent",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 100,
    dataSource: "os_tasks",
    available: true,
  },
  {
    id: "rework_rate",
    name: "Taxa de Retrabalho",
    description: "Percentual de tarefas reabertas apos conclusao",
    unit: "percent",
    isInverted: true,
    defaultWeight: 0.8,
    defaultThreshold: 100,
    dataSource: "os_tasks",
    available: true,
  },
  {
    id: "project_margin",
    name: "Margem de Projetos",
    description: "Margem financeira dos projetos liderados",
    unit: "currency",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 100,
    dataSource: "projects",
    available: false,
  },
  {
    id: "okr_completion",
    name: "OKRs Concluidos",
    description: "Percentual de Key Results atingidos",
    unit: "percent",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 100,
    dataSource: "okr_key_results",
    available: true,
  },
  {
    id: "decision_participation",
    name: "Decisoes Estrategicas",
    description: "Participacao em decisoes registradas",
    unit: "count",
    isInverted: false,
    defaultWeight: 0.6,
    defaultThreshold: 5,
    dataSource: "decisions",
    available: true,
  },
  {
    id: "recognitions_received",
    name: "Reconhecimentos",
    description: "Reconhecimentos recebidos no periodo",
    unit: "count",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 5,
    dataSource: "recognitions",
    available: true,
  },
] as const;

export const IMPACT_METRIC_MAP = new Map(IMPACT_METRICS.map((m) => [m.id, m]));

// ---------------------------------------------------------------------------
// Culture Metrics (Fase 3) — 6 metricas automaticas
// ---------------------------------------------------------------------------

export interface CultureMetricDef {
  id: string;
  name: string;
  description: string;
  unit: "percent" | "count";
  isInverted: boolean;
  defaultWeight: number;
  defaultThreshold: number;
  dataSource: string;
  available: boolean;
}

export const CULTURE_METRICS: readonly CultureMetricDef[] = [
  {
    id: "values_alignment",
    name: "Alinhamento de Valores",
    description: "Diversidade de valores TBO reconhecidos (0-6)",
    unit: "count",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 6,
    dataSource: "recognitions",
    available: true,
  },
  {
    id: "feedback_engagement",
    name: "Engajamento em Feedback",
    description: "Feedbacks recebidos no periodo",
    unit: "count",
    isInverted: false,
    defaultWeight: 0.8,
    defaultThreshold: 5,
    dataSource: "feedbacks",
    available: true,
  },
  {
    id: "feedback_given",
    name: "Feedback Dado",
    description: "Feedbacks enviados no periodo",
    unit: "count",
    isInverted: false,
    defaultWeight: 0.8,
    defaultThreshold: 5,
    dataSource: "feedbacks",
    available: true,
  },
  {
    id: "one_on_one_participation",
    name: "Participacao em 1:1",
    description: "Percentual de 1:1s comparecidos (exclui cancelados)",
    unit: "percent",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 100,
    dataSource: "one_on_ones",
    available: true,
  },
  {
    id: "collaboration_index",
    name: "Indice de Colaboracao",
    description: "Reconhecimentos e feedbacks dados no periodo",
    unit: "count",
    isInverted: false,
    defaultWeight: 0.6,
    defaultThreshold: 10,
    dataSource: "recognitions+feedbacks",
    available: true,
  },
  {
    id: "peer_review_score",
    name: "Avaliacao de Pares",
    description: "Media das avaliacoes peer review (0-5 → 0-100)",
    unit: "percent",
    isInverted: false,
    defaultWeight: 1.0,
    defaultThreshold: 100,
    dataSource: "performance_reviews",
    available: true,
  },
] as const;

export const CULTURE_METRIC_MAP = new Map(CULTURE_METRICS.map((m) => [m.id, m]));

// ---------------------------------------------------------------------------
// Shared Normalization (used by Impact + Culture layers)
// ---------------------------------------------------------------------------

/**
 * Normalize a raw metric value to 0-100 scale
 * - Percentages: already 0-100
 * - Counts: linear scale up to threshold (e.g. 5 = 100)
 * - Inverted: 100 - value (lower is better, like rework)
 */
export function normalizeMetricValue(
  rawValue: number | null,
  metricDef: { unit: string; isInverted: boolean },
  threshold: number
): number | null {
  if (rawValue == null) return null;

  let score: number;

  if (metricDef.unit === "count") {
    // Linear scale: rawValue/threshold * 100, capped at 100
    score = Math.min((rawValue / Math.max(threshold, 1)) * 100, 100);
  } else {
    // Percent or currency: use as-is (0-100)
    score = Math.min(Math.max(rawValue, 0), 100);
  }

  // Invert if needed (rework: 0% rework = 100 score, 100% rework = 0 score)
  if (metricDef.isInverted) {
    score = 100 - score;
  }

  return Math.round(score * 10) / 10;
}
