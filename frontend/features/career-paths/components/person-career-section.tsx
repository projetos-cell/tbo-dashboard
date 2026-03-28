"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersonCareer } from "@/features/career-paths/hooks/use-career-paths";
import { getScoreBarColor } from "@/features/career-paths/utils/career-constants";
import { SetCareerLevelDialog } from "./set-career-level-dialog";
import { hasMinRole } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

interface PersonCareerSectionProps {
  personId: string;
  personName?: string;
}

export function PersonCareerSection({ personId, personName = "Membro" }: PersonCareerSectionProps) {
  const { data: career, isLoading } = usePersonCareer(personId);
  const role = useAuthStore((s) => s.role);
  const canEdit = hasMinRole(role, "lider");

  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  // Sem carreira configurada
  if (!career?.career_level_id && !career?.nivel_atual) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
        <div>
          <TrendingUp className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Trilha de carreira não configurada
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Pencil className="mr-1 h-3 w-3" />
            Definir nível
          </Button>
        )}
        {canEdit && (
          <SetCareerLevelDialog
            profileId={personId}
            personName={personName}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    );
  }

  const levelName = career.level?.name ?? career.nivel_atual ?? "—";
  const pathName = career.path?.name;
  const pathId = career.career_path_id;
  const competencies = career.level?.career_level_competencies ?? [];
  const avgScore =
    competencies.length > 0
      ? Math.round(competencies.reduce((s, c) => s + c.expected_score, 0) / competencies.length)
      : null;

  return (
    <div className="space-y-3">
      {/* Nível atual + ações */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {pathName && (
            <Badge variant="secondary" className="text-xs">
              {career.path?.icon} {pathName}
            </Badge>
          )}
          <Badge className="text-xs bg-orange-500 hover:bg-orange-600 text-white">
            {levelName}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setDialogOpen(true)}
              title="Editar nível de carreira"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {pathId && (
            <Link href={`/pessoas/carreira/${pathId}`}>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                Ver trilha <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Score médio esperado */}
      {avgScore !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Score médio esperado neste nível</span>
            <span className="font-semibold">{avgScore}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getScoreBarColor(avgScore)}`}
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid de competências esperadas */}
      {competencies.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {competencies.slice(0, 9).map((c) => (
            <div
              key={c.competency_key}
              className="rounded border bg-muted/40 px-2 py-1.5 text-center"
            >
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                {c.competency_name}
              </p>
              <p className="text-xs font-bold mt-0.5">{c.expected_score}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de edição */}
      {canEdit && (
        <SetCareerLevelDialog
          profileId={personId}
          personName={personName}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
