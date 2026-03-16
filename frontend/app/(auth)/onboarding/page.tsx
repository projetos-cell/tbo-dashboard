"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconExternalLink,
  IconArrowRight,
  IconConfetti,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  useOnboardingChecklist,
  useToggleChecklistTask,
} from "@/features/onboarding/hooks/use-onboarding";
import {
  ONBOARDING_DAYS,
  TOTAL_TASKS,
  type OnboardingTask,
} from "@/features/onboarding/constants";
import type { ChecklistProgress } from "@/features/onboarding/services/onboarding";

function OnboardingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-2 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  completed,
  onToggle,
  isPending,
}: {
  task: OnboardingTask;
  completed: boolean;
  onToggle: () => void;
  isPending: boolean;
}) {
  const router = useRouter();

  function handleAction() {
    if (task.action === "link" && task.notionUrl) {
      window.open(task.notionUrl, "_blank", "noopener");
    } else if (task.action === "internal" && task.internalRoute) {
      router.push(task.internalRoute);
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3 transition-all duration-200",
        completed
          ? "border-primary/20 bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-accent/50",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={isPending}
        className="mt-0.5 shrink-0 transition-transform active:scale-90"
      >
        {completed ? (
          <IconCircleCheck className="h-5 w-5 text-primary" />
        ) : (
          <IconCircle className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {task.description}
        </p>
      </div>

      {(task.action === "link" || task.action === "internal") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAction}
        >
          {task.action === "link" ? (
            <>
              Abrir <IconExternalLink className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Ir <IconArrowRight className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function DaySection({
  day,
  checklist,
  onToggleTask,
  isPending,
  isFirstIncomplete,
}: {
  day: (typeof ONBOARDING_DAYS)[number];
  checklist: ChecklistProgress;
  onToggleTask: (taskId: string) => void;
  isPending: boolean;
  isFirstIncomplete: boolean;
}) {
  const completedCount = day.tasks.filter(
    (t) => checklist[t.id]?.completed,
  ).length;
  const allComplete = completedCount === day.tasks.length;
  const [expanded, setExpanded] = useState(isFirstIncomplete || allComplete);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        allComplete
          ? "border-primary/20 bg-primary/5"
          : isFirstIncomplete
            ? "border-primary/40 shadow-sm"
            : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="text-2xl">{day.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">
              Dia {day.day} — {day.title}
            </h3>
            {allComplete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <IconCheck className="h-3 w-3" /> Completo
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{day.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{day.tasks.length}
          </span>
          {expanded ? (
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 px-4 pb-4">
          {day.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              completed={!!checklist[task.id]?.completed}
              onToggle={() => onToggleTask(task.id)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ?? "Novo membro";

  const { data: checklistData, isLoading } = useOnboardingChecklist();
  const toggle = useToggleChecklistTask();

  if (isLoading || !checklistData) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <OnboardingSkeleton />
      </div>
    );
  }

  const checklist: ChecklistProgress = checklistData;

  const completedCount = Object.values(checklist).filter(
    (v) => v.completed,
  ).length;
  const progress = Math.round((completedCount / TOTAL_TASKS) * 100);
  const allComplete = completedCount === TOTAL_TASKS;

  // Find first day with incomplete tasks
  const firstIncompleteDayIndex = ONBOARDING_DAYS.findIndex((day) =>
    day.tasks.some((t) => !checklist[t.id]?.completed),
  );

  function handleToggle(taskId: string) {
    toggle.mutate(
      { taskId, currentChecklist: checklist },
      {
        onSuccess: (updated) => {
          const newCompleted = Object.values(updated).filter(
            (v) => v.completed,
          ).length;
          if (newCompleted === TOTAL_TASKS) {
            toast.success(
              "Onboarding completo! Bem-vindo oficialmente ao time TBO.",
            );
          }
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Auto-Onboarding TBO</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {allComplete ? (
            <span className="flex items-center gap-2">
              <IconConfetti className="h-7 w-7 text-primary" />
              Parabéns, {firstName}!
            </span>
          ) : (
            <>Olá, {firstName}. Vamos começar.</>
          )}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {allComplete
            ? "Você concluiu todas as etapas. Agora é oficialmente parte do time."
            : "Complete as etapas abaixo em até 5 dias para alcançar autonomia total na TBO."}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progresso geral</span>
          <span className="font-medium tabular-nums">
            {completedCount}/{TOTAL_TASKS} tarefas ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Day sections */}
      <div className="space-y-3">
        {ONBOARDING_DAYS.map((day, index) => (
          <DaySection
            key={day.day}
            day={day}
            checklist={checklist}
            onToggleTask={handleToggle}
            isPending={toggle.isPending}
            isFirstIncomplete={index === firstIncompleteDayIndex}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Dúvidas? Fale com seu Product Owner ou acesse o{" "}
          <a
            href="https://www.notion.so/2193782e356143e5b41756c78e230cec"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            Manual de Cultura
          </a>
          .
        </p>
      </div>
    </div>
  );
}
