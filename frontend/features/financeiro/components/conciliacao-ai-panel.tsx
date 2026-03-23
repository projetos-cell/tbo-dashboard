"use client";

// ── ConciliacaoAIPanel ────────────────────────────────────────────────────────
// Painel de análise AI para conciliação bancária. Aparece na seção "Sem Match"
// com botão "Analisar com AI" que busca matches inteligentes e categorização.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useApplyReconciliation } from "@/features/financeiro/hooks/use-reconciliation";
import {
  useAIAnalyze,
  useAICategorize,
  useAIAnomalies,
  useAISummary,
  type AIMatchSuggestion,
  type AICategorySuggestion,
  type AIAnomaly,
} from "@/features/financeiro/hooks/use-ai-reconciliation";
import type { BankTransaction } from "@/lib/supabase/types/bank-reconciliation";
import type { FinanceTransaction, FinanceCategory, FinanceCostCenter } from "@/features/financeiro/services/finance-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmt } from "@/features/financeiro/lib/formatters";
import { cn } from "@/lib/utils";
import {
  IconBrain,
  IconCheck,
  IconX,
  IconSparkles,
  IconTag,
  IconArrowRight,
  IconLoader2,
  IconInfoCircle,
  IconBuildingBank,
  IconAlertTriangle,
  IconShieldCheck,
  IconFileText,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";

// ── Confidence badge ────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tier = confidence >= 85 ? "alta" : confidence >= 50 ? "media" : "baixa";
  const colorMap = {
    alta: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    media: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    baixa: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const labelMap = { alta: "Alta", media: "Média", baixa: "Baixa" };

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full", colorMap[tier])}>
      {confidence}% · {labelMap[tier]}
    </span>
  );
}

// ── AI Match suggestion row ─────────────────────────────────────────────────

interface AIMatchRowProps {
  match: AIMatchSuggestion;
  bankTx: BankTransaction | undefined;
  financeTx: FinanceTransaction | undefined;
  onApprove: (match: AIMatchSuggestion) => void;
  onReject: (match: AIMatchSuggestion) => void;
  isApproving: boolean;
}

