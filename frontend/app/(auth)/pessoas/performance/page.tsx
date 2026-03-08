"use client";

import { useState, useMemo } from "react";
import { useProfiles } from "@/hooks/use-people";
import { usePeople } from "@/hooks/use-people";
import {
  usePerformanceSnapshots,
  computePerformanceKPIs,
} from "@/hooks/use-performance";
import {
  PerformanceKPICards,
  PerformanceTable,
  ScoreIndividualSheet,
  SkillScoreForm,
  ImpactComputeDialog,
  CultureComputeDialog,
} from "@/components/performance";
import { ErrorState, EmptyState } from "@/components/shared";
import { Button } from "@/components/tbo-ui/button";
import { Badge } from "@/components/tbo-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tbo-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tbo-ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tbo-ui/select";
import {
  currentPeriod,
  formatPeriodLabel,
  SCORE_BANDS,
  getScoreBand,
} from "@/lib/performance-constants";
import type { PerformanceSnapshotRow } from "@/services/performance";
import {
  TrendingUp,
  BarChart3,
  Users,
  Award,
  AlertTriangle,
  Calculator,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Generate last 6 months for period selector
// ---------------------------------------------------------------------------

function getRecentPeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PerformancePage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [detailSnapshot, setDetailSnapshot] = useState<PerformanceSnapshotRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [skillFormEmployeeId, setSkillFormEmployeeId] = useState<string | null>(null);
  const [impactDialogOpen, setImpactDialogOpen] = useState(false);
  const [cultureDialogOpen, setCultureDialogOpen] = useState(false);

  // Data
  const { data: profiles } = useProfiles();
  const { data: peopleResult } = usePeople();
  const {
    data: snapshots,
    isLoading,
    error,
    refetch,
  } = usePerformanceSnapshots(period);

  const periods = useMemo(() => getRecentPeriods(6), []);

  // Profile maps
  const profileMap = useMemo(
    () => new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])),
    [profiles]
  );
  const peopleData = useMemo(
    () =>
      new Map(
        (peopleResult?.data ?? []).map((p) => [
          p.id,
          { area: (p as Record<string, unknown>).bu as string | null, cargo: (p as Record<string, unknown>).cargo as string | null },
        ])
      ),
    [peopleResult]
  );

  function getName(id: string) {
    return profileMap.get(id) ?? "Desconhecido";
  }
  function getArea(id: string) {
    return peopleData.get(id)?.area ?? "";
  }
  function getCargo(id: string) {
    return peopleData.get(id)?.cargo ?? "";
  }

  // KPIs
  const kpis = useMemo(
    () => computePerformanceKPIs(snapshots ?? [], getName),
    [snapshots, profileMap]
  );

  // Band distribution for overview
  const bandDistribution = useMemo(() => {
    const dist = { elite: 0, high: 0, stable: 0, attention: 0 };
    for (const s of snapshots ?? []) {
      if (s.final_score == null) continue;
      const band = getScoreBand(s.final_score);
      dist[band.key]++;
    }
    return dist;
  }, [snapshots]);

  // Top performers
  const topPerformers = useMemo(() => {
    return [...(snapshots ?? [])]
      .filter((s) => s.final_score != null)
      .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))
      .slice(0, 5);
  }, [snapshots]);

  // Attention list
  const attentionList = useMemo(() => {
    return (snapshots ?? []).filter(
      (s) => s.final_score != null && s.final_score < 60
    );
  }, [snapshots]);

  // Handlers
  function handleSelectSnapshot(snapshot: PerformanceSnapshotRow) {
    setDetailSnapshot(snapshot);
    setDetailOpen(true);
  }

  function handleEditSkills(employeeId: string) {
    setSkillFormEmployeeId(employeeId);
    setSkillFormOpen(true);
    setDetailOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-gray-500">
            Scorecard TBO 2.0 — Avaliacao estrategica de performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImpactDialogOpen(true)}
          >
            <Calculator className="mr-1 h-3.5 w-3.5" />
            Calcular Impacto
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCultureDialogOpen(true)}
          >
            <Calculator className="mr-1 h-3.5 w-3.5" />
            Calcular Cultura
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  {formatPeriodLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <PerformanceKPICards kpis={kpis} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            Visao Geral
          </TabsTrigger>
          <TabsTrigger value="table">
            <Users className="mr-1 h-3.5 w-3.5" />
            Tabela
            {(snapshots ?? []).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {(snapshots ?? []).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Visao Geral Tab ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          {error ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg border bg-gray-100/40" />
              ))}
            </div>
          ) : (snapshots ?? []).length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Sem dados de performance"
              description="Avalie as skills dos colaboradores para gerar os snapshots de performance."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Band Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Distribuicao por Faixa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SCORE_BANDS.map((band) => {
                    const count = bandDistribution[band.key];
                    const total = (snapshots ?? []).filter(
                      (s) => s.final_score != null
                    ).length;
                    const pct = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={band.key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={band.textClass}>
                            {band.label} ({band.min}–{band.max})
                          </span>
                          <span className="font-medium">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: band.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Award className="h-4 w-4 text-amber-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPerformers.map((s, i) => {
                    const band = getScoreBand(s.final_score);
                    return (
                      <div
                        key={s.id}
                        className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-gray-100/50"
                        onClick={() => handleSelectSnapshot(s)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 w-4">
                            {i + 1}.
                          </span>
                          <span className="font-medium">
                            {getName(s.employee_id)}
                          </span>
                        </div>
                        <Badge
                          className={`${band.bgClass} ${band.textClass} border-0 text-[10px]`}
                        >
                          {s.final_score?.toFixed(1)}
                        </Badge>
                      </div>
                    );
                  })}
                  {topPerformers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum dado disponivel.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Attention List */}
              {attentionList.length > 0 && (
                <Card className="border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Pessoas em Atencao ({attentionList.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {attentionList.map((s) => (
                        <div
                          key={s.id}
                          className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-red-100/50 dark:hover:bg-red-950/40"
                          onClick={() => handleSelectSnapshot(s)}
                        >
                          <span>{getName(s.employee_id)}</span>
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-0 text-[10px]">
                            {s.final_score?.toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Tabela Tab ──────────────────────────────────────────── */}
        <TabsContent value="table">
          {error ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : (snapshots ?? []).length === 0 && !isLoading ? (
            <EmptyState
              icon={Users}
              title="Nenhum snapshot encontrado"
              description={`Nao ha dados de performance para ${formatPeriodLabel(period)}.`}
            />
          ) : (
            <PerformanceTable
              snapshots={snapshots ?? []}
              getName={getName}
              getArea={getArea}
              getCargo={getCargo}
              isLoading={isLoading}
              onSelect={handleSelectSnapshot}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Score Individual Sheet */}
      <ScoreIndividualSheet
        snapshot={detailSnapshot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        getName={getName}
        getArea={getArea}
        getCargo={getCargo}
        onEditSkills={handleEditSkills}
      />

      {/* Skill Score Form */}
      <SkillScoreForm
        open={skillFormOpen}
        onOpenChange={(open) => {
          setSkillFormOpen(open);
          if (!open) setSkillFormEmployeeId(null);
        }}
        employeeId={skillFormEmployeeId}
        employeeName={skillFormEmployeeId ? getName(skillFormEmployeeId) : ""}
        period={period}
      />

      {/* Impact Compute Dialog */}
      <ImpactComputeDialog
        open={impactDialogOpen}
        onOpenChange={setImpactDialogOpen}
        period={period}
        getName={getName}
      />

      {/* Culture Compute Dialog */}
      <CultureComputeDialog
        open={cultureDialogOpen}
        onOpenChange={setCultureDialogOpen}
        period={period}
      />
    </div>
  );
}
