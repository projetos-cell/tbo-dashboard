"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import {
  IconRefresh,
  IconLoader2,
  IconAlertTriangle,
  IconCircleCheck,
  IconBriefcase,
  IconUsers,
  IconCurrencyDollar,
  IconBuildingStore,
  IconTarget,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useDataQualityScores, useRunDataQualityScan } from "../hooks/use-reports";
import type { DataQualityScore } from "../services/data-quality";

// ── Icons per module ──────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, React.ReactNode> = {
  projects: <IconBriefcase className="h-4 w-4" />,
  people: <IconUsers className="h-4 w-4" />,
  finance: <IconCurrencyDollar className="h-4 w-4" />,
  commercial: <IconBuildingStore className="h-4 w-4" />,
  okrs: <IconTarget className="h-4 w-4" />,
};

const MODULE_LABELS: Record<string, string> = {
  projects: "Projetos",
  people: "Pessoas",
  finance: "Financeiro",
  commercial: "Comercial",
  okrs: "OKRs",
  culture: "Cultura",
  contracts: "Contratos",
};

// ── Overall Gauge ─────────────────────────────────────────────────────────────

function OverallGauge({ pct }: { pct: number }) {
  const color =
    pct >= 85 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  const data = [{ name: "Qualidade", value: pct, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="70%"
            innerRadius="65%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" background cornerRadius={4} />
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "1.5rem", fontWeight: 700, fill: color }}
            >
              {pct.toFixed(0)}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm font-medium">Score Geral</p>
      <Badge
        variant="outline"
        className={
          pct >= 85
            ? "border-emerald-500 text-emerald-600"
            : pct >= 70
            ? "border-amber-500 text-amber-600"
            : "border-red-500 text-red-500"
        }
      >
        {pct >= 85 ? "Excelente" : pct >= 70 ? "Bom" : "Precisa Atenção"}
      </Badge>
    </div>
  );
}

// ── Module Card ───────────────────────────────────────────────────────────────

function ModuleQualityCard({ score }: { score: DataQualityScore }) {
  const pct = Number(score.completeness_pct ?? 0);
  const missing = (score.missing_critical ?? []) as Array<{
    field: string;
    label: string;
    missing_count: number;
  }>;

  const statusColor =
    pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-red-500";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-muted p-1.5">
              {MODULE_ICONS[score.module] ?? <IconBriefcase className="h-4 w-4" />}
            </div>
            <CardTitle className="text-sm">
              {MODULE_LABELS[score.module] ?? score.module}
            </CardTitle>
          </div>
          <span className={`text-lg font-bold ${statusColor}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} className="h-2" />

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{score.total_records.toLocaleString("pt-BR")} registros</span>
          <span>{score.total_fields.toLocaleString("pt-BR")} campos verificados</span>
        </div>

        {missing.length > 0 ? (
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <IconAlertTriangle className="h-3 w-3" />
              Campos críticos ausentes
            </p>
            <div className="space-y-1">
              {missing.slice(0, 4).map((m) => (
                <div key={m.field} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <Badge variant="destructive" className="text-xs">
                    {m.missing_count.toLocaleString("pt-BR")} sem preencher
                  </Badge>
                </div>
              ))}
              {missing.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{missing.length - 4} outros campos com dados ausentes
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <IconCircleCheck className="h-3.5 w-3.5" />
            Todos os campos críticos preenchidos
          </div>
        )}

        {score.computed_at && (
          <p className="text-xs text-muted-foreground">
            Última varredura: {new Date(score.computed_at).toLocaleString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DataQualityDashboard() {
  const { data: scores = [], isLoading } = useDataQualityScores();
  const scanMutation = useRunDataQualityScan();

  const handleScan = async () => {
    await scanMutation.mutateAsync();
    toast.success("Varredura concluída com sucesso.");
  };

  const overallPct =
    scores.length > 0
      ? scores.reduce((s, sc) => s + Number(sc.completeness_pct ?? 0), 0) / scores.length
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-28 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-8">
          {scores.length > 0 ? (
            <OverallGauge pct={overallPct} />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground">
              <p className="text-xs text-center px-4">Rode uma varredura para ver o score</p>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="font-semibold">Qualidade de Dados</h3>
            <p className="text-sm text-muted-foreground">
              {scores.length} módulos analisados
            </p>
            {scores.length > 0 && (
              <div className="space-y-1 pt-2">
                {scores.map((sc) => (
                  <div key={sc.module} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-muted-foreground">
                      {MODULE_LABELS[sc.module] ?? sc.module}
                    </span>
                    <Progress value={Number(sc.completeness_pct ?? 0)} className="h-1.5 w-24" />
                    <span
                      className={
                        Number(sc.completeness_pct) >= 85
                          ? "text-emerald-600"
                          : Number(sc.completeness_pct) >= 70
                          ? "text-amber-600"
                          : "text-red-500"
                      }
                    >
                      {Number(sc.completeness_pct ?? 0).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleScan}
          disabled={scanMutation.isPending}
          variant="outline"
        >
          {scanMutation.isPending ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconRefresh className="mr-2 h-4 w-4" />
          )}
          {scanMutation.isPending ? "Analisando..." : "Rodar Varredura"}
        </Button>
      </div>

      {/* Module cards */}
      {scores.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {scores.map((score) => (
            <ModuleQualityCard key={score.id} score={score} />
          ))}
        </div>
      )}

      {scores.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <IconAlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Nenhuma varredura realizada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em "Rodar Varredura" para analisar a qualidade dos dados de todos os módulos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
