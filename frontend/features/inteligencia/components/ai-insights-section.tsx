"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBrain, IconSparkles, IconRefresh } from "@tabler/icons-react";
import { useAiInsights, useGenerateInsights } from "@/hooks/use-intelligence";
import { ErrorState, EmptyState } from "@/components/shared";
import { toast } from "sonner";
import type { AiInsight } from "@/services/intelligence";

const INSIGHT_TYPE_LABEL: Record<string, string> = {
  opportunity: "Oportunidade",
  risk: "Risco",
  pattern: "Padrão",
  recommendation: "Recomendação",
  anomaly: "Anomalia",
};

const CATEGORY_COLOR: Record<string, string> = {
  financeiro: "bg-green-500/10 text-green-600",
  comercial: "bg-blue-500/10 text-blue-600",
  pessoas: "bg-purple-500/10 text-purple-600",
  projetos: "bg-orange-500/10 text-orange-600",
  okrs: "bg-yellow-500/10 text-yellow-600",
};

function InsightCard({ insight }: { insight: AiInsight }) {
  const typeLabel =
    INSIGHT_TYPE_LABEL[insight.insight_type ?? ""] ?? insight.insight_type;
  const categoryClass =
    CATEGORY_COLOR[insight.category?.toLowerCase() ?? ""] ??
    "bg-slate-500/10 text-slate-600";
  const confidencePct = insight.confidence != null
    ? Math.round(insight.confidence * 100)
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{insight.title}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          {insight.category && (
            <Badge variant="secondary" className={`text-xs ${categoryClass}`}>
              {insight.category}
            </Badge>
          )}
          {typeLabel && (
            <Badge variant="outline" className="text-xs">
              {typeLabel}
            </Badge>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {insight.description}
      </p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {insight.agent_name}
          {insight.source_bu ? ` · ${insight.source_bu}` : ""}
        </span>
        {confidencePct != null && (
          <span
            className={`text-xs font-medium ${
              confidencePct >= 80
                ? "text-green-600"
                : confidencePct >= 60
                ? "text-yellow-600"
                : "text-muted-foreground"
            }`}
          >
            {confidencePct}% confiança
          </span>
        )}
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function AiInsightsSection() {
  const { data: insights, isLoading, error, refetch } = useAiInsights();
  const { mutate: generate, isPending: isGenerating } = useGenerateInsights();

  function handleGenerate() {
    generate(undefined, {
      onSuccess: (data) => {
        const count = (data as { count?: number }).count ?? 0;
        toast.success(`${count} insight${count !== 1 ? "s" : ""} gerado${count !== 1 ? "s" : ""} com sucesso`);
      },
      onError: (err: Error) => {
        toast.error(err.message ?? "Erro ao gerar insights");
      },
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <IconBrain className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-base">Insights com IA</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Padrões e recomendações identificados pelos agentes
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="shrink-0"
          >
            <IconRefresh className={`mr-1.5 h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Analisando..." : "Gerar Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <InsightsSkeleton />}

        {error && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}

        {!isLoading && !error && (!insights || insights.length === 0) && (
          <EmptyState
            icon={IconSparkles}
            title="Nenhum insight disponível"
            description='Clique em "Gerar Insights" para analisar os dados do sistema e obter recomendações estratégicas.'
          />
        )}

        {!isLoading && !error && insights && insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
