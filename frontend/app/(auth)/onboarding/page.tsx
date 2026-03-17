"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconArrowRight,
  IconConfetti,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
  IconBrain,
  IconLock,
  IconCircleCheckFilled,
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
  useQuizProgress,
  useSubmitQuiz,
} from "@/features/onboarding/hooks/use-onboarding";
import {
  ONBOARDING_DAYS,
  ONBOARDING_QUIZZES,
  TOTAL_TASKS,
  type OnboardingTask,
} from "@/features/onboarding/constants";
import type {
  ChecklistProgress,
  QuizProgress,
  QuizDayResult,
} from "@/features/onboarding/services/onboarding";
import { QuizDialog } from "@/features/onboarding/components/quiz-dialog";

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
    if (task.action === "internal" && task.internalRoute) {
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

      {task.action === "internal" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAction}
        >
          Ir <IconArrowRight className="ml-1 h-3 w-3" />
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
  quizResult,
  onOpenQuiz,
  previousDayQuizPassed,
}: {
  day: (typeof ONBOARDING_DAYS)[number];
  checklist: ChecklistProgress;
  onToggleTask: (taskId: string) => void;
  isPending: boolean;
  isFirstIncomplete: boolean;
  quizResult?: QuizDayResult;
  onOpenQuiz: () => void;
  previousDayQuizPassed: boolean;
}) {
  const completedCount = day.tasks.filter(
    (t) => checklist[t.id]?.completed,
  ).length;
  const allTasksComplete = completedCount === day.tasks.length;
  const quizPassed = !!quizResult?.passed;
  const dayFullyComplete = allTasksComplete && quizPassed;
  const canAccessDay = previousDayQuizPassed;
  const [expanded, setExpanded] = useState(
    (isFirstIncomplete && canAccessDay) || dayFullyComplete,
  );

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        dayFullyComplete
          ? "border-primary/20 bg-primary/5"
          : isFirstIncomplete && canAccessDay
            ? "border-primary/40 shadow-sm"
            : !canAccessDay
              ? "border-border opacity-60"
              : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => canAccessDay && setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-4 p-4 text-left",
          !canAccessDay && "cursor-not-allowed",
        )}
      >
        <span className="text-2xl">{day.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">
              Dia {day.day} — {day.title}
            </h3>
            {!canAccessDay && (
              <IconLock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {dayFullyComplete && (
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
          {canAccessDay &&
            (expanded ? (
              <IconChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            ))}
        </div>
      </button>

      {expanded && canAccessDay && (
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

          {/* Quiz CTA */}
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-lg border p-3 transition-all",
              quizPassed
                ? "border-emerald-500/20 bg-emerald-500/5"
                : allTasksComplete
                  ? "border-primary/30 bg-primary/5"
                  : "border-dashed border-muted-foreground/20 bg-muted/30",
            )}
          >
            {quizPassed ? (
              <IconCircleCheckFilled className="h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <IconBrain className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {quizPassed
                  ? `Quiz concluído — ${quizResult.score}/${quizResult.total} acertos`
                  : "Quiz do Dia"}
              </p>
              <p className="text-xs text-muted-foreground">
                {quizPassed
                  ? "Parabéns! Você passou neste quiz."
                  : allTasksComplete
                    ? "Todas as tarefas concluídas. Faça o quiz para liberar o próximo dia."
                    : "Complete todas as tarefas acima para desbloquear o quiz."}
              </p>
            </div>
            <Button
              variant={quizPassed ? "ghost" : "default"}
              size="sm"
              className="h-8 shrink-0 text-xs"
              disabled={!allTasksComplete}
              onClick={onOpenQuiz}
            >
              {quizPassed ? "Rever" : "Iniciar quiz"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ?? "Novo membro";

  const { data: checklistData, isLoading: checklistLoading } =
    useOnboardingChecklist();
  const { data: quizData, isLoading: quizLoading } = useQuizProgress();
  const toggle = useToggleChecklistTask();
  const submitQuiz = useSubmitQuiz();
  const [activeQuizDay, setActiveQuizDay] = useState<number | null>(null);

  const isLoading = checklistLoading || quizLoading;

  if (isLoading || !checklistData || !quizData) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <OnboardingSkeleton />
      </div>
    );
  }

  const checklist: ChecklistProgress = checklistData;
  const quizProgress: QuizProgress = quizData;

  // Count completed tasks + passed quizzes for progress
  const completedTaskCount = Object.values(checklist).filter(
    (v) => v.completed,
  ).length;
  const passedQuizCount = Object.values(quizProgress).filter(
    (v) => v.passed,
  ).length;
  const totalItems = TOTAL_TASKS + ONBOARDING_QUIZZES.length;
  const completedItems = completedTaskCount + passedQuizCount;
  const progress = Math.round((completedItems / totalItems) * 100);
  const allComplete = completedItems === totalItems;

  // Find first day with incomplete tasks or quiz
  const firstIncompleteDayIndex = ONBOARDING_DAYS.findIndex((day) => {
    const tasksIncomplete = day.tasks.some(
      (t) => !checklist[t.id]?.completed,
    );
    const quizNotPassed = !quizProgress[`day_${day.day}`]?.passed;
    return tasksIncomplete || quizNotPassed;
  });

  function handleToggle(taskId: string) {
    toggle.mutate(
      { taskId, currentChecklist: checklist },
      {
        onSuccess: (updated) => {
          const tasksDone = Object.values(updated).filter(
            (v) => v.completed,
          ).length;
          const quizzesDone = Object.values(quizProgress).filter(
            (v) => v.passed,
          ).length;
          if (tasksDone + quizzesDone === totalItems) {
            toast.success(
              "Onboarding completo! Bem-vindo oficialmente ao time TBO.",
            );
          }
        },
      },
    );
  }

  function handleQuizSubmit(dayNum: number, result: QuizDayResult) {
    const dayKey = `day_${dayNum}`;
    submitQuiz.mutate(
      { dayKey, result, currentProgress: quizProgress },
      {
        onSuccess: () => {
          if (result.passed) {
            setActiveQuizDay(null);
            toast.success(
              `Quiz do Dia ${dayNum} aprovado! ${result.score}/${result.total} acertos.`,
            );
          }
        },
        onError: () => {
          toast.error("Erro ao salvar quiz. Tente novamente.");
        },
      },
    );
  }

  const activeQuiz = activeQuizDay
    ? ONBOARDING_QUIZZES.find((q) => q.day === activeQuizDay)
    : null;

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
            ? "Você concluiu todas as etapas e quizzes. Agora é oficialmente parte do time."
            : "Complete as tarefas e o quiz de cada dia para desbloquear o próximo. 5 dias para autonomia total."}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progresso geral</span>
          <span className="font-medium tabular-nums">
            {completedItems}/{totalItems} ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Day sections */}
      <div className="space-y-3">
        {ONBOARDING_DAYS.map((day, index) => {
          const dayKey = `day_${day.day}`;
          const previousDayKey = `day_${day.day - 1}`;
          const previousDayQuizPassed =
            index === 0 || !!quizProgress[previousDayKey]?.passed;

          return (
            <DaySection
              key={day.day}
              day={day}
              checklist={checklist}
              onToggleTask={handleToggle}
              isPending={toggle.isPending}
              isFirstIncomplete={index === firstIncompleteDayIndex}
              quizResult={quizProgress[dayKey]}
              onOpenQuiz={() => setActiveQuizDay(day.day)}
              previousDayQuizPassed={previousDayQuizPassed}
            />
          );
        })}
      </div>

      {/* Quiz dialog */}
      {activeQuiz && (
        <QuizDialog
          quiz={activeQuiz}
          previousResult={quizProgress[`day_${activeQuiz.day}`]}
          open={!!activeQuizDay}
          onOpenChange={(open) => !open && setActiveQuizDay(null)}
          onSubmit={(result) => handleQuizSubmit(activeQuiz.day, result)}
          isSubmitting={submitQuiz.isPending}
        />
      )}

      {/* Footer */}
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Dúvidas? Fale com seu Product Owner ou acesse o{" "}
          <a
            href="/cultura/manual"
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
