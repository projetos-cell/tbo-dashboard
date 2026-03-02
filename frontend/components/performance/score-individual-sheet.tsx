"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge, TrendIndicator } from "./score-badge";
import { SkillRadar } from "./skill-radar";
import { SkillTable } from "./skill-table";
import { ImpactBreakdown } from "./impact-breakdown";
import { CultureBreakdown } from "./culture-breakdown";
import {
  getScoreBand,
  SCORE_BANDS,
  formatPeriodLabel,
} from "@/lib/performance-constants";
import { useSkillScores, useEmployeeSnapshots } from "@/hooks/use-performance";
import type { PerformanceSnapshotRow } from "@/services/performance";
import { Pencil, TrendingUp, Target, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// Score Individual Sheet — detail drawer per employee
// ---------------------------------------------------------------------------

interface ScoreIndividualSheetProps {
  snapshot: PerformanceSnapshotRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getName: (id: string) => string;
  getArea: (id: string) => string;
  getCargo: (id: string) => string;
  onEditSkills?: (employeeId: string) => void;
}

export function ScoreIndividualSheet({
  snapshot,
  open,
  onOpenChange,
  getName,
  getArea,
  getCargo,
  onEditSkills,
}: ScoreIndividualSheetProps) {
  const employeeId = snapshot?.employee_id;

  const { data: skillScores } = useSkillScores(employeeId, snapshot?.period);
  const { data: history } = useEmployeeSnapshots(employeeId);

  const band = getScoreBand(snapshot?.final_score);

  // Gap to next band
  const nextBand = useMemo(() => {
    if (!snapshot?.final_score) return null;
    const score = snapshot.final_score;
    // Find the first band above current
    const sorted = [...SCORE_BANDS].sort((a, b) => a.min - b.min);
    for (const b of sorted) {
      if (b.min > score) {
        return { label: b.label, gap: Math.ceil(b.min - score) };
      }
    }
    return null;
  }, [snapshot?.final_score]);

  // Alerts
  const alerts = useMemo(() => {
    const result: string[] = [];
    if (snapshot?.final_score != null && snapshot.final_score < 60) {
      result.push("Score abaixo do limiar estavel (60)");
    }
    if (snapshot?.trend === "down") {
      result.push("Tendencia de queda no periodo");
    }
    if (skillScores) {
      const gaps = skillScores.filter(
        (s) => s.level_percentage < s.expected_level
      );
      if (gaps.length >= 3) {
        result.push(`${gaps.length} habilidades abaixo do esperado`);
      }
    }
    return result;
  }, [snapshot, skillScores]);

  if (!snapshot) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span>{getName(snapshot.employee_id)}</span>
            <ScoreBadge score={snapshot.final_score} showLabel size="md" />
          </SheetTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getArea(snapshot.employee_id)}</span>
            {getCargo(snapshot.employee_id) && (
              <>
                <span>·</span>
                <span>{getCargo(snapshot.employee_id)}</span>
              </>
            )}
            <span>·</span>
            <span>{formatPeriodLabel(snapshot.period)}</span>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Skill (35%)</p>
                <p className="text-lg font-bold">
                  {snapshot.skill_score?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Impact (45%)</p>
                <p className="text-lg font-bold">
                  {snapshot.impact_score?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Culture (20%)</p>
                <p className="text-lg font-bold">
                  {snapshot.culture_score?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend + Gap */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tendencia:</span>
              <TrendIndicator trend={snapshot.trend} />
            </div>
            {nextBand && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Faltam <span className="font-semibold">{nextBand.gap} pts</span> para{" "}
                  {nextBand.label}
                </span>
              </div>
            )}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardContent className="p-3 space-y-1">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {a}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Skill Radar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Radar de Skills</CardTitle>
                {onEditSkills && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSkills(snapshot.employee_id)}
                  >
                    <Pencil className="mr-1 h-3 w-3" /> Avaliar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <SkillRadar scores={skillScores ?? []} />
            </CardContent>
          </Card>

          {/* Skill Detail Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Detalhamento de Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillTable scores={skillScores ?? []} />
            </CardContent>
          </Card>

          {/* Impact Breakdown */}
          <ImpactBreakdown
            employeeId={snapshot.employee_id}
            employeeName={getName(snapshot.employee_id)}
            period={snapshot.period}
          />

          {/* Culture Breakdown */}
          <CultureBreakdown
            employeeId={snapshot.employee_id}
            employeeName={getName(snapshot.employee_id)}
            period={snapshot.period}
          />

          {/* History */}
          {history && history.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Historico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <span className="text-muted-foreground">
                        {formatPeriodLabel(h.period)}
                      </span>
                      <div className="flex items-center gap-2">
                        <ScoreBadge score={h.final_score} />
                        <TrendIndicator trend={h.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
