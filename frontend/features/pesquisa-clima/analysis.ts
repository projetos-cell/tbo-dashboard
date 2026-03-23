import { SURVEY_SECTIONS, SURVEY_QUESTIONS, type SurveyQuestion } from "./constants";

// ── Types ──
export interface SurveyResponse {
  id: string;
  answers: Record<string, string | string[]>;
  submitted_at: string;
}

export interface ScaleStats {
  type: "scale";
  avg: number;
  distribution: number[];
  total: number;
  label: string;
  scaleMin: string;
  scaleMax: string;
}

export interface NpsStats {
  type: "nps";
  avg: number;
  distribution: number[];
  promoters: number;
  passives: number;
  detractors: number;
  score: number;
  total: number;
  label: string;
}

export interface SelectStats {
  type: "select";
  counts: Record<string, number>;
  total: number;
  label: string;
}

export interface MultiSelectStats {
  type: "multi_select";
  counts: Record<string, number>;
  total: number;
  label: string;
}

export interface TextStats {
  type: "text";
  answers: string[];
  label: string;
}

export type QuestionStats = ScaleStats | NpsStats | SelectStats | MultiSelectStats | TextStats;

export interface SectionAnalysis {
  sectionId: string;
  title: string;
  description?: string;
  questions: Array<{ question: SurveyQuestion; stats: QuestionStats }>;
  avgScore: number | null;
}

export interface InsightItem {
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  sectionId?: string;
}

export interface OverviewMetrics {
  totalResponses: number;
  totalTokens: number;
  responseRate: number;
  overallScore: number;
  // Clima
  happinessScore: number;       // q42
  belongingScore: number;       // q6
  purposeScore: number;         // q5
  workLifeBalance: number;      // q4
  // Liderança
  leadershipScore: number;      // avg q8-q12
  // Comunicação
  communicationScore: number;   // avg q13-q17
  psychSafetyScore: number;     // q17
  // Funções
  workloadScore: number;        // q21 (5=bom, escala alinhada)
  // Carreira
  careerClarityScore: number;   // avg q24-q26
  // Salários
  remunerationFairnessScore: number; // q37
  // Geral
  enps: number;                 // q41 (0-10 canônico)
  enpsPromoters: number;
  enpsPassives: number;
  enpsDetractors: number;
  retentionScore: number;       // q43 (intenção de permanência)
  prideScore: number;           // q44
  brandAlignmentScore: number;  // q46
}

// ── Compute stats for a single question ──
export function getQuestionStats(q: SurveyQuestion, responses: SurveyResponse[]): QuestionStats {
  const allAnswers = responses
    .map((r) => r.answers[q.id])
    .filter((a) => a !== undefined && a !== null && a !== "");

  if (q.type === "nps") {
    const nums = allAnswers.map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 10);
    const total = nums.length;
    const avg = total ? nums.reduce((a, b) => a + b, 0) / total : 0;
    const distribution = Array.from({ length: 11 }, (_, i) => nums.filter((v) => v === i).length);
    const promoters = nums.filter((v) => v >= 9).length;
    const passives = nums.filter((v) => v >= 7 && v <= 8).length;
    const detractors = nums.filter((v) => v <= 6).length;
    const score = total ? Math.round(((promoters - detractors) / total) * 100) : 0;
    return { type: "nps", avg, distribution, promoters, passives, detractors, score, total, label: q.label };
  }

  if (q.type === "scale") {
    const nums = allAnswers.map(Number).filter((n) => !isNaN(n));
    const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    const distribution = [1, 2, 3, 4, 5].map((n) => nums.filter((v) => v === n).length);
    return { type: "scale", avg, distribution, total: nums.length, label: q.label, scaleMin: q.scaleMin ?? "1", scaleMax: q.scaleMax ?? "5" };
  }

  if (q.type === "select" && q.options) {
    const counts: Record<string, number> = {};
    q.options.forEach((opt) => (counts[opt] = 0));
    allAnswers.forEach((a) => {
      if (typeof a === "string" && counts[a] !== undefined) counts[a]++;
    });
    return { type: "select", counts, total: allAnswers.length, label: q.label };
  }

  if (q.type === "multi_select") {
    const counts: Record<string, number> = {};
    (q.options ?? []).forEach((opt) => (counts[opt] = 0));
    allAnswers.forEach((a) => {
      if (Array.isArray(a)) a.forEach((v) => { if (counts[v] !== undefined) counts[v]++; });
    });
    return { type: "multi_select", counts, total: allAnswers.length, label: q.label };
  }

  return {
    type: "text",
    answers: allAnswers.filter((a): a is string => typeof a === "string" && a.trim() !== ""),
    label: q.label,
  };
}

