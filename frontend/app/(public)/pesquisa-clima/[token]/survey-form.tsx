"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SURVEY_SECTIONS,
  SURVEY_QUESTIONS,
  SURVEY_INTRO,
  type SurveyQuestion,
} from "@/features/pesquisa-clima/constants";

// ── Types ──
interface ClimateSurveyFormProps {
  token: string;
  tokenId: string;
  surveyId: string;
  surveyTitle: string;
}

type Answers = Record<string, string | string[]>;

// ── Helpers ──
function isQuestionVisible(q: SurveyQuestion, answers: Answers): boolean {
  if (!q.conditionalOn) return true;
  const parentAnswer = answers[q.conditionalOn.questionId];
  if (Array.isArray(parentAnswer)) return false;
  return q.conditionalOn.values.includes(parentAnswer ?? "");
}

// ── Scale Component (1-5 Likert) ──
function ScaleInput({
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-zinc-400 flex-shrink-0">{minLabel}</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`
                h-11 w-11 rounded-full text-sm font-semibold transition-all duration-150
                ${
                  value === String(n)
                    ? "bg-zinc-900 text-white shadow-md scale-110"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:scale-105"
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-400 flex-shrink-0">{maxLabel}</span>
      </div>
    </div>
  );
}

// ── NPS Component (0-10) ──
function NpsInput({
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  minLabel: string;
  maxLabel: string;
}) {
  const numValue = value ? Number(value) : -1;

  function npsColor(n: number, selected: boolean): string {
    if (!selected) {
      if (n <= 6) return "bg-red-50 text-red-400 hover:bg-red-100";
      if (n <= 8) return "bg-amber-50 text-amber-400 hover:bg-amber-100";
      return "bg-emerald-50 text-emerald-400 hover:bg-emerald-100";
    }
    if (n <= 6) return "bg-red-500 text-white shadow-md scale-110";
    if (n <= 8) return "bg-amber-500 text-white shadow-md scale-110";
    return "bg-emerald-500 text-white shadow-md scale-110";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            className={`
              h-10 w-10 rounded-lg text-sm font-semibold transition-all duration-150
              ${npsColor(n, numValue === n)}
            `}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{minLabel}</span>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Detratores (0-6)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Neutros (7-8)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Promotores (9-10)
          </span>
        </div>
        <span className="text-xs text-zinc-400">{maxLabel}</span>
      </div>
    </div>
  );
}

// ── Multi-Select Component ──
function MultiSelectInput({
  options,
  value,
  onChange,
  maxSelections,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  maxSelections?: number;
}) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (maxSelections && value.length >= maxSelections) {
      // At limit — replace oldest selection
      return;
    } else {
      onChange([...value, opt]);
    }
  }
  const atLimit = maxSelections ? value.length >= maxSelections : false;

  return (
    <div className="space-y-2">
      {maxSelections && (
        <p className="text-xs text-zinc-400">
          {value.length}/{maxSelections} selecionados
        </p>
      )}
      {options.map((opt) => {
        const isSelected = value.includes(opt);
        const isDisabled = atLimit && !isSelected;
        return (
          <label
            key={opt}
            className={`
              flex items-start gap-3 rounded-lg border p-3 transition-all duration-150
              ${isSelected
                ? "border-zinc-900 bg-zinc-50 cursor-pointer"
                : isDisabled
                ? "border-zinc-100 bg-zinc-50/50 cursor-not-allowed opacity-50"
                : "border-zinc-200 hover:border-zinc-300 cursor-pointer"
              }
            `}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggle(opt)}
              disabled={isDisabled}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-700">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

// ── Select Options Component ──
function SelectInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`
            flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150
            ${
              value === opt
                ? "border-zinc-900 bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-300"
            }
          `}
        >
          <div
            className={`
              h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${value === opt ? "border-zinc-900" : "border-zinc-300"}
            `}
          >
            {value === opt && (
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
            )}
          </div>
          <span className="text-sm text-zinc-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── Question Renderer ──
function QuestionCard({
  question,
  answer,
  onAnswer,
  index,
}: {
  question: SurveyQuestion;
  answer: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
  index: number;
}) {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-900">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helperText && (
          <p className="text-xs text-zinc-400">{question.helperText}</p>
        )}
      </div>

      {question.type === "text" && (
        <input
          type="text"
          value={(answer as string) ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
          placeholder="Sua resposta..."
        />
      )}

      {question.type === "textarea" && (
        <textarea
          value={(answer as string) ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition resize-y"
          placeholder="Sua resposta..."
        />
      )}

      {question.type === "select" && question.options && (
        <SelectInput
          options={question.options}
          value={(answer as string) ?? ""}
          onChange={(v) => onAnswer(v)}
        />
      )}

      {question.type === "scale" && (
        <ScaleInput
          value={(answer as string) ?? ""}
          onChange={(v) => onAnswer(v)}
          minLabel={question.scaleMin ?? "1"}
          maxLabel={question.scaleMax ?? "5"}
        />
      )}

      {question.type === "nps" && (
        <NpsInput
          value={(answer as string) ?? ""}
          onChange={(v) => onAnswer(v)}
          minLabel={question.scaleMin ?? "0"}
          maxLabel={question.scaleMax ?? "10"}
        />
      )}

      {question.type === "multi_select" && question.options && (
        <MultiSelectInput
          options={question.options}
          value={(answer as string[]) ?? []}
          onChange={(v) => onAnswer(v)}
          maxSelections={question.maxSelections}
        />
      )}
    </div>
  );
}

// ── Main Form ──
export function ClimateSurveyForm({
  token,
  tokenId,
  surveyId,
  surveyTitle,
}: ClimateSurveyFormProps) {
  // -1 = intro, 0..N = sections, N+1 = submitting/done
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = SURVEY_SECTIONS;
  const totalSteps = sections.length;

  const currentSection = currentStep >= 0 && currentStep < totalSteps
    ? sections[currentStep]
    : null;

  const visibleQuestions = useMemo(() => {
    if (!currentSection) return [];
    return SURVEY_QUESTIONS.filter(
      (q) => q.sectionId === currentSection.id && isQuestionVisible(q, answers)
    );
  }, [currentSection, answers]);

  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Validate current section
  function isSectionValid(): boolean {
    return visibleQuestions.every((q) => {
      if (!q.required) return true;
      const a = answers[q.id];
      if (Array.isArray(a)) return a.length > 0;
      return typeof a === "string" && a.trim() !== "";
    });
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pesquisa-clima/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          tokenId,
          surveyId,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar pesquisa.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Submitted State ──
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-10 w-10 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Obrigado pela sua participação!
          </h1>
          <p className="text-zinc-500 leading-relaxed">
            Sua resposta foi enviada com sucesso e é completamente anônima.
            <br />
            Valorizamos muito a sua opinião.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pesquisa 100% anônima
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Intro Screen ──
  if (currentStep === -1) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 p-4 pt-12 md:pt-20">
        <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Logo / Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">TBO</span>
              </div>
              <span className="text-sm font-medium text-zinc-400">
                Pesquisa de Clima
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
              {surveyTitle}
            </h1>

            <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
              <p className="font-medium text-zinc-900">{SURVEY_INTRO.greeting}</p>
              {SURVEY_INTRO.body.split("\n\n").map((paragraph, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900">$1</strong>')
                }} />
              ))}
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                <strong>100% anônima:</strong> suas respostas não são vinculadas ao seu e-mail ou identidade.
              </span>
            </div>

            <p className="text-sm font-semibold text-zinc-900">
              {SURVEY_INTRO.cta}
            </p>

            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98]"
            >
              Começar pesquisa
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
              <span>{totalSteps} seções</span>
              <span>·</span>
              <span>{SURVEY_QUESTIONS.length} perguntas</span>
              <span>·</span>
              <span>~8 min</span>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-300">
            Powered by TBO OS
          </p>
        </div>
      </div>
    );
  }

  // ── Section Form ──
  const isLastSection = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200">
        <div
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start justify-center p-4 pt-8 md:pt-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">TBO</span>
              </div>
              <span className="text-xs text-zinc-400">Pesquisa de Clima</span>
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>

          {/* Section Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
            {/* Section title */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Seção {currentStep + 1}
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                {currentSection?.title}
              </h2>
              {currentSection?.description && (
                <p className="text-sm text-zinc-500">
                  {currentSection.description}
                </p>
              )}
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Questions */}
            <div className="space-y-6">
              {visibleQuestions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  answer={answers[q.id]}
                  onAnswer={(v) => handleAnswer(q.id, v)}
                  index={i}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98]"
                >
                  Voltar
                </button>
              )}

              <div className="flex-1" />

              {isLastSection ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !isSectionValid()}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Enviando..." : "Enviar pesquisa"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isSectionValid()}
                  className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima seção
                </button>
              )}
            </div>
          </div>

          {/* Section dots */}
          <div className="flex items-center justify-center gap-1.5">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-zinc-900"
                    : i < currentStep
                    ? "w-1.5 bg-zinc-400"
                    : "w-1.5 bg-zinc-200"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-xs text-zinc-300 pb-8">
            Powered by TBO OS
          </p>
        </div>
      </div>
    </div>
  );
}
