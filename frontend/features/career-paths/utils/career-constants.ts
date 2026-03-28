// ── Competências ─────────────────────────────────────────────────────────────

export const COMPETENCY_KEYS = [
  "gestao_projetos",
  "habilidades_tecnicas",
  "prazo",
  "comunicacao",
  "lideranca",
  "criatividade",
  "qualidade",
  "produtividade",
  "aprendizado",
] as const;

export type CompetencyKey = (typeof COMPETENCY_KEYS)[number];

export const COMPETENCY_META: Record<
  CompetencyKey,
  { label: string; type: "hard" | "soft"; icon: string }
> = {
  gestao_projetos:    { label: "Gestão de Projetos",   type: "hard", icon: "📋" },
  habilidades_tecnicas: { label: "Habilidades Técnicas", type: "hard", icon: "🔧" },
  prazo:              { label: "Prazo",                 type: "hard", icon: "⏱️" },
  comunicacao:        { label: "Comunicação",           type: "soft", icon: "💬" },
  lideranca:          { label: "Liderança",             type: "soft", icon: "🎯" },
  criatividade:       { label: "Criatividade",          type: "soft", icon: "✨" },
  qualidade:          { label: "Qualidade",             type: "soft", icon: "⭐" },
  produtividade:      { label: "Produtividade",         type: "soft", icon: "⚡" },
  aprendizado:        { label: "Aprendizado",           type: "soft", icon: "📚" },
};

export const HARD_COMPETENCIES = COMPETENCY_KEYS.filter(
  (k) => COMPETENCY_META[k].type === "hard"
);
export const SOFT_COMPETENCIES = COMPETENCY_KEYS.filter(
  (k) => COMPETENCY_META[k].type === "soft"
);

// ── Trilhas ──────────────────────────────────────────────────────────────────

export const TRACK_TYPE_META = {
  base:    { label: "Trilha Base",    color: "bg-gray-100 text-gray-700",    dot: "bg-gray-400"   },
  gestao:  { label: "Trilha Gestão",  color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  tecnica: { label: "Trilha Técnica", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
} as const;

// ── Núcleos ──────────────────────────────────────────────────────────────────

export const NUCLEO_SLUGS = [
  "marketing",
  "branding",
  "digital_3d",
  "audiovisual",
  "operacoes",
  "comercial",
] as const;

// ── Score helpers ─────────────────────────────────────────────────────────────

/** Retorna a faixa de score como label */
export function getScoreLabel(score: number): string {
  if (score <= 39) return "Básico";
  if (score <= 59) return "Em desenvolvimento";
  if (score <= 79) return "Proficiente";
  return "Avançado";
}

/** Retorna a cor Tailwind para um score */
export function getScoreColor(score: number): string {
  if (score <= 39) return "text-red-600 bg-red-50";
  if (score <= 59) return "text-yellow-600 bg-yellow-50";
  if (score <= 79) return "text-blue-600 bg-blue-50";
  return "text-green-600 bg-green-50";
}

/** Retorna a cor de barra para um score */
export function getScoreBarColor(score: number): string {
  if (score <= 39) return "bg-red-400";
  if (score <= 59) return "bg-yellow-400";
  if (score <= 79) return "bg-blue-400";
  return "bg-green-500";
}

// ── Slugs dos níveis base ─────────────────────────────────────────────────────

export const BASE_LEVEL_SLUGS = [
  "estagiario",
  "jr_i",
  "jr_ii",
  "jr_iii",
  "pleno_i",
  "pleno_ii",
  "pleno_iii",
  "senior_i",
  "senior_ii",
  "po",
] as const;

export const GESTAO_LEVEL_SLUGS = [
  "coordenador",
  "head",
  "diretor",
  "partner",
] as const;
