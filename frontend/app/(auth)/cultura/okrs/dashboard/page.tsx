"use client";

import { useMemo, useState } from "react";
import {
  IconChartBar,
  IconTarget,
  IconTrendingUp,
  IconAlertTriangle,
  IconCircleCheck,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { OkrCycleSelector } from "@/features/okrs/components/okr-cycle-selector";
import { OkrCycleDialog } from "@/features/okrs/components/okr-cycle-dialog";
import {
  useCycles,
  useActiveCycle,
  useObjectives,
} from "@/features/okrs/hooks/use-okrs";
import { computeOkrKPIs } from "@/features/okrs/services/okrs";

// ── helpers ──────────────────────────────────────────────────────────

function statusBadge(status: string | null) {
  const map: Record<string, { label: string; color: string }> = {
    on_track: { label: "No caminho", color: "text-green-600 border-green-300 bg-green-50" },
    at_risk: { label: "Em risco", color: "text-amber-600 border-amber-300 bg-amber-50" },
    behind: { label: "Atrasado", color: "text-red-600 border-red-300 bg-red-50" },
    attention: { label: "Atenção", color: "text-orange-600 border-orange-300 bg-orange-50" },
    completed: { label: "Concluído", color: "text-blue-600 border-blue-300 bg-blue-50" },
    paused: { label: "Pausado", color: "text-gray-500 border-gray-300 bg-gray-50" },
  };
  const s = map[status ?? ""] ?? { label: status ?? "—", color: "text-gray-500 border-gray-200" };
  return (
    <Badge variant="outline" className={`text-xs ${s.color}`}>
      {s.label}
    </Badge>
  );
}

function levelLabel(level: string | null): string {
  const map: Record<string, string> = {
    company: "Empresa",
    team: "Equipe",
    individual: "Individual",
  };
  return map[level ?? ""] ?? (level ?? "—");
}

// ── Progress bar ─────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600 w-8 text-right font-medium">{pct}%</span>
    </div>
  );
}

// ── Dashboard content ─────────────────────────────────────────────────

function DashboardContent() {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [cycleDialog, setCycleDialog] = useState(false);
  const { data: cycles, isLoading: loadingCycles, error: cyclesError, refetch } = useCycles();
  const { data: activeCycle } = useActiveCycle();

  const effectiveCycleId = selectedCycleId ?? activeCycle?.id ?? null;

  const { data: objectives, isLoading: loadingObjs, error: objsError } = useObjectives({
    cycleId: effectiveCycleId ?? undefined,
  });

  const kpis = useMemo(() => computeOkrKPIs(objectives ?? []), [objectives]);

  const byLevel = useMemo(() => {
    if (!objectives) return {};
    return objectives.reduce<Record<string, typeof objectives>>((acc, obj) => {
      const key = obj.level ?? "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
      return acc;
    }, {});
  }, [objectives]);

  const levelOrder = ["company", "team", "individual"];

  if (loadingCycles || loadingObjs) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (cyclesError) return <ErrorState message={cyclesError.message} onRetry={() => refetch()} />;
  if (objsError) return <ErrorState message={objsError.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconChartBar className="h-6 w-6" />
            Dashboard OKRs
          </h1>
          <p className="text-gray-500 text-sm">Visão consolidada de objetivos e progresso</p>
        </div>
        <OkrCycleSelector
          cycles={cycles ?? []}
          selectedId={effectiveCycleId}
          onSelect={setSelectedCycleId}
          onCreateCycle={() => setCycleDialog(true)}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IconTarget className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-gray-500">Objetivos</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IconTrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-gray-500">Progresso Médio</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{Math.round(kpis.avgProgress)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IconCircleCheck className="h-4 w-4 text-green-500" />
              <p className="text-xs text-gray-500">No Caminho</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{kpis.onTrack}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IconAlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-gray-500">Em Risco / Atenção</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{kpis.atRisk + kpis.attention}</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {(!objectives || objectives.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <IconTarget className="h-12 w-12 text-gray-400/40" />
            <div>
              <p className="font-medium text-gray-700">Nenhum objetivo encontrado neste ciclo.</p>
              <p className="text-sm text-gray-500 mt-1">
                {cycles && cycles.length === 0
                  ? "Crie um ciclo para começar a acompanhar seus OKRs."
                  : "Adicione objetivos ao ciclo selecionado para ver o progresso aqui."}
              </p>
            </div>
            <div className="flex gap-2">
              {cycles && cycles.length === 0 && (
                <Button size="sm" onClick={() => setCycleDialog(true)} className="gap-1.5">
                  <IconPlus className="h-4 w-4" />
                  Criar primeiro ciclo
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <a href="/cultura/okrs">Ver todos os OKRs</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objectives por level */}
      {[...levelOrder, ...Object.keys(byLevel).filter((k) => !levelOrder.includes(k))].map(
        (level) => {
          const objs = byLevel[level];
          if (!objs || objs.length === 0) return null;
          return (
            <Card key={level}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <IconMinus className="h-4 w-4 text-gray-400" />
                  {levelLabel(level)}
                  <Badge variant="secondary" className="text-xs ml-1">
                    {objs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {objs.map((obj) => (
                  <div key={obj.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{obj.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {statusBadge(obj.status)}
                      </div>
                    </div>
                    <ProgressBar value={obj.progress ?? 0} />
                    {obj.description && (
                      <p className="text-xs text-gray-400 truncate">{obj.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        }
      )}

      <OkrCycleDialog
        open={cycleDialog}
        onClose={() => setCycleDialog(false)}
        cycle={null}
      />
    </div>
  );
}

export default function OKRsDashboardPage() {
  return (
    <RequireRole minRole="colaborador">
      <DashboardContent />
    </RequireRole>
  );
}
