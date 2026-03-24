"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { RBACGuard } from "@/components/shared/rbac-guard";
import {
  SURVEY_SECTIONS,
  SURVEY_QUESTIONS,
} from "@/features/pesquisa-clima/constants";
import {
  analyzeSections,
  computeOverview,
  generateInsights,
  getQuestionStats,
  type SurveyResponse,
  type InsightItem,
  type ScaleStats,
  type SelectStats,
  type MultiSelectStats,
  type OverviewMetrics,
} from "@/features/pesquisa-clima/analysis";
import {
  HISTORICAL_EDITIONS,
  TREND_METRICS,
  getMetricTrend,
  computeDelta,
  type HistoricalEdition,
} from "@/features/pesquisa-clima/historical-data";

// ── Types ──
interface Survey {
  id: string;
  title: string;
  edition: number;
  is_active: boolean;
  created_at: string;
}

interface TokenRow {
  email: string;
  token: string;
  used: boolean;
}

// ── TBO Team emails ──
const TBO_TEAM_EMAILS = [
  "marco@agenciatbo.com.br",
  "ruy@agenciatbo.com.br",
  "lucca@agenciatbo.com.br",
  "rafa@agenciatbo.com.br",
  "gustavo@agenciatbo.com.br",
  "celso@agenciatbo.com.br",
  "nelson@agenciatbo.com.br",
  "eduarda@agenciatbo.com.br",
  "mariane@agenciatbo.com.br",
  "lucio@agenciatbo.com.br",
];

