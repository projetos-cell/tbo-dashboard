"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
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
        <span className="text-xs text-zinc-500 flex-shrink-0">{minLabel}</span>
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
                    ? "text-white shadow-lg scale-110"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:scale-105"
                }
              `}
              style={
                value === String(n)
                  ? { background: "linear-gradient(135deg, #E85102, #EC7602)" }
                  : undefined
              }
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500 flex-shrink-0">{maxLabel}</span>
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
      if (n <= 6) return "bg-red-950/40 text-red-400 hover:bg-red-900/50";
      if (n <= 8) return "bg-amber-950/40 text-amber-400 hover:bg-amber-900/50";
      return "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50";
    }
    if (n <= 6) return "bg-red-500 text-white shadow-lg scale-110";
    if (n <= 8) return "bg-amber-500 text-white shadow-lg scale-110";
    return "bg-emerald-500 text-white shadow-lg scale-110";
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
        <span className="text-xs text-zinc-500">{minLabel}</span>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Detratores (0-6)
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Neutros (7-8)
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Promotores (9-10)
          </span>
        </div>
        <span className="text-xs text-zinc-500">{maxLabel}</span>
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
      return;
    } else {
      onChange([...value, opt]);
    }
  }
  const atLimit = maxSelections ? value.length >= maxSelections : false;

  return (
    <div className="space-y-2">
      {maxSelections && (
        <p className="text-xs text-zinc-500">
          {value.length}/{maxSelections} selecionados
        </p>
      )}
      {options.map((opt) => {
        const isSelected = value.includes(opt);
        const isDisabled = atLimit && !isSelected;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !isDisabled && toggle(opt)}
            disabled={isDisabled}
            className={`
              flex w-full items-start gap-3 rounded-lg border p-3 transition-all duration-150 text-left
              ${isSelected
                ? "border-orange-500/50 bg-orange-500/10"
                : isDisabled
                ? "border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-50"
                : "border-zinc-700 hover:border-zinc-600 cursor-pointer"
              }
            `}
          >
            <div
              className={`
                mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0
                ${isSelected ? "border-orange-500 bg-orange-500" : "border-zinc-600"}
              `}
            >
              {isSelected && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-zinc-300">{opt}</span>
          </button>
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
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`
            flex w-full items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 text-left
            ${
              value === opt
                ? "border-orange-500/50 bg-orange-500/10"
                : "border-zinc-700 hover:border-zinc-600"
            }
          `}
        >
          <div
            className={`
              h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${value === opt ? "border-orange-500" : "border-zinc-600"}
            `}
          >
            {value === opt && (
              <div className="h-2 w-2 rounded-full bg-orange-500" />
            )}
          </div>
          <span className="text-sm text-zinc-300">{opt}</span>
        </button>
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
        <label className="text-sm font-medium text-zinc-200">
          {question.label}
          {question.required && <span className="text-orange-500 ml-1">*</span>}
        </label>
        {question.helperText && (
          <p className="text-xs text-zinc-500">{question.helperText}</p>
        )}
      </div>

      {question.type === "text" && (
        <input
          type="text"
          value={(answer as string) ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition"
          placeholder="Sua resposta..."
        />
      )}

      {question.type === "textarea" && (
        <textarea
          value={(answer as string) ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition resize-y"
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
    return SURVEY_QUESTIONS
      .filter((q) => q.sectionId === currentSection.id)
      .filter((q) => isQuestionVisible(q, answers));
  }, [currentSection, answers]);

  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  function isSectionValid(): boolean {
    return visibleQuestions.every((q) => {
      if (!q.required) return true;
      const a = answers[q.id];
      if (Array.isArray(a)) return a.length > 0;
      return typeof a === "string" && a.trim().length > 0;
    });
  }

  function handleNext() {
    if (!isSectionValid()) {
      setError("Por favor, responda todas as perguntas obrigatórias.");
      return;
    }
    setError(null);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePrev() {
    setError(null);
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!isSectionValid()) {
      setError("Por favor, responda todas as perguntas obrigatórias.");
      return;
    }
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

  // ── Background gradient (shared) ──
  const bgGradient = (
    <div
      className="pointer-events-none fixed inset-0 opacity-20"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, #E85102 0%, transparent 70%)",
      }}
    />
  );

  // ── Submitted State ──
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        {bgGradient}
        <div className="relative w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "rgba(232, 81, 2, 0.15)" }}
          >
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#E85102"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Obrigado pela sua participação!
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Sua resposta foi enviada com sucesso e é completamente anônima.
            <br />
            Valorizamos muito a sua opinião.
          </p>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/60 px-4 py-2 text-sm text-zinc-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#E85102" strokeWidth={2}>
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
        {bgGradient}
        <div className="relative w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center">
            <Image src="/logo-tbo-dark.svg" alt="TBO" width={120} height={40} priority />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#E85102" }}>
                {SURVEY_INTRO.edition}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {surveyTitle}
              </h1>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
              {SURVEY_INTRO.body.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t border-zinc-800" />

            <div className="flex items-start gap-3 rounded-xl bg-zinc-800/60 p-4">
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(232, 81, 2, 0.15)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#E85102" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {SURVEY_INTRO.anonymity}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #E85102 0%, #EC7602 100%)",
              }}
            >
              {SURVEY_INTRO.cta}
            </button>

            <div className="flex items-center justify-center gap-3 text-xs text-zinc-600">
              <span>{totalSteps} seções</span>
              <span className="text-zinc-700">·</span>
              <span>{SURVEY_QUESTIONS.length} perguntas</span>
              <span className="text-zinc-700">·</span>
              <span>~9 min</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-zinc-700">Powered by TBO OS</p>
        </div>
      </div>
    );
  }

  // ── Section Form ──
  const isLastSection = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-zinc-950">
      {bgGradient}

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-800">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #E85102, #EC7602)",
          }}
        />
      </div>

      <div className="relative flex items-start justify-center p-4 pt-8 md:pt-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo-tbo-dark.svg" alt="TBO" width={80} height={28} />
              <span className="text-xs text-zinc-600">|</span>
              <span className="text-xs text-zinc-500">Pesquisa de Clima</span>
            </div>
            <span className="text-xs font-medium text-zinc-500">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>

          {/* Section Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
            {/* Section title */}
            <div className="space-y-1">
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#E85102" }}
              >
                Seção {currentStep + 1}
              </div>
              <h2 className="text-lg font-bold text-white">
                {currentSection?.title}
              </h2>
              {currentSection?.description && (
                <p className="text-sm text-zinc-500">
                  {currentSection.description}
                </p>
              )}
            </div>

            <div className="h-px bg-zinc-800" />

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
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.98]"
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
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #E85102 0%, #EC7602 100%)",
                  }}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar pesquisa"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isSectionValid()}
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #E85102 0%, #EC7602 100%)",
                  }}
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
                    ? "w-6"
                    : i < currentStep
                    ? "w-1.5 bg-orange-500/50"
                    : "w-1.5 bg-zinc-800"
                }`}
                style={
                  i === currentStep
                    ? { background: "linear-gradient(90deg, #E85102, #EC7602)" }
                    : undefined
                }
              />
            ))}
          </div>

          <p className="text-center text-[11px] text-zinc-700 pb-8">
            Powered by TBO OS
          </p>
        </div>
      </div>
    </div>
  );
}
