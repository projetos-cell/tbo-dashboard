"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Sem carreira configurada
  if (!career?.career_level_id && !career?.nivel_atual) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-dashed p-4 text-center space-y-3"
        >
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
        </motion.div>

        {canEdit && (
          <SetCareerLevelDialog
            profileId={personId}
            personName={personName}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
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
              className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-orange-400"
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
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className={`h-full rounded-full ${getScoreBarColor(avgScore)}`}
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

      {/* Dialog — renderizado uma única vez */}
      {canEdit && (
        <SetCareerLevelDialog
          profileId={personId}
          personName={personName}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </motion.div>
  );
}