// ── Score color helper ──
function scoreColor(score: number, max: number = 5): string {
  const pct = score / max;
  if (pct >= 0.8) return "text-emerald-600";
  if (pct >= 0.6) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number, max: number = 5): string {
  const pct = score / max;
  if (pct >= 0.8) return "bg-emerald-50 border-emerald-200";
  if (pct >= 0.6) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function insightIcon(type: InsightItem["type"]) {
  switch (type) {
    case "positive": return "text-emerald-600";
    case "negative": return "text-red-600";
    case "warning": return "text-amber-600";
    case "info": return "text-blue-600";
  }
}

function insightBg(type: InsightItem["type"]) {
  switch (type) {
    case "positive": return "bg-emerald-50 border-emerald-200";
    case "negative": return "bg-red-50 border-red-200";
    case "warning": return "bg-amber-50 border-amber-200";
    case "info": return "bg-blue-50 border-blue-200";
  }
}

function insightEmoji(type: InsightItem["type"]) {
  switch (type) {
    case "positive": return "+";
    case "negative": return "!";
    case "warning": return "?";
    case "info": return "i";
  }
}

// ── Bar chart component ──
function HorizontalBar({ label, value, max, color = "bg-primary/60" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground truncate max-w-[70%]">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Scale distribution mini chart ──
function ScaleDistribution({ stats }: { stats: ScaleStats }) {
  const maxCount = Math.max(...stats.distribution, 1);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(stats.avg)}`}>
          {stats.avg.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">/ 5</span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {stats.distribution.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-sm transition-all duration-500 ${
                i + 1 <= Math.round(stats.avg) ? "bg-primary/40" : "bg-muted"
              }`}
              style={{ height: `${(count / maxCount) * 40}px`, minHeight: count > 0 ? "4px" : "1px" }}
            />
            <span className="text-[9px] text-muted-foreground">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{stats.scaleMin}</span>
        <span>{stats.scaleMax}</span>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function PesquisaClimaPage() {
  return (
    <RBACGuard
      minRole="diretoria"
      fallback={
        <div className="p-6 text-center space-y-2">
          <h1 className="text-xl font-bold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            O dashboard da Pesquisa de Clima é restrito à diretoria e founders.
          </p>
        </div>
      }
    >
      <PesquisaClimaAdmin />
    </RBACGuard>
  );
}

function PesquisaClimaAdmin() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "detalhado" | "historico" | "links">("dashboard");
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("climate_surveys" as never)
        .select("*" as never)
        .order("created_at" as never, { ascending: false } as never) as unknown as { data: Survey[] | null };

      if (data?.length) {
        setSurveys(data);
        setSelectedSurvey(data[0].id);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSurveyData = useCallback(async (surveyId: string) => {
    const [tokensRes, responsesRes] = await Promise.all([
      supabase
        .from("climate_survey_tokens" as never)
        .select("email, token, used" as never)
        .eq("survey_id" as never, surveyId as never) as unknown as Promise<{ data: TokenRow[] | null }>,
      supabase
        .from("climate_survey_responses" as never)
        .select("*" as never)
        .eq("survey_id" as never, surveyId as never)
        .order("submitted_at" as never, { ascending: false } as never) as unknown as Promise<{ data: SurveyResponse[] | null }>,
    ]);
    setTokens(tokensRes.data ?? []);
    setResponses(responsesRes.data ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSurvey) loadSurveyData(selectedSurvey);
  }, [selectedSurvey, loadSurveyData]);

  // ── Computed analysis ──
  const overview = useMemo(() => computeOverview(responses, tokens.length), [responses, tokens.length]);
  const sections = useMemo(() => analyzeSections(responses), [responses]);
  const insights = useMemo(() => generateInsights(overview, sections, responses), [overview, sections, responses]);

  // ── Actions ──
  async function handleCreateSurvey() {
    setCreating(true);
    const edition = surveys.length + 1;
    const { data } = await supabase
      .from("climate_surveys" as never)
      .insert({ title: `${edition}ª Pesquisa de Clima — Agência TBO`, edition, is_active: true, sections: SURVEY_SECTIONS, questions: SURVEY_QUESTIONS } as never)
      .select("*" as never)
      .single() as unknown as { data: Survey | null };
    if (data) { setSurveys((prev) => [data, ...prev]); setSelectedSurvey(data.id); }
    setCreating(false);
  }

  async function handleGenerateTokens() {
    if (!selectedSurvey) return;
    setGenerating(true);
    const res = await fetch("/api/pesquisa-clima/generate-tokens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId: selectedSurvey, emails: TBO_TEAM_EMAILS }),
    });
    const data = await res.json();
    if (data.tokens) {
      setTokens(data.tokens.map((t: { email: string; token: string }) => ({ email: t.email, token: t.token, used: false })));
    }
    setGenerating(false);
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/pesquisa-clima/${token}`);
    setCopied(token); setTimeout(() => setCopied(null), 2000);
  }

  function copyAllLinks() {
    const links = tokens.map((t) => `${t.email}: ${window.location.origin}/pesquisa-clima/${t.token}`).join("\n");
    navigator.clipboard.writeText(links);
    setCopied("all"); setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesquisa de Clima</h1>
          <p className="text-sm text-muted-foreground">Dashboard analítico com insights automatizados.</p>
        </div>
        <div className="flex items-center gap-2">
          {surveys.length > 0 && (
            <select value={selectedSurvey ?? ""} onChange={(e) => setSelectedSurvey(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {surveys.map((s) => (<option key={s.id} value={s.id}>{s.title} {s.is_active ? "(Ativa)" : "(Encerrada)"}</option>))}
            </select>
          )}
          <button onClick={handleCreateSurvey} disabled={creating}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {creating ? "Criando..." : "+ Nova edição"}
          </button>
        </div>
      </div>

      {!selectedSurvey && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhuma pesquisa criada ainda.</p>
        </div>
      )}

      {selectedSurvey && responses.length > 0 && (
        <>
          {/* ════ KPI Cards ════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="text-xs text-muted-foreground font-medium">Respostas</div>
              <div className="text-2xl font-bold">{overview.totalResponses}/{overview.totalTokens}</div>
              <div className="text-xs text-muted-foreground">{overview.responseRate}% taxa de resposta</div>
            </div>
            <div className={`rounded-xl border p-4 space-y-1 ${scoreBg(overview.happinessScore)}`}>
              <div className="text-xs text-muted-foreground font-medium">Felicidade</div>
              <div className={`text-2xl font-bold ${scoreColor(overview.happinessScore)}`}>{overview.happinessScore}/5</div>
              <div className="text-xs text-muted-foreground">Média geral da equipe</div>
            </div>
            <div className={`rounded-xl border p-4 space-y-1 ${overview.enps >= 50 ? "bg-emerald-50 border-emerald-200" : overview.enps >= 0 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
              <div className="text-xs text-muted-foreground font-medium">eNPS</div>
              <div className={`text-2xl font-bold ${overview.enps >= 50 ? "text-emerald-600" : overview.enps >= 0 ? "text-amber-600" : "text-red-600"}`}>{overview.enps}</div>
              <div className="text-xs text-muted-foreground">{overview.enps >= 50 ? "Excelente" : overview.enps >= 0 ? "Bom" : "Crítico"} · {overview.enpsPromoters}% prom · {overview.enpsDetractors}% detr</div>
            </div>
            <div className={`rounded-xl border p-4 space-y-1 ${scoreBg(overview.overallScore)}`}>
              <div className="text-xs text-muted-foreground font-medium">Score Geral</div>
              <div className={`text-2xl font-bold ${scoreColor(overview.overallScore)}`}>{overview.overallScore}/5</div>
              <div className="text-xs text-muted-foreground">Média de todas as escalas</div>
            </div>
          </div>

          {/* ════ Secondary KPIs ════ */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Pertencimento", value: `${overview.belongingScore}/5`, good: overview.belongingScore >= 4.0 },
              { label: "Orgulho", value: `${overview.prideScore}/5`, good: overview.prideScore >= 4.0 },
              { label: "Permanência 12m", value: `${overview.retentionScore}/5`, good: overview.retentionScore >= 4.0 },
              { label: "Seg. psicológica", value: `${overview.psychSafetyScore}/5`, good: overview.psychSafetyScore >= 4.0 },
              { label: "Propósito", value: `${overview.purposeScore}/5`, good: overview.purposeScore >= 4.0 },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-border bg-card p-3 space-y-0.5">
                <div className="text-[11px] text-muted-foreground">{kpi.label}</div>
                <div className={`text-lg font-bold ${kpi.good ? "text-emerald-600" : "text-amber-600"}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* ════ Tertiary KPIs ════ */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Liderança", value: `${overview.leadershipScore}/5`, good: overview.leadershipScore >= 4.0 },
              { label: "Comunicação", value: `${overview.communicationScore}/5`, good: overview.communicationScore >= 4.0 },
              { label: "Carga de trabalho", value: `${overview.workloadScore}/5`, good: overview.workloadScore >= 4.0 },
              { label: "Clareza carreira", value: `${overview.careerClarityScore}/5`, good: overview.careerClarityScore >= 3.5 },
              { label: "Justiça salarial", value: `${overview.remunerationFairnessScore}/5`, good: overview.remunerationFairnessScore >= 3.5 },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-border bg-card p-3 space-y-0.5">
                <div className="text-[11px] text-muted-foreground">{kpi.label}</div>
                <div className={`text-lg font-bold ${kpi.good ? "text-emerald-600" : "text-amber-600"}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* ════ Tabs ════ */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["dashboard", "detalhado", "historico", "links"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "dashboard" ? "Dashboard" : t === "detalhado" ? "Detalhado" : t === "historico" ? "Histórico" : "Compartilhar"}
              </button>
            ))}
          </div>

          {/* ════ Tab: Dashboard ════ */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Insights automatizados */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Análise Automatizada</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {insights.map((insight, i) => (
                    <div key={i} className={`rounded-xl border p-4 space-y-1.5 ${insightBg(insight.type)}`}>
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${insightIcon(insight.type)} bg-white/80`}>
                          {insightEmoji(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{insight.title}</span>
                            {insight.metric && (
                              <span className={`text-xs font-bold ${insightIcon(insight.type)}`}>{insight.metric}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar de seções */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Score por Seção</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {sections.map((s) => (
                    <div key={s.sectionId}
                      className={`rounded-xl border p-4 space-y-2 cursor-pointer transition hover:shadow-sm ${
                        s.avgScore !== null ? scoreBg(s.avgScore) : "border-border bg-card"
                      }`}
                      onClick={() => { setTab("detalhado"); setExpandedSection(s.sectionId); }}>
                      <div className="text-xs text-muted-foreground font-medium truncate">{s.title}</div>
                      {s.avgScore !== null ? (
                        <div className={`text-2xl font-bold ${scoreColor(s.avgScore)}`}>{s.avgScore.toFixed(1)}/5</div>
                      ) : (
                        <div className="text-2xl font-bold text-muted-foreground">—</div>
                      )}
                      <div className="text-[10px] text-muted-foreground">{s.questions.length} perguntas</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equilíbrio de carga */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Equilíbrio de Carga de Trabalho</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="text-xs text-muted-foreground font-medium">Carga de trabalho</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              overview.workloadScore >= 4 ? "bg-emerald-500" : overview.workloadScore >= 3 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${(overview.workloadScore / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${scoreColor(overview.workloadScore)}`}>{overview.workloadScore}/5</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overview.workloadScore < 3
                        ? "Alerta: equipe não consegue entregar com qualidade sem comprometer saúde."
                        : overview.workloadScore < 4
                        ? "Atenção: parte da equipe relata carga no limite."
                        : "Carga equilibrada — equipe consegue entregar com qualidade."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="text-xs text-muted-foreground font-medium">Equilíbrio vida-trabalho</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              overview.workLifeBalance >= 4 ? "bg-emerald-500" : overview.workLifeBalance >= 3 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${(overview.workLifeBalance / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${scoreColor(overview.workLifeBalance)}`}>{overview.workLifeBalance}/5</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overview.workLifeBalance < 3
                        ? "Trabalho invadindo vida pessoal. Risco de burnout."
                        : overview.workLifeBalance < 4
                        ? "Equilíbrio frágil. Monitorar de perto."
                        : "Equilíbrio saudável entre vida pessoal e profissional."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Respostas abertas destacadas */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Destaques das Respostas Abertas</h2>
                <div className="space-y-4">
                  {[
                    { qId: "q48", title: "Sugestões para a diretoria" },
                    { qId: "q47", title: "Visão de futuro da TBO" },
                    { qId: "q23", title: "O que mudariam na rotina" },
                  ].map(({ qId, title }) => {
                    const q = SURVEY_QUESTIONS.find((q) => q.id === qId)!;
                    const stats = getQuestionStats(q, responses);
                    if (stats.type !== "text" || stats.answers.length === 0) return null;
                    return (
                      <div key={qId} className="rounded-xl border border-border bg-card p-4 space-y-2">
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {stats.answers.map((a, i) => (
                            <div key={i} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                              &ldquo;{a}&rdquo;
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ Tab: Detalhado ════ */}
          {tab === "detalhado" && (
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.sectionId} className="space-y-3">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.sectionId ? null : section.sectionId)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="text-base font-bold">{section.title}</h3>
                      {section.description && <p className="text-xs text-muted-foreground">{section.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {section.avgScore !== null && (
                        <span className={`text-sm font-bold ${scoreColor(section.avgScore)}`}>{section.avgScore.toFixed(1)}/5</span>
                      )}
                      <svg className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSection === section.sectionId ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedSection === section.sectionId && (
                    <div className="grid gap-3 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {section.questions.map(({ question, stats }) => (
                        <div key={question.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                          <p className="text-sm font-medium leading-snug">{question.label}</p>

                          {stats.type === "scale" && <ScaleDistribution stats={stats} />}

                          {stats.type === "select" && (
                            <div className="space-y-1.5">
                              {Object.entries((stats as SelectStats).counts).map(([opt, count]) => (
                                <HorizontalBar key={opt} label={opt} value={count} max={(stats as SelectStats).total}
                                  color={opt === "Sim" ? "bg-emerald-400" : opt === "Não" ? "bg-red-400" : "bg-amber-400"} />
                              ))}
                              <p className="text-[10px] text-muted-foreground pt-1">{(stats as SelectStats).total} respostas</p>
                            </div>
                          )}

                          {stats.type === "multi_select" && (
                            <div className="space-y-1.5">
                              {Object.entries((stats as MultiSelectStats).counts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([opt, count]) => (
                                  <HorizontalBar key={opt} label={opt} value={count} max={(stats as MultiSelectStats).total} color="bg-blue-400" />
                                ))}
                            </div>
                          )}

                          {stats.type === "text" && (
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {stats.answers.length > 0 ? (
                                stats.answers.map((a, i) => (
                                  <div key={i} className="rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">{a}</div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">Sem respostas.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ════ Tab: Histórico ════ */}
          {tab === "historico" && <HistoricoTab currentOverview={overview} />}

          {/* ════ Tab: Compartilhar ════ */}
          {tab === "links" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-base font-bold">Link da pesquisa</h3>
                <p className="text-sm text-muted-foreground">
                  Envie este link no grupo da equipe. Cada pessoa que clicar gera um token anônimo automaticamente.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-mono truncate">
                    {typeof window !== "undefined" ? `${window.location.origin}/pesquisa-clima` : "https://os.agenciatbo.com.br/pesquisa-clima"}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/pesquisa-clima`);
                      setCopied("link");
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                  >
                    {copied === "link" ? "Copiado!" : "Copiar link"}
                  </button>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
                  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs">
                    <strong>Anonimato garantido:</strong> nenhum e-mail ou dado pessoal é coletado. O token é gerado aleatoriamente sem vínculo com identidade.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Formulários iniciados</div>
                  <div className="text-2xl font-bold">{tokens.length}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Respostas recebidas</div>
                  <div className="text-2xl font-bold text-emerald-600">{responses.length}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedSurvey && responses.length === 0 && !loading && tab !== "historico" && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-4">
          <p className="text-muted-foreground">Nenhuma resposta recebida ainda.</p>
          <p className="text-xs text-muted-foreground">Gere os links na aba &quot;Compartilhar&quot; e envie para a equipe.</p>
          <button onClick={() => setTab("historico")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition">
            Ver edições anteriores
          </button>
        </div>
      )}

      {/* Histórico always accessible, even without current responses */}
      {selectedSurvey && responses.length === 0 && tab === "historico" && (
        <>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["historico", "links"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "historico" ? "Histórico" : "Compartilhar"}
              </button>
            ))}
          </div>
          <HistoricoTab currentOverview={null} />
        </>
      )}
    </div>
  );
}

// ── Histórico Tab Component ──
function HistoricoTab({ currentOverview }: { currentOverview: OverviewMetrics | null }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedEdition, setExpandedEdition] = useState<number | null>(null);

  const categories = [
    { key: "all", label: "Todos" },
    { key: "clima", label: "Clima" },
    { key: "lideranca", label: "Liderança" },
    { key: "carreira", label: "Carreira" },
    { key: "remuneracao", label: "Remuneração" },
  ];

  const filteredMetrics = selectedCategory === "all"
    ? TREND_METRICS
    : TREND_METRICS.filter((m) => m.category === selectedCategory);

  const allEditions = useMemo(() => {
    if (!currentOverview || currentOverview.totalResponses === 0) return HISTORICAL_EDITIONS;
    const current: HistoricalEdition = {
      edition: 4,
      label: "4ª Pesquisa",
      date: "Mar 2026",
      totalResponses: currentOverview.totalResponses,
      teamSize: currentOverview.totalTokens || currentOverview.totalResponses,
      felicidade: currentOverview.happinessScore,
      overallScore: currentOverview.overallScore,
      culturaClareza: 0,
      confortoEquipe: 0,
      diaAgradavel: 0,
      workLifeBalance: currentOverview.workLifeBalance,
      satisfacaoFuncoes: 0,
      planoCarreira: currentOverview.careerClarityScore,
      homeOffice: 0,
      workloadScore: currentOverview.workloadScore,
      leadershipScore: currentOverview.leadershipScore,
      communicationScore: currentOverview.communicationScore,
      careerClarityScore: currentOverview.careerClarityScore,
      pertencimento: currentOverview.belongingScore >= 4 ? 100 : currentOverview.belongingScore >= 3 ? 70 : 40,
      orgulho: currentOverview.prideScore >= 4 ? 100 : currentOverview.prideScore >= 3 ? 70 : 40,
      crescimento: 0,
      satisfRemuneracao: currentOverview.remunerationFairnessScore >= 4 ? 100 : currentOverview.remunerationFairnessScore >= 3 ? 50 : 20,
      salarioJusto: 0,
      distributions: { felicidade: [], culturaClareza: [], confortoEquipe: [], satisfacaoFuncoes: [], planoCarreira: [], workLifeBalance: [] },
      openResponses: { sugestoesDiretoria: [], pontosAtencao: [], futuroTBO: [], beneficiosFalta: [], cargosAlvo: [] },
    };
    return [...HISTORICAL_EDITIONS, current];
  }, [currentOverview]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Evolução das Pesquisas de Clima</h2>
        <p className="text-sm text-muted-foreground">
          Comparativo entre as {allEditions.length} edições ({allEditions[0].date} — {allEditions[allEditions.length - 1].date}).
        </p>
      </div>

      {/* Edition Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allEditions.map((e, i) => {
          const prev = i > 0 ? allEditions[i - 1] : null;
          const delta = prev ? computeDelta(e.felicidade, prev.felicidade) : null;
          return (
            <div key={e.edition} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{e.label}</span>
                <span className="text-[10px] text-muted-foreground">{e.date}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${scoreColor(e.felicidade)}`}>{e.felicidade}</span>
                <span className="text-xs text-muted-foreground">/5 felicidade</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{e.totalResponses} respostas</span>
                {delta && (
                  <span className={delta.direction === "up" ? "text-emerald-600 font-medium" : delta.direction === "down" ? "text-red-600 font-medium" : "text-muted-foreground"}>
                    {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "="} {delta.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button key={c.key} onClick={() => setSelectedCategory(c.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selectedCategory === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredMetrics.map((metric) => {
          const trend = getMetricTrend(metric.key, allEditions);
          const max = metric.max;
          const lastTwo = trend.filter((t) => t.value > 0);
          const lastDelta = lastTwo.length >= 2
            ? computeDelta(lastTwo[lastTwo.length - 1].value, lastTwo[lastTwo.length - 2].value)
            : null;

          return (
            <div key={metric.key} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{metric.label}</div>
                  <div className="text-[10px] text-muted-foreground">{metric.description}</div>
                </div>
                {lastDelta && lastDelta.direction !== "stable" && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    lastDelta.direction === "up" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {lastDelta.direction === "up" ? "↑" : "↓"} {lastDelta.label}{metric.format === "percent" ? "pp" : ""}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2 h-20">
                {trend.map((point, idx) => {
                  const val = point.value;
                  if (val === 0) return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-12 flex items-center justify-center">
                        <span className="text-[9px] text-muted-foreground">—</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{point.date}</span>
                    </div>
                  );
                  const pct = metric.format === "scale"
                    ? ((val - 1) / (max - 1)) * 100
                    : (val / max) * 100;
                  const isLast = idx === trend.length - 1;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-bold tabular-nums ${isLast ? scoreColor(val, max) : "text-muted-foreground"}`}>
                        {val}{metric.format === "percent" ? "%" : ""}
                      </span>
                      <div className="w-full bg-muted rounded-sm overflow-hidden" style={{ height: "48px" }}>
                        <div
                          className={`w-full rounded-sm transition-all duration-700 ${
                            isLast ? "bg-primary/60" : "bg-muted-foreground/20"
                          }`}
                          style={{ height: `${Math.max(pct, 5)}%`, marginTop: `${100 - Math.max(pct, 5)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-tight text-center">{point.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edition Detail Expanders */}
      <div className="space-y-3">
        <h3 className="text-base font-bold">Detalhes por Edição</h3>
        {[...allEditions].reverse().map((edition) => (
          <div key={edition.edition} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpandedEdition(expandedEdition === edition.edition ? null : edition.edition)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${scoreBg(edition.felicidade)}`}>
                  <span className={scoreColor(edition.felicidade)}>{edition.edition}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold">{edition.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{edition.date} · {edition.totalResponses} respostas</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${scoreColor(edition.overallScore)}`}>{edition.overallScore}/5</span>
                <svg className={`h-4 w-4 text-muted-foreground transition-transform ${expandedEdition === edition.edition ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedEdition === edition.edition && (
              <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Felicidade", value: edition.felicidade },
                    { label: "Equilíbrio vida-trabalho", value: edition.workLifeBalance },
                    { label: "Liderança", value: edition.leadershipScore },
                    { label: "Comunicação", value: edition.communicationScore },
                    { label: "Carreira", value: edition.careerClarityScore },
                    { label: "Carga trabalho", value: edition.workloadScore },
                    { label: "Home office", value: edition.homeOffice },
                    { label: "Score geral", value: edition.overallScore },
                  ].filter(m => m.value > 0).map((m) => (
                    <div key={m.label} className="rounded-lg border border-border p-2.5 space-y-0.5">
                      <div className="text-[10px] text-muted-foreground">{m.label}</div>
                      <div className={`text-base font-bold ${scoreColor(m.value)}`}>{m.value}/5</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Pertencimento", value: edition.pertencimento },
                    { label: "Orgulho", value: edition.orgulho },
                    { label: "Vê crescimento", value: edition.crescimento },
                    { label: "Satisf. remuneração", value: edition.satisfRemuneracao },
                  ].filter(m => m.value > 0).map((m) => (
                    <div key={m.label} className="rounded-lg border border-border p-2.5 space-y-0.5">
                      <div className="text-[10px] text-muted-foreground">{m.label}</div>
                      <div className={`text-base font-bold ${m.value >= 70 ? "text-emerald-600" : m.value >= 40 ? "text-amber-600" : "text-red-600"}`}>
                        {m.value}%
                      </div>
                    </div>
                  ))}
                </div>

                {edition.openResponses.sugestoesDiretoria.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sugestões para a Diretoria</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {edition.openResponses.sugestoesDiretoria.map((s, i) => (
                        <div key={i} className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {edition.openResponses.pontosAtencao.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pontos de Atenção</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {edition.openResponses.pontosAtencao.map((s, i) => (
                        <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {edition.openResponses.futuroTBO.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visão de Futuro da TBO</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {edition.openResponses.futuroTBO.map((s, i) => (
                        <div key={i} className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {edition.openResponses.beneficiosFalta.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Benefícios Solicitados</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {edition.openResponses.beneficiosFalta.map((b, i) => (
                        <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {edition.openResponses.cargosAlvo.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cargos Almejados</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {edition.openResponses.cargosAlvo.map((c, i) => (
                        <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
