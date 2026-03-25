"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { DiagnosticContextStep } from "@/features/diagnostico/components/diagnostic-context-step"
import {
  DiagnosticQuestionsStep,
  type Answers,
} from "@/features/diagnostico/components/diagnostic-questions-step"
import { DiagnosticResultsDashboard } from "@/features/diagnostico/components/diagnostic-results-dashboard"
import { ProcessingOverlay } from "@/features/diagnostico/components/processing-overlay"
import { PricingDialog } from "@/features/diagnostico/components/pricing-dialog"
import { ETAPAS } from "@/features/diagnostico/data/diagnostic-data"
import { useDiagnosticPersistence } from "@/features/diagnostico/hooks/use-diagnostic-persistence"
import { toast } from "sonner"

const STEP_LABELS = ["Contexto", "Diagnóstico", "Resultado"]

export default function DiagnosticoPublicPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)

  const [contextData, setContextData] = useState({
    stage: "",
    vgv: "",
    freq: "",
    dep: "",
    invest: "",
  })

  const [answers, setAnswers] = useState<Answers>({})

  const goStep = useCallback((n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleAnswer = useCallback((key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  const totalQuestions = ETAPAS.reduce((a, e) => a + e.qs.length, 0)

  const handleSubmit = useCallback(() => {
    // Validate all questions answered
    const answeredCount = Object.keys(answers).length
    if (answeredCount < totalQuestions) {
      const missing = totalQuestions - answeredCount
      toast.error(
        `Responda todas as perguntas antes de continuar. Faltam ${missing} respostas.`
      )
      return
    }
    setProcessing(true)
  }, [answers, totalQuestions])

  const handleRestore = useCallback(
    (draft: { answers: Answers; contextData: typeof contextData; currentStep: number }) => {
      setAnswers(draft.answers)
      setContextData(draft.contextData)
      setStep(draft.currentStep)
    },
    []
  )

  const { clearDraft } = useDiagnosticPersistence({
    answers,
    contextData,
    currentStep: step,
    onRestore: handleRestore,
  })

  const handleProcessingComplete = useCallback(() => {
    setProcessing(false)
    clearDraft()
    goStep(2)
  }, [goStep, clearDraft])

  const handleCTA = useCallback(() => {
    setPricingOpen(true)
  }, [])

  const handleExploreAcademy = useCallback(async () => {
    // Set preview cookie for server-side access + sessionStorage for client
    if (typeof window !== "undefined") {
      sessionStorage.setItem("academy_preview", "true")
      await fetch("/api/academy-preview", { method: "POST" })
    }
    router.push("/academy")
  }, [router])

  return (
    <div className="min-h-screen">
      {/* Steps bar */}
      <div className="sticky top-14 z-40 flex items-center justify-center gap-0 border-b border-black/5 bg-white/80 backdrop-blur-sm py-3 px-6">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 px-5 relative">
            <div
              className={cn(
                "flex size-[22px] items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all",
                i === step
                  ? "bg-[#b8f724] border-[#b8f724] text-[#0a1f1d]"
                  : i < step
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-zinc-300 text-zinc-400"
              )}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-[9px] font-medium tracking-[1px] uppercase transition-colors whitespace-nowrap",
                i === step ? "text-zinc-900" : "text-zinc-400"
              )}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-zinc-200" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-10 md:px-12">
        {step === 0 && (
          <DiagnosticContextStep
            data={contextData}
            onChange={setContextData}
            onNext={() => goStep(1)}
          />
        )}
        {step === 1 && (
          <DiagnosticQuestionsStep
            answers={answers}
            onAnswer={handleAnswer}
            onBack={() => goStep(0)}
            onSubmit={handleSubmit}
          />
        )}
        {step === 2 && (
          <DiagnosticResultsDashboard
            answers={answers}
            context={{
              vgv: contextData.vgv,
              freq: contextData.freq,
              invest: contextData.invest,
            }}
            onBack={() => goStep(1)}
            onCTA={handleCTA}
            onExplore={handleExploreAcademy}
          />
        )}
      </div>

      <ProcessingOverlay
        active={processing}
        onComplete={handleProcessingComplete}
      />

      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  )
}