// ── Section analysis ──
export function analyzeSections(responses: SurveyResponse[]): SectionAnalysis[] {
  return SURVEY_SECTIONS.map((section) => {
    const sectionQuestions = SURVEY_QUESTIONS.filter((q) => q.sectionId === section.id);
    const questions = sectionQuestions.map((q) => ({
      question: q,
      stats: getQuestionStats(q, responses),
    }));

    const scaleQuestions = questions.filter((q) => q.stats.type === "scale") as Array<{ question: SurveyQuestion; stats: ScaleStats }>;
    const avgScore = scaleQuestions.length
      ? scaleQuestions.reduce((sum, q) => sum + q.stats.avg, 0) / scaleQuestions.length
      : null;

    return {
      sectionId: section.id,
      title: section.title,
      description: section.description,
      questions,
      avgScore,
    };
  });
}

// ── Overview metrics ──
export function computeOverview(responses: SurveyResponse[], totalTokens: number): OverviewMetrics {
  const total = responses.length;
  const empty: OverviewMetrics = {
    totalResponses: 0, totalTokens, responseRate: 0, overallScore: 0,
    happinessScore: 0, belongingScore: 0, purposeScore: 0, workLifeBalance: 0,
    leadershipScore: 0, communicationScore: 0, psychSafetyScore: 0,
    workloadScore: 0, careerClarityScore: 0, remunerationFairnessScore: 0,
    enps: 0, enpsPromoters: 0, enpsPassives: 0, enpsDetractors: 0,
    retentionScore: 0, prideScore: 0, brandAlignmentScore: 0,
  };
  if (total === 0) return empty;

  function scaleAvg(qId: string): number {
    const vals = responses.map((r) => Number(r.answers[qId])).filter((n) => !isNaN(n));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  function sectionScaleAvg(qIds: string[]): number {
    const avgs = qIds.map(scaleAvg).filter((v) => v > 0);
    return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
  }

  const r = (v: number) => Math.round(v * 10) / 10;

  const allScaleQs = SURVEY_QUESTIONS.filter((q) => q.type === "scale");
  const allScaleAvgs = allScaleQs.map((q) => scaleAvg(q.id)).filter((v) => v > 0);
  const overallScore = allScaleAvgs.length ? allScaleAvgs.reduce((a, b) => a + b, 0) / allScaleAvgs.length : 0;

  // eNPS (q41)
  const npsVals = responses.map((r) => Number(r.answers.q41)).filter((n) => !isNaN(n) && n >= 0 && n <= 10);
  const promoters = npsVals.filter((v) => v >= 9).length;
  const passives = npsVals.filter((v) => v >= 7 && v <= 8).length;
  const detractors = npsVals.filter((v) => v <= 6).length;
  const enps = npsVals.length ? Math.round(((promoters - detractors) / npsVals.length) * 100) : 0;

  return {
    totalResponses: total,
    totalTokens,
    responseRate: totalTokens ? Math.round((total / totalTokens) * 100) : 0,
    overallScore: r(overallScore),
    happinessScore: r(scaleAvg("q42")),
    belongingScore: r(scaleAvg("q6")),
    purposeScore: r(scaleAvg("q5")),
    workLifeBalance: r(scaleAvg("q4")),
    leadershipScore: r(sectionScaleAvg(["q8", "q9", "q10", "q11", "q12"])),
    communicationScore: r(sectionScaleAvg(["q13", "q14", "q15", "q16", "q17"])),
    psychSafetyScore: r(scaleAvg("q17")),
    workloadScore: r(scaleAvg("q21")),
    careerClarityScore: r(sectionScaleAvg(["q24", "q25", "q26"])),
    remunerationFairnessScore: r(scaleAvg("q37")),
    enps,
    enpsPromoters: npsVals.length ? Math.round((promoters / npsVals.length) * 100) : 0,
    enpsPassives: npsVals.length ? Math.round((passives / npsVals.length) * 100) : 0,
    enpsDetractors: npsVals.length ? Math.round((detractors / npsVals.length) * 100) : 0,
    retentionScore: r(scaleAvg("q43")),
    prideScore: r(scaleAvg("q44")),
    brandAlignmentScore: r(scaleAvg("q46")),
  };
}

// ── Automated insights ──
export function generateInsights(
  overview: OverviewMetrics,
  sections: SectionAnalysis[],
  responses: SurveyResponse[]
): InsightItem[] {
  const insights: InsightItem[] = [];
  const r = (v: number) => Math.round(v * 10) / 10;

  const isStrong = (v: number) => v >= 4.0;
  const isOk = (v: number) => v >= 3.0 && v < 4.0;
  const isWeak = (v: number) => v < 3.0;

  // ══════════ POSITIVE ══════════

  if (overview.enps >= 50) {
    insights.push({ type: "positive", title: "eNPS excelente",
      description: `eNPS de ${overview.enps} (zona de excelência). ${overview.enpsPromoters}% promotores, ${overview.enpsDetractors}% detratores.`,
      metric: `${overview.enps}` });
  } else if (overview.enps >= 20) {
    insights.push({ type: "positive", title: "eNPS bom",
      description: `eNPS de ${overview.enps}. ${overview.enpsPromoters}% promotores, ${overview.enpsPassives}% neutros, ${overview.enpsDetractors}% detratores.`,
      metric: `${overview.enps}` });
  }

  if (isStrong(overview.belongingScore)) {
    insights.push({ type: "positive", title: "Forte senso de pertencimento",
      description: `Score ${r(overview.belongingScore)}/5. A equipe se sente parte da empresa.`,
      metric: `${r(overview.belongingScore)}/5`, sectionId: "clima" });
  }

  if (isStrong(overview.prideScore)) {
    insights.push({ type: "positive", title: "Orgulho em trabalhar na TBO",
      description: `Score ${r(overview.prideScore)}/5. Alto engajamento emocional.`,
      metric: `${r(overview.prideScore)}/5`, sectionId: "geral" });
  }

  if (isStrong(overview.happinessScore)) {
    insights.push({ type: "positive", title: "Índice de felicidade alto",
      description: `Score ${r(overview.happinessScore)}/5. Equipe majoritariamente satisfeita.`,
      metric: `${r(overview.happinessScore)}/5`, sectionId: "geral" });
  }

  if (isStrong(overview.retentionScore)) {
    insights.push({ type: "positive", title: "Intenção de permanência alta",
      description: `Score ${r(overview.retentionScore)}/5. A equipe se vê na TBO a longo prazo.`,
      metric: `${r(overview.retentionScore)}/5`, sectionId: "geral" });
  }

  if (isStrong(overview.psychSafetyScore)) {
    insights.push({ type: "positive", title: "Segurança psicológica sólida",
      description: `Score ${r(overview.psychSafetyScore)}/5. Equipe se sente segura para discordar e apontar problemas.`,
      metric: `${r(overview.psychSafetyScore)}/5`, sectionId: "comunicacao" });
  }

  if (isStrong(overview.purposeScore)) {
    insights.push({ type: "positive", title: "Trabalho com propósito",
      description: `Score ${r(overview.purposeScore)}/5. A equipe encontra significado no que faz.`,
      metric: `${r(overview.purposeScore)}/5`, sectionId: "clima" });
  }

  // ══════════ NEGATIVE / WARNING ══════════

  if (overview.enps < 0) {
    insights.push({ type: "negative", title: "eNPS negativo — alerta crítico",
      description: `eNPS de ${overview.enps}. Mais detratores (${overview.enpsDetractors}%) que promotores (${overview.enpsPromoters}%). Risco alto de turnover.`,
      metric: `${overview.enps}` });
  } else if (overview.enps >= 0 && overview.enps < 20) {
    insights.push({ type: "warning", title: "eNPS baixo",
      description: `eNPS de ${overview.enps}. Espaço significativo para melhoria.`,
      metric: `${overview.enps}` });
  }

  if (isWeak(overview.retentionScore)) {
    insights.push({ type: "negative", title: "Risco de turnover alto",
      description: `Score ${r(overview.retentionScore)}/5 em intenção de permanência. A equipe não se vê na TBO a médio prazo. Ação urgente.`,
      metric: `${r(overview.retentionScore)}/5`, sectionId: "geral" });
  } else if (isOk(overview.retentionScore)) {
    insights.push({ type: "warning", title: "Intenção de permanência mediana",
      description: `Score ${r(overview.retentionScore)}/5. Parte da equipe está incerta sobre continuar.`,
      metric: `${r(overview.retentionScore)}/5`, sectionId: "geral" });
  }

  if (isWeak(overview.psychSafetyScore)) {
    insights.push({ type: "negative", title: "Segurança psicológica baixa",
      description: `Score ${r(overview.psychSafetyScore)}/5. Equipe não se sente segura para discordar. Impacta inovação e retenção.`,
      metric: `${r(overview.psychSafetyScore)}/5`, sectionId: "comunicacao" });
  } else if (isOk(overview.psychSafetyScore)) {
    insights.push({ type: "warning", title: "Segurança psicológica precisa de atenção",
      description: `Score ${r(overview.psychSafetyScore)}/5. Há espaço para criar ambiente mais seguro para discordância.`,
      metric: `${r(overview.psychSafetyScore)}/5`, sectionId: "comunicacao" });
  }

  if (isWeak(overview.careerClarityScore)) {
    insights.push({ type: "negative", title: "Plano de carreira opaco",
      description: `Score ${r(overview.careerClarityScore)}/5. Precisa de career ladder documentado.`,
      metric: `${r(overview.careerClarityScore)}/5`, sectionId: "carreira" });
  } else if (isOk(overview.careerClarityScore)) {
    insights.push({ type: "warning", title: "Clareza de carreira mediana",
      description: `Score ${r(overview.careerClarityScore)}/5. Percepção de crescimento existe mas falta objetividade.`,
      metric: `${r(overview.careerClarityScore)}/5`, sectionId: "carreira" });
  }

  if (isWeak(overview.remunerationFairnessScore)) {
    insights.push({ type: "negative", title: "Remuneração percebida como injusta",
      description: `Score ${r(overview.remunerationFairnessScore)}/5. Risco de turnover se não endereçado.`,
      metric: `${r(overview.remunerationFairnessScore)}/5`, sectionId: "salarios" });
  } else if (isOk(overview.remunerationFairnessScore)) {
    insights.push({ type: "warning", title: "Remuneração divide opiniões",
      description: `Score ${r(overview.remunerationFairnessScore)}/5. Vale revisar política salarial.`,
      metric: `${r(overview.remunerationFairnessScore)}/5`, sectionId: "salarios" });
  }

  if (isWeak(overview.leadershipScore)) {
    insights.push({ type: "negative", title: "Liderança precisa de atenção urgente",
      description: `Score ${r(overview.leadershipScore)}/5. Demanda plano de ação imediato.`,
      metric: `${r(overview.leadershipScore)}/5`, sectionId: "lideranca" });
  } else if (isOk(overview.leadershipScore)) {
    insights.push({ type: "warning", title: "Liderança com espaço para melhoria",
      description: `Score ${r(overview.leadershipScore)}/5. Oportunidade de melhorar escuta e feedback.`,
      metric: `${r(overview.leadershipScore)}/5`, sectionId: "lideranca" });
  }

  if (isWeak(overview.communicationScore)) {
    insights.push({ type: "negative", title: "Comunicação interna fraca",
      description: `Score ${r(overview.communicationScore)}/5. Informação não flui entre áreas.`,
      metric: `${r(overview.communicationScore)}/5`, sectionId: "comunicacao" });
  }

  // Workload (aligned: 5=good, low=bad)
  if (isWeak(overview.workloadScore)) {
    insights.push({ type: "negative", title: "Sobrecarga crítica",
      description: `Score ${r(overview.workloadScore)}/5. Equipe não consegue entregar com qualidade sem comprometer saúde.`,
      metric: `${r(overview.workloadScore)}/5`, sectionId: "funcoes" });
  } else if (isOk(overview.workloadScore)) {
    insights.push({ type: "warning", title: "Carga de trabalho no limite",
      description: `Score ${r(overview.workloadScore)}/5. Parte da equipe relata dificuldade em manter qualidade.`,
      metric: `${r(overview.workloadScore)}/5`, sectionId: "funcoes" });
  }

  if (isWeak(overview.workLifeBalance)) {
    insights.push({ type: "negative", title: "Equilíbrio vida-trabalho comprometido",
      description: `Score ${r(overview.workLifeBalance)}/5. Trabalho invadindo vida pessoal da equipe.`,
      metric: `${r(overview.workLifeBalance)}/5`, sectionId: "clima" });
  }

  // ══════════ INFO ══════════

  // Compensation priority (q38)
  const q38 = SURVEY_QUESTIONS.find((q) => q.id === "q38");
  if (q38) {
    const stats = getQuestionStats(q38, responses);
    if (stats.type === "select" && stats.total > 0) {
      const top = Object.entries(stats.counts).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] > 0) {
        insights.push({ type: "info", title: "Prioridade #1 em compensação",
          description: `"${top[0]}" foi a opção mais votada (${Math.round((top[1] / stats.total) * 100)}%).`,
          sectionId: "salarios" });
      }
    }
  }

  // Market perception (q36)
  const q36 = SURVEY_QUESTIONS.find((q) => q.id === "q36");
  if (q36) {
    const stats = getQuestionStats(q36, responses);
    if (stats.type === "select" && stats.total > 0) {
      const abaixo = stats.counts["Abaixo do mercado"] ?? 0;
      if (abaixo / stats.total >= 0.4) {
        insights.push({ type: "warning", title: "Percepção salarial abaixo do mercado",
          description: `${Math.round((abaixo / stats.total) * 100)}% avalia que está abaixo do mercado.`,
          metric: `${Math.round((abaixo / stats.total) * 100)}%`, sectionId: "salarios" });
      }
    }
  }

  // Benefits requested (q39)
  const q39 = SURVEY_QUESTIONS.find((q) => q.id === "q39");
  if (q39) {
    const stats = getQuestionStats(q39, responses);
    if (stats.type === "text" && stats.answers.length > 0) {
      const keywords: Record<string, number> = {};
      const kw = ["plano de saúde", "saúde", "vale", "alimentação", "refeição", "gympass", "educação", "curso", "home office", "auxílio", "day off", "participação nos lucros"];
      stats.answers.forEach((a) => {
        const lower = a.toLowerCase();
        kw.forEach((k) => { if (lower.includes(k)) keywords[k] = (keywords[k] ?? 0) + 1; });
      });
      const topBenefits = Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (topBenefits.length > 0) {
        insights.push({ type: "info", title: "Benefícios mais solicitados",
          description: topBenefits.map(([k, v]) => `${k} (${v}x)`).join(", "),
          sectionId: "salarios" });
      }
    }
  }

  // Brand attributes (q45 multi-select)
  const q45 = SURVEY_QUESTIONS.find((q) => q.id === "q45");
  if (q45) {
    const stats = getQuestionStats(q45, responses);
    if (stats.type === "multi_select" && stats.total > 0) {
      const top3 = Object.entries(stats.counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (top3.length > 0) {
        insights.push({ type: "info", title: "Top 3 atributos da marca TBO",
          description: top3.map(([w, c]) => `${w} (${c}x)`).join(", "),
          sectionId: "geral" });
      }
      // Check if "Desorganizada" is in top 3
      const desorg = stats.counts["Desorganizada"] ?? 0;
      if (desorg > 0 && desorg / stats.total >= 0.3) {
        insights.push({ type: "warning", title: "Marca percebida como desorganizada",
          description: `${Math.round((desorg / stats.total) * 100)}% associou "Desorganizada" à marca TBO. Sinal de atenção operacional.`,
          metric: `${Math.round((desorg / stats.total) * 100)}%`, sectionId: "geral" });
      }
    }
  }

  // Section scores
  sections.forEach((s) => {
    if (s.avgScore !== null && s.avgScore < 3.0) {
      insights.push({ type: "negative",
        title: `Seção "${s.title}" abaixo da média`,
        description: `Score médio ${s.avgScore.toFixed(1)}/5. Requer plano de ação.`,
        metric: `${s.avgScore.toFixed(1)}/5`, sectionId: s.sectionId });
    }
  });

  // Response rate
  if (overview.responseRate < 70) {
    insights.push({ type: "warning", title: "Taxa de resposta baixa",
      description: `Apenas ${overview.responseRate}% respondeu.`,
      metric: `${overview.responseRate}%` });
  } else if (overview.responseRate >= 90) {
    insights.push({ type: "positive", title: "Excelente adesão",
      description: `${overview.responseRate}% de taxa de resposta.`,
      metric: `${overview.responseRate}%` });
  }

  return insights.sort((a, b) => {
    const order = { negative: 0, warning: 1, info: 2, positive: 3 };
    return order[a.type] - order[b.type];
  });
}
