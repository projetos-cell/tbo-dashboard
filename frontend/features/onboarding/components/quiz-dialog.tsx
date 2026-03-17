"use client";

import { useState } from "react";
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DayQuiz, QuizOption } from "@/features/onboarding/constants";
import type { QuizDayResult } from "@/features/onboarding/services/onboarding";

interface QuizDialogProps {
  quiz: DayQuiz;
  previousResult?: QuizDayResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: QuizDayResult) => void;
  isSubmitting: boolean;
}

type Phase = "answering" | "review" | "result";

export function QuizDialog({
  quiz,
  previousResult,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: QuizDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    previousResult?.answers ?? {},
  );
  const [phase, setPhase] = useState<Phase>(
    previousResult?.passed ? "result" : "answering",
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const question = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const selectedOption = answers[question?.id];

  function handleSelectOption(optionId: string) {
    if (phase !== "answering" || showExplanation) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("result");
    }
  }

  function handleRetry() {
    setAnswers({});
    setCurrentIndex(0);
    setPhase("answering");
    setShowExplanation(false);
  }

  function handleFinish() {
    const score = quiz.questions.filter(
      (q) => answers[q.id] === q.correctOptionId,
    ).length;
    const result: QuizDayResult = {
      answers,
      score,
      total: totalQuestions,
      passed: score >= quiz.passingScore,
      completed_at: new Date().toISOString(),
    };
    onSubmit(result);
  }

  const score = quiz.questions.filter(
    (q) => answers[q.id] === q.correctOptionId,
  ).length;
  const passed = score >= quiz.passingScore;

  function renderAnswering() {
    if (!question) return null;
    const isCorrect = selectedOption === question.correctOptionId;

    return (
      <div className="space-y-5">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Pergunta {currentIndex + 1} de {totalQuestions}
            </span>
            <span className="tabular-nums">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <Progress
            value={((currentIndex + 1) / totalQuestions) * 100}
            className="h-1.5"
          />
        </div>

        {/* Question */}
        <p className="text-sm font-semibold leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option: QuizOption) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.id === question.correctOptionId;
            const showResult = showExplanation;

            return (
              <button
                key={option.id}
                type="button"
                disabled={showExplanation}
                onClick={() => handleSelectOption(option.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-all duration-200",
                  !showResult &&
                    !isSelected &&
                    "border-border hover:border-primary/40 hover:bg-accent/50",
                  !showResult &&
                    isSelected &&
                    "border-primary bg-primary/10",
                  showResult &&
                    isCorrectOption &&
                    "border-emerald-500/50 bg-emerald-500/10",
                  showResult &&
                    isSelected &&
                    !isCorrectOption &&
                    "border-red-500/50 bg-red-500/10",
                  showResult &&
                    !isSelected &&
                    !isCorrectOption &&
                    "border-border opacity-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      showResult && isCorrectOption
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : showResult && isSelected && !isCorrectOption
                          ? "border-red-500 bg-red-500 text-white"
                          : isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30",
                    )}
                  >
                    {showResult && isCorrectOption ? (
                      <IconCheck className="h-3.5 w-3.5" />
                    ) : showResult && isSelected && !isCorrectOption ? (
                      <IconX className="h-3.5 w-3.5" />
                    ) : (
                      option.id.toUpperCase()
                    )}
                  </span>
                  <span>{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className={cn(
              "rounded-lg border p-3 text-xs leading-relaxed",
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300",
            )}
          >
            {isCorrect ? "Correto! " : "Resposta incorreta. "}
            {question.explanation}
          </div>
        )}

        {/* Next button */}
        {showExplanation && (
          <Button onClick={handleNext} className="w-full">
            {currentIndex < totalQuestions - 1 ? (
              <>
                Próxima <IconArrowRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Ver resultado"
            )}
          </Button>
        )}
      </div>
    );
  }

  function renderResult() {
    return (
      <div className="space-y-5 text-center">
        <div
          className={cn(
            "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
            passed ? "bg-emerald-500/10" : "bg-amber-500/10",
          )}
        >
          {passed ? (
            <IconTrophy className="h-8 w-8 text-emerald-500" />
          ) : (
            <IconRefresh className="h-8 w-8 text-amber-500" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold">
            {passed ? "Aprovado!" : "Quase lá!"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Você acertou{" "}
            <span className="font-semibold text-foreground">
              {score}/{totalQuestions}
            </span>{" "}
            perguntas.
            {!passed && (
              <>
                {" "}
                Mínimo para passar:{" "}
                <span className="font-semibold">{quiz.passingScore}</span>.
              </>
            )}
          </p>
        </div>

        {/* Score bar */}
        <div className="space-y-1">
          <Progress
            value={(score / totalQuestions) * 100}
            className={cn(
              "h-2",
              passed
                ? "[&>div]:bg-emerald-500"
                : "[&>div]:bg-amber-500",
            )}
          />
          <p className="text-xs text-muted-foreground">
            {Math.round((score / totalQuestions) * 100)}% de acerto
          </p>
        </div>

        {/* Review answers */}
        <div className="space-y-2 text-left">
          {quiz.questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const correct = userAnswer === q.correctOptionId;
            return (
              <div
                key={q.id}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2.5 text-xs",
                  correct
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5",
                )}
              >
                {correct ? (
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <IconX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                )}
                <span className="text-muted-foreground">
                  {i + 1}. {q.question}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!passed && (
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex-1"
            >
              <IconRefresh className="mr-1 h-4 w-4" /> Tentar novamente
            </Button>
          )}
          <Button
            onClick={handleFinish}
            disabled={!passed || isSubmitting}
            className="flex-1"
          >
            {isSubmitting
              ? "Salvando..."
              : passed
                ? "Concluir quiz"
                : "Precisa passar para avançar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{quiz.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {quiz.description} Acerte pelo menos {quiz.passingScore} de{" "}
            {totalQuestions} para concluir o dia.
          </DialogDescription>
        </DialogHeader>

        {phase === "answering" && renderAnswering()}
        {phase === "result" && renderResult()}
      </DialogContent>
    </Dialog>
  );
}
