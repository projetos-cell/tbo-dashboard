"use client"

import { useCallback, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAcademyEntitlement } from "@/features/academy/hooks/use-academy-entitlement"
import { ETAPAS } from "@/features/diagnostico/data/diagnostic-data"
import type { Answers } from "@/features/diagnostico/components/diagnostic-questions-step"
import type { ProductSlug } from "@/features/academy/hooks/use-academy-entitlement"

const PRODUCT_LABEL: Record<ProductSlug, string> = {
  diagnostic: "Diagnóstico",
  essencial: "Essencial",
  profissional: "Profissional",
  enterprise: "Enterprise",
}

const NOTIFICATION_OPTIONS = [
  { value: "daily", label: "Diária" },
  { value: "weekly", label: "Semanal" },
  { value: "never", label: "Nunca" },
]

interface WizardPreferences {
  notificationFrequency: string
  learningGoal: string
}

async function markOnboardingComplete() {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getSession()
  if (!session.session) return

  await supabase.auth.updateUser({
    data: { academy_onboarding_completed: true },
  })
}

function getWeakAreas(answers: Answers): string[] {
  return ETAPAS
    .map((etapa, ei) => {
      const total = etapa.qs.reduce((sum, q, qi) => {
        const val = answers[`${ei}_${qi}`] ?? 0
        return sum + val * q.weight
      }, 0)
      return { title: etapa.title, score: total, max: etapa.max }
    })
    .filter((e) => e.score / e.max < 0.5)
    .map((e) => e.title)
}

function restoreDiagnosticAnswers(): Answers {
  try {
    const raw = sessionStorage.getItem("diagnostic_draft")
    if (!raw) return {}
    const draft = JSON.parse(raw) as { answers?: Answers }
    return draft.answers ?? {}
  } catch {
    return {}
  }
}

// --- Step components ---

function StepWelcome({ product, onNext }: { product: ProductSlug; onNext: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-[#b8f724]/10 text-[#b8f724] text-3xl">
        🎓
      </div>
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight uppercase">
          Bem-vindo à TBO Academy
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Você adquiriu o plano{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {PRODUCT_LABEL[product]}
          </span>
          . Vamos configurar sua experiência de aprendizado.
        </p>
      </div>
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-lg bg-[#b8f724] px-7 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#0a1f1d] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(184,247,36,0.25)]"
      >
        Começar →
      </button>
    </div>
  )
}

function StepDiagnosticResults({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const hasAnswers = Object.keys(answers).length > 0
  const weakAreas = hasAnswers ? getWeakAreas(answers) : []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-medium tracking-[4px] uppercase text-[#b8f724] mb-2">
          Passo 2 de 4
        </p>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">
          Seu diagnóstico
        </h2>
      </div>

      {hasAnswers ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            Com base no seu diagnóstico, identificamos as seguintes áreas de
            desenvolvimento:
          </p>
          {weakAreas.length > 0 ? (
            <ul className="space-y-2">
              {weakAreas.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                >
                  <span className="text-base">⚠️</span> {area}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20">
              Ótimo resultado! Seu conhecimento está bem consolidado nas áreas avaliadas.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Você ainda não completou o diagnóstico. Recomendamos fazer o
          diagnóstico para receber uma trilha personalizada.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-[#b8f724] px-7 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#0a1f1d] transition-all hover:-translate-y-0.5"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}

function StepRecommendedTrail({
  answers,
  onNext,
}: {
  answers: Answers
  onNext: () => void
}) {
  const weakAreas = getWeakAreas(answers)
  const hasWeak = weakAreas.length > 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-medium tracking-[4px] uppercase text-[#b8f724] mb-2">
          Passo 3 de 4
        </p>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">
          Sua trilha recomendada
        </h2>
      </div>

      <div className="rounded-xl border border-[#b8f724]/20 bg-[#b8f724]/5 p-5">
        <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#b8f724] mb-2">
          {hasWeak ? "Trilha de aceleração" : "Trilha de excelência"}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {hasWeak
            ? `Foco em ${weakAreas.slice(0, 2).join(" e ")} para elevar sua base estratégica de marketing imobiliário.`
            : "Você está pronto para explorar conteúdos avançados de posicionamento e performance."}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-[#b8f724] px-7 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#0a1f1d] transition-all hover:-translate-y-0.5"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}

function StepPreferences({
  preferences,
  onChange,
  onComplete,
  isLoading,
}: {
  preferences: WizardPreferences
  onChange: (p: WizardPreferences) => void
  onComplete: () => void
  isLoading: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-medium tracking-[4px] uppercase text-[#b8f724] mb-2">
          Passo 4 de 4
        </p>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">
          Preferências
        </h2>
      </div>

      <div className="space-y-4">
        {/* Notification frequency */}
        <div>
          <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-zinc-400 mb-2">
            Frequência de lembretes de estudo
          </label>
          <div className="flex gap-2">
            {NOTIFICATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onChange({ ...preferences, notificationFrequency: opt.value })
                }
                className={cn(
                  "rounded-lg border-[1.5px] px-4 py-2 text-[11px] font-semibold transition-all",
                  preferences.notificationFrequency === opt.value
                    ? "border-[#b8f724] bg-[#b8f724]/10 text-zinc-900 dark:text-zinc-100"
                    : "border-zinc-200 text-zinc-500 hover:border-[#b8f724]/40 dark:border-zinc-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Learning goal */}
        <div>
          <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-zinc-400 mb-1">
            Meta de aprendizado (palavras suas)
          </label>
          <input
            type="text"
            placeholder="Ex: Aprender a briefar agências com precisão"
            value={preferences.learningGoal}
            onChange={(e) =>
              onChange({ ...preferences, learningGoal: e.target.value })
            }
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] text-zinc-900 outline-none transition-colors focus:border-[#b8f724] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-7 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase transition-all",
            isLoading
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-[#b8f724] text-[#0a1f1d] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(184,247,36,0.25)]"
          )}
        >
          {isLoading ? "Salvando..." : "Entrar na Academy ✓"}
        </button>
      </div>
    </div>
  )
}

// --- Main Wizard ---

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [wizardStep, setWizardStep] = useState(0)
  const [preferences, setPreferences] = useState<WizardPreferences>({
    notificationFrequency: "weekly",
    learningGoal: "",
  })

  const { product } = useAcademyEntitlement()
  const queryClient = useQueryClient()

  const answers = restoreDiagnosticAnswers()

  const { mutate: complete, isPending } = useMutation({
    mutationFn: markOnboardingComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-onboarding"] })
      onComplete()
    },
  })

  const steps = [
    <StepWelcome key={0} product={product} onNext={() => setWizardStep(1)} />,
    <StepDiagnosticResults key={1} answers={answers} onNext={() => setWizardStep(2)} />,
    <StepRecommendedTrail key={2} answers={answers} onNext={() => setWizardStep(3)} />,
    <StepPreferences
      key={3}
      preferences={preferences}
      onChange={setPreferences}
      onComplete={() => complete()}
      isLoading={isPending}
    />,
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === wizardStep
                  ? "w-6 bg-[#b8f724]"
                  : i < wizardStep
                    ? "w-3 bg-emerald-400"
                    : "w-3 bg-zinc-200 dark:bg-zinc-700"
              )}
            />
          ))}
        </div>

        <div className="p-8">{steps[wizardStep]}</div>
      </div>
    </div>
  )
}