function AIMatchRow({ match, bankTx, financeTx, onApprove, onReject, isApproving }: AIMatchRowProps) {
  if (!bankTx || !financeTx) return null;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      {/* Bank tx */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <IconBuildingBank className="size-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs font-medium truncate">{bankTx.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={bankTx.type === "credit" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
            {bankTx.type === "credit" ? "+" : "-"}{fmt(bankTx.amount)}
          </span>
          <span>{new Date(bankTx.transaction_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      {/* Arrow + confidence */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
        <ConfidenceBadge confidence={match.confidence} />
        <IconArrowRight className="size-3.5 text-muted-foreground" />
      </div>

      {/* Finance tx */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate mb-1">{financeTx.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={financeTx.type === "receita" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
            {fmt(financeTx.amount)}
          </span>
          <span>{new Date(financeTx.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
          {financeTx.counterpart && <span>· {financeTx.counterpart}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 pt-1">
        <Button
          size="icon"
          variant="ghost"
          className="size-7 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          title="Aprovar match AI"
          disabled={isApproving}
          onClick={() => onApprove(match)}
        >
          <IconCheck className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          title="Rejeitar match AI"
          disabled={isApproving}
          onClick={() => onReject(match)}
        >
          <IconX className="size-3.5" />
        </Button>
      </div>

      {/* Reasoning tooltip */}
      <div className="shrink-0 pt-1" title={match.reasoning}>
        <IconInfoCircle className="size-3.5 text-muted-foreground cursor-help" />
      </div>
    </div>
  );
}

// ── AI Category suggestion row ──────────────────────────────────────────────

interface AICategoryRowProps {
  cat: AICategorySuggestion;
  bankTx: BankTransaction | undefined;
}

function AICategoryRow({ cat, bankTx }: AICategoryRowProps) {
  if (!bankTx) return null;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{bankTx.description}</p>
        <span className="text-xs text-muted-foreground">
          {bankTx.type === "credit" ? "+" : "-"}{fmt(bankTx.amount)}
        </span>
      </div>
      <IconArrowRight className="size-3.5 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-[10px]">
          <IconTag className="size-3 mr-1" />
          {cat.suggestedCategory}
        </Badge>
        {cat.suggestedCostCenter && (
          <Badge variant="secondary" className="text-[10px]">{cat.suggestedCostCenter}</Badge>
        )}
        <ConfidenceBadge confidence={cat.confidence} />
      </div>
    </div>
  );
}

// ── Anomaly row (F3) ────────────────────────────────────────────────────────

function AnomalyRow({ anomaly }: { anomaly: AIAnomaly }) {
  const severityConfig = {
    info: { icon: IconInfoCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
    alerta: { icon: IconAlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
    critico: { icon: IconAlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  };
  const cfg = severityConfig[anomaly.severity];
  const SeverityIcon = cfg.icon;

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", cfg.bg, cfg.border)}>
      <SeverityIcon className={cn("size-4 shrink-0 mt-0.5", cfg.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold">{anomaly.title}</span>
          <Badge variant="outline" className="text-[10px] uppercase">{anomaly.severity}</Badge>
          <Badge variant="secondary" className="text-[10px]">{anomaly.type}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{anomaly.description}</p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          Ação sugerida: {anomaly.suggestedAction}
        </p>
      </div>
    </div>
  );
}

// ── Health score gauge ──────────────────────────────────────────────────────

function HealthScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const bgColor = score >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30" : score >= 50 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30";
  const label = score >= 80 ? "Saudável" : score >= 50 ? "Atenção" : "Crítico";

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full", bgColor)}>
      <IconShieldCheck className={cn("size-4", color)} />
      <span className={cn("text-sm font-bold", color)}>{score}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Main panel ──────────────────────────────────────────────────────────────

interface ConciliacaoAIPanelProps {
  unmatchedBankTxs: BankTransaction[];
  availableFinanceTxs: FinanceTransaction[];
  categories: FinanceCategory[];
  costCenters: FinanceCostCenter[];
}

export function ConciliacaoAIPanel({
  unmatchedBankTxs,
  availableFinanceTxs,
  categories,
  costCenters,
}: ConciliacaoAIPanelProps) {
  const { toast } = useToast();
  const analyzeMutation = useAIAnalyze();
  const categorizeMutation = useAICategorize();
  const anomalyMutation = useAIAnomalies();
  const summaryMutation = useAISummary();
  const applyMutation = useApplyReconciliation();
  const [rejectedMatches, setRejectedMatches] = useState<Set<string>>(new Set());

  const matchResult = analyzeMutation.data;
  const catResult = categorizeMutation.data;
  const anomalyResult = anomalyMutation.data;
  const summaryResult = summaryMutation.data;
  const isAnalyzing = analyzeMutation.isPending;
  const isCategorizing = categorizeMutation.isPending;
  const isDetectingAnomalies = anomalyMutation.isPending;
  const isSummarizing = summaryMutation.isPending;

  // Bank tx lookup maps
  const bankTxMap = new Map(unmatchedBankTxs.map((tx) => [tx.id, tx]));
  const financeTxMap = new Map(availableFinanceTxs.map((tx) => [tx.id, tx]));

  function handleAnalyze() {
    analyzeMutation.mutate(
      { unmatchedBankTxs, availableFinanceTxs },
      {
        onError: (err) => toast({ title: "Erro na análise AI", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleCategorize() {
    categorizeMutation.mutate(
      { bankTxs: unmatchedBankTxs, categories, costCenters },
      {
        onError: (err) => toast({ title: "Erro na categorização AI", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleApproveMatch(match: AIMatchSuggestion) {
    applyMutation.mutate(
      { bankTxId: match.bankTxId, financeTxId: match.financeTxId, score: match.confidence, method: "manual" },
      {
        onSuccess: () => {
          toast({ title: "Conciliado via AI!", description: match.reasoning });
          setRejectedMatches((prev) => new Set([...prev, match.bankTxId]));
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleRejectMatch(match: AIMatchSuggestion) {
    setRejectedMatches((prev) => new Set([...prev, match.bankTxId]));
    toast({ title: "Match AI rejeitado" });
  }

  function handleAnomalies() {
    const totalCredit = unmatchedBankTxs.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const totalDebit = unmatchedBankTxs.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

    anomalyMutation.mutate(
      {
        bankTxs: unmatchedBankTxs,
        financeTxs: availableFinanceTxs,
        reconciledCount: 0,
        pendingCount: unmatchedBankTxs.length,
        totalCredit,
        totalDebit,
      },
      {
        onError: (err) => toast({ title: "Erro na detecção de anomalias", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleSummary() {
    const totalReceitas = availableFinanceTxs.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const totalDespesas = availableFinanceTxs.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const overdueList = availableFinanceTxs.filter((t) => t.status === "atrasado");

    // Top categories by amount
    const catTotals = new Map<string, number>();
    for (const tx of availableFinanceTxs.filter((t) => t.type === "despesa")) {
      const key = tx.category_id ?? "Sem categoria";
      catTotals.set(key, (catTotals.get(key) ?? 0) + tx.amount);
    }
    const topCategories = [...catTotals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Top counterparts
    const cpTotals = new Map<string, number>();
    for (const tx of availableFinanceTxs.filter((t) => t.counterpart)) {
      const key = tx.counterpart!;
      cpTotals.set(key, (cpTotals.get(key) ?? 0) + tx.amount);
    }
    const topCounterparts = [...cpTotals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const now = new Date();
    const periodLabel = `${now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}`;

    summaryMutation.mutate(
      {
        periodLabel,
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        reconciledPct: 0,
        pendingCount: unmatchedBankTxs.length,
        overdueCount: overdueList.length,
        overdueAmount: overdueList.reduce((s, t) => s + t.amount, 0),
        topCategories,
        topCounterparts,
        recentTxs: availableFinanceTxs.slice(0, 10).map((t) => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.date,
        })),
      },
      {
        onError: (err) => toast({ title: "Erro no resumo AI", description: err.message, variant: "destructive" }),
      }
    );
  }

  const visibleMatches = matchResult?.matches.filter((m) => !rejectedMatches.has(m.bankTxId)) ?? [];

  if (unmatchedBankTxs.length === 0) return null;

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-background dark:from-violet-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconBrain className="size-4 text-violet-600" />
            Agente AI — Analista Financeiro
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-950/30"
              onClick={handleSummary}
              disabled={isSummarizing || availableFinanceTxs.length === 0}
            >
              {isSummarizing ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconFileText className="size-3.5" />}
              Resumo
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-950/30"
              onClick={handleAnomalies}
              disabled={isDetectingAnomalies || unmatchedBankTxs.length === 0}
            >
              {isDetectingAnomalies ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconAlertTriangle className="size-3.5" />}
              Anomalias
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-950/30"
              onClick={handleCategorize}
              disabled={isCategorizing || unmatchedBankTxs.length === 0}
            >
              {isCategorizing ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconTag className="size-3.5" />}
              Categorizar
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleAnalyze}
              disabled={isAnalyzing || unmatchedBankTxs.length === 0}
            >
              {isAnalyzing ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconSparkles className="size-3.5" />}
              {isAnalyzing ? "Analisando..." : `Analisar ${unmatchedBankTxs.length}`}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Análise semântica de transações sem correspondência usando inteligência artificial.
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Loading state */}
        {(isAnalyzing || isCategorizing) && (
          <div className="space-y-2 py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="flex-1 h-12 rounded-lg" />
                <Skeleton className="w-12 h-6 rounded-full" />
                <Skeleton className="flex-1 h-12 rounded-lg" />
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground animate-pulse mt-2">
              {isAnalyzing ? "Buscando correspondências inteligentes..." : "Categorizando transações..."}
            </p>
          </div>
        )}

        {/* Error state */}
        {analyzeMutation.isError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30 p-3 text-sm">
            <IconInfoCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">{analyzeMutation.error.message}</p>
            <Button size="sm" variant="ghost" className="h-6 text-xs ml-auto" onClick={handleAnalyze}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Match results */}
        {visibleMatches.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
              <IconSparkles className="size-3.5 text-violet-500" />
              <span className="text-xs font-semibold">Matches Encontrados pela AI</span>
              <Badge variant="secondary" className="text-[10px]">{visibleMatches.length}</Badge>
              {matchResult?.cached && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">cache</Badge>
              )}
            </div>
            <div className="rounded-lg border bg-card/50 px-3">
              {visibleMatches.map((match) => (
                <AIMatchRow
                  key={`${match.bankTxId}-${match.financeTxId}`}
                  match={match}
                  bankTx={bankTxMap.get(match.bankTxId)}
                  financeTx={financeTxMap.get(match.financeTxId)}
                  onApprove={handleApproveMatch}
                  onReject={handleRejectMatch}
                  isApproving={applyMutation.isPending}
                />
              ))}
            </div>
            {matchResult?.insights && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                <IconBrain className="size-3 inline mr-1" />
                {matchResult.insights}
              </p>
            )}
          </div>
        )}

        {/* No matches found (after analysis) */}
        {matchResult && visibleMatches.length === 0 && !isAnalyzing && (
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <IconInfoCircle className="size-3.5" />
            {matchResult.insights ?? "Nenhum match adicional encontrado pela AI."}
          </div>
        )}

        {/* Categorization results */}
        {catResult && catResult.categorizations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <IconTag className="size-3.5 text-violet-500" />
              <span className="text-xs font-semibold">Categorização AI</span>
              <Badge variant="secondary" className="text-[10px]">{catResult.categorizations.length}</Badge>
            </div>
            <div className="rounded-lg border bg-card/50 px-3">
              {catResult.categorizations.map((cat) => (
                <AICategoryRow
                  key={cat.bankTxId}
                  cat={cat}
                  bankTx={bankTxMap.get(cat.bankTxId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Anomaly results (F3) */}
        {anomalyResult && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="size-3.5 text-violet-500" />
                <span className="text-xs font-semibold">Detecção de Anomalias</span>
                <Badge variant="secondary" className="text-[10px]">{anomalyResult.anomalies.length}</Badge>
              </div>
              <HealthScoreGauge score={anomalyResult.healthScore} />
            </div>
            {anomalyResult.anomalies.length > 0 ? (
              <div className="space-y-2">
                {anomalyResult.anomalies.map((anomaly) => (
                  <AnomalyRow key={anomaly.id} anomaly={anomaly} />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                <IconShieldCheck className="size-3.5 text-emerald-500" />
                Nenhuma anomalia detectada. Transações parecem consistentes.
              </div>
            )}
            {anomalyResult.summary && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                <IconBrain className="size-3 inline mr-1" />
                {anomalyResult.summary}
              </p>
            )}
          </div>
        )}

        {/* Summary results (F5) */}
        {summaryResult && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <IconFileText className="size-3.5 text-violet-500" />
              <span className="text-xs font-semibold">Diagnóstico Financeiro</span>
            </div>

            {/* Narrative */}
            <div className="rounded-lg border bg-card/50 p-4">
              <p className="text-sm leading-relaxed">{summaryResult.diagnostico}</p>
            </div>

            {/* Highlights */}
            {summaryResult.destaques.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {summaryResult.destaques.map((d, i) => {
                  const destaqueIcon = d.tipo === "positivo" ? IconTrendingUp : d.tipo === "risco" ? IconTrendingDown : IconAlertTriangle;
                  const DestaqueIcon = destaqueIcon;
                  const destaqueColor = d.tipo === "positivo" ? "text-emerald-600" : d.tipo === "risco" ? "text-red-600" : "text-amber-600";
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <DestaqueIcon className={cn("size-3.5 shrink-0 mt-0.5", destaqueColor)} />
                      <span>{d.texto}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            {summaryResult.acoes.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações Recomendadas</span>
                <ul className="mt-1.5 space-y-1">
                  {summaryResult.acoes.map((acao, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <span className="text-violet-500 font-bold shrink-0">{i + 1}.</span>
                      {acao}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* KPI strip */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
              <span>Margem: <strong className={summaryResult.metricas.margemPct >= 0 ? "text-emerald-600" : "text-red-600"}>{summaryResult.metricas.margemPct.toFixed(1)}%</strong></span>
              <span>Conciliação: <strong>{summaryResult.metricas.conciliacaoPct.toFixed(0)}%</strong></span>
              <span>Inadimplência: <strong className={summaryResult.metricas.inadimplenciaPct > 10 ? "text-red-600" : ""}>{summaryResult.metricas.inadimplenciaPct.toFixed(1)}%</strong></span>
            </div>
          </div>
        )}

        {/* Loading states for new features */}
        {(isDetectingAnomalies || isSummarizing) && (
          <div className="space-y-2 py-4 mt-2">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              {isDetectingAnomalies ? "Detectando anomalias financeiras..." : "Gerando diagnóstico financeiro..."}
            </p>
          </div>
        )}

        {/* Meta info */}
        {(matchResult?.meta ?? anomalyResult?.meta ?? summaryResult?.meta) && (
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            {(() => {
              const meta = matchResult?.meta ?? anomalyResult?.meta ?? summaryResult?.meta;
              if (!meta) return null;
              return (
                <>
                  <span>Modelo: {meta.model}</span>
                  <span>·</span>
                  <span>Tokens: {meta.tokensUsed}</span>
                  <span>·</span>
                  <span>Latência: {meta.latencyMs}ms</span>
                </>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
