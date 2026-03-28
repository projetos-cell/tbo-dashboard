"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CareerScorecard } from "./career-scorecard";
import { TRACK_TYPE_META } from "@/features/career-paths/utils/career-constants";
import type { CareerLevelWithCompetencies } from "@/features/career-paths/services/career-paths";

interface CareerLevelDetailSheetProps {
  level: CareerLevelWithCompetencies | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Scores reais da pessoa para comparação */
  actualScores?: Record<string, number>;
}

export function CareerLevelDetailSheet({
  level,
  open,
  onOpenChange,
  actualScores,
}: CareerLevelDetailSheetProps) {
  if (!level) return null;

  const hardComps = level.career_level_competencies.filter((c) => c.competency_type === "hard");
  const softComps = level.career_level_competencies.filter((c) => c.competency_type === "soft");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            {level.is_transition_point && (
              <Badge variant="outline" className="text-xs border-dashed">
                Ponto de Bifurcação
              </Badge>
            )}
          </div>
          <SheetTitle className="text-xl">{level.name}</SheetTitle>
          {level.description && (
            <SheetDescription>{level.description}</SheetDescription>
          )}
        </SheetHeader>

        {/* Resumo das competências */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {hardComps.length > 0
                  ? Math.round(hardComps.reduce((s, c) => s + c.expected_score, 0) / hardComps.length)
                  : "—"}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Média Hard Skills</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {softComps.length > 0
                  ? Math.round(softComps.reduce((s, c) => s + c.expected_score, 0) / softComps.length)
                  : "—"}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Média Soft Skills</p>
            </div>
          </div>

          {/* Scorecard */}
          {level.career_level_competencies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Competências Esperadas</h4>
              <CareerScorecard
                competencies={level.career_level_competencies}
                actualScores={actualScores}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
