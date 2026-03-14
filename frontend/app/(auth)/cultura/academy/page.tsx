"use client";

import { useState, useCallback } from "react";
import {
  IconSchool,
  IconCheck,
  IconLock,
  IconClock,
  IconArrowRight,
  IconBookmark,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TBO_ACADEMY_MODULES,
  type AcademyModule,
} from "@/features/cultura/data/cultura-notion-seed";
import { AcademyModuleSheet } from "@/features/cultura/components/academy-module-sheet";
import {
  useAcademyProgress,
  useMarkModuleComplete,
} from "@/features/cultura/hooks/use-academy";

const SECTION_TYPE_ICONS: Record<string, string> = {
  read: "📖",
  quiz: "❓",
  reflection: "💭",
  action: "🎯",
};

const TOTAL_ESTIMATED_MINUTES = TBO_ACADEMY_MODULES.reduce(
  (acc, m) => acc + m.estimatedMinutes,
  0
);

function ModuleCard({
  mod,
  isCompleted,
  isLocked,
  isExpanded,
  isCompleting,
  onToggle,
  onComplete,
  onStart,
}: {
  mod: AcademyModule;
  isCompleted: boolean;
  isLocked: boolean;
  isExpanded: boolean;
  isCompleting: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onStart: () => void;
}) {
  return (
    <Card
      className={`transition-all duration-200 ${
        isCompleted
          ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/20"
          : isLocked
            ? "opacity-60 border-muted"
            : "hover:shadow-md"
      }`}
    >
      <CardHeader
        className="cursor-pointer select-none"
        onClick={isLocked ? undefined : onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {isCompleted ? (
                <IconCheck className="h-5 w-5 text-green-600" />
              ) : isLocked ? (
                <IconLock className="h-4 w-4 text-muted-foreground" />
              ) : (
                mod.order
              )}
            </span>
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{mod.emoji}</span>
                <span className="truncate">{mod.title}</span>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <IconClock className="h-3.5 w-3.5" />
                <span>{mod.estimatedMinutes} min</span>
                {mod.requiredForOnboarding && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Obrigatorio
                  </Badge>
                )}
                {isCompleted && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-green-500/50 text-green-700 dark:text-green-400"
                  >
                    Concluido
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {!isLocked && (
            <Button variant="ghost" size="icon" className="shrink-0">
              {isExpanded ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && !isLocked && (
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">{mod.description}</p>

          <ul className="space-y-2">
            {mod.sections.map((section) => (
              <li
                key={section.id}
                className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-muted/50"
              >
                <span>{SECTION_TYPE_ICONS[section.type]}</span>
                <span>{section.title}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 pt-2">
            {!isCompleted ? (
              <>
                <Button size="sm" variant="default" onClick={onStart}>
                  <IconArrowRight className="h-4 w-4 mr-1.5" />
                  Iniciar modulo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onComplete}
                  disabled={isCompleting}
                >
                  <IconCheck className="h-4 w-4 mr-1.5" />
                  {isCompleting ? "Salvando..." : "Já concluído"}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" disabled>
                  <IconCheck className="h-4 w-4 mr-1.5 text-green-600" />
                  Modulo concluido
                </Button>
                <Button size="sm" variant="outline" onClick={onStart}>
                  Revisar modulo
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function AcademyPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readingModule, setReadingModule] = useState<AcademyModule | null>(null);

  const { data: completedIds = [], isLoading } = useAcademyProgress();
  const markComplete = useMarkModuleComplete();

  const completedSet = new Set(completedIds);
  const completedCount = completedSet.size;
  const totalCount = TBO_ACADEMY_MODULES.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isModuleLocked = useCallback(
    (mod: AcademyModule): boolean => {
      if (mod.order === 1) return false;
      const previous = TBO_ACADEMY_MODULES.find((m) => m.order === mod.order - 1);
      return previous ? !completedSet.has(previous.id) : false;
    },
    [completedSet]
  );

  const handleComplete = useCallback(
    (moduleId: string) => {
      markComplete.mutate(moduleId);
    },
    [markComplete]
  );

  const handleToggle = useCallback((moduleId: string) => {
    setExpandedId((prev) => (prev === moduleId ? null : moduleId));
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <IconSchool className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">TBO Academy</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Trilha de aprendizado cultural — conclua todos os modulos obrigatorios
        </p>
      </div>

      {/* Progress + Stats */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progresso geral</span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <IconBookmark className="h-4 w-4" />
                  <span>
                    {completedCount} de {totalCount} modulos concluidos
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconClock className="h-4 w-4" />
                  <span>~{TOTAL_ESTIMATED_MINUTES} min no total</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Module List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {TBO_ACADEMY_MODULES.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              isCompleted={completedSet.has(mod.id)}
              isLocked={isModuleLocked(mod)}
              isExpanded={expandedId === mod.id}
              isCompleting={
                markComplete.isPending &&
                markComplete.variables === mod.id
              }
              onToggle={() => handleToggle(mod.id)}
              onComplete={() => handleComplete(mod.id)}
              onStart={() => setReadingModule(mod)}
            />
          ))}
        </div>
      )}

      {/* Complete State */}
      {!isLoading && completedCount === totalCount && totalCount > 0 && (
        <Card className="border-green-500/40 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6 text-center space-y-2">
            <IconCheck className="h-10 w-10 mx-auto text-green-600" />
            <p className="font-semibold text-lg">Trilha concluida!</p>
            <p className="text-sm text-muted-foreground">
              Voce completou todos os modulos da TBO Academy. Bem-vindo ao time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Module Reader Sheet */}
      <AcademyModuleSheet
        module={readingModule}
        onComplete={handleComplete}
        onClose={() => setReadingModule(null)}
      />
    </div>
  );
}
