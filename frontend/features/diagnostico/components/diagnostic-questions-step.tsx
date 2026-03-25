"use client"

import { useCallback, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ETAPAS } from "../data/diagnostic-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconInfoCircle } from "@tabler/icons-react"

/** answers[etapaIdx][questionIdx] = 1..5 | undefined */
export type Answers = Record<string, number>

interface DiagnosticQuestionsStepProps {
  answers: Answers
  onAnswer: (key: string, value: number) => void
  onBack: () => void
  onSubmit: () => void
}

const ETAPA_ACCENT = [
  "bg-[#b8f724]",
  "bg-zinc-700",
  "bg-emerald-500",
  "bg-zinc-500",
  "bg-amber-500",
]

function getOptionClass(value: number, selected: boolean): string {
  if (!selected) return "border-zinc-200 text-zinc-400 hover:border-[#b8f724] hover:text-[#b8f724] dark:border-zinc-700"
  if (value <= 2) return "bg-red-500 border-red-500 text-white"
  if (value <= 3) return "bg-amber-500 border-amber-500 text-white"
  return "bg-emerald-500 border-emerald-500 text-white"
}

export function DiagnosticQuestionsStep({
  answers,
  onAnswer,
  onBack,
  onSubmit,
}: DiagnosticQuestionsStepProps) {
  const [attempted, setAttempted] = useState(false)

  const totalQuestions = useMemo(
    () => ETAPAS.reduce((a, e) => a + e.qs.length, 0),
    []
  )

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  )

  const progressPct = useMemo(
    () => Math.round((answeredCount / totalQuestions) * 100),
    [answeredCount, totalQuestions]
  )

  const getEtapaScore = useCallback(
    (ei: number) => {
      let score = 0
      ETAPAS[ei].qs.forEach((q, qi) => {
        const val = answers[`${ei}_${qi}`]
        if (val) score += val * q.weight
      })
      return Math.round(score)
    },
    [answers]
  )

  const getEtapaAnsweredCount = useCallback(
    (ei: number) => {
      return ETAPAS[ei].qs.filter((_, qi) => answers[`${ei}_${qi}`] !== undefined).length
    },
    [answers]
  )

  const handleSubmit = () => {
    setAttempted(true)
    onSubmit()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-medium tracking-[4px] uppercase text-[#b8f724] mb-2">
          Etapa 2 de 3
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight uppercase leading-none">
          Diagnóstico
          <br />
          de Conhecimento
        </h2>
        <p className="mt-3 text-xs text-zinc-500 leading-relaxed max-w-xl">
          Responda com honestidade. 1 = não sei / não faço. 5 = domino
          completamente.
          <br />
          Cada resposta revela uma camada do que você não enxerga.
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-zinc-200 mb-6 overflow-hidden dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-[#b8f724] transition-all duration-400 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Etapas */}
      <TooltipProvider delayDuration={200}>
        <div className="space-y-4">
          {ETAPAS.map((etapa, ei) => (
            <div
              key={ei}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className={cn("absolute inset-x-0 top-0 h-[3px]", ETAPA_ACCENT[ei])} />

              {/* Etapa header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[13px] font-bold tracking-tight">
                    {etapa.title}
                  </h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{etapa.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-medium px-2 py-0.5 rounded",
                    getEtapaAnsweredCount(ei) === etapa.qs.length
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : attempted && getEtapaAnsweredCount(ei) < etapa.qs.length
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                        : "text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
                  )}>
                    {getEtapaAnsweredCount(ei)}/{etapa.qs.length} respondidas
                  </span>
                  <span className="text-[11px] font-bold text-[#b8f724] bg-[#b8f724]/10 px-3 py-1 rounded">
                    {getEtapaScore(ei)}/{etapa.max}
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-1.5">
                {etapa.qs.map((q, qi) => {
                  const key = `${ei}_${qi}`
                  const currentVal = answers[key]
                  const isUnanswered = attempted && currentVal === undefined
                  return (
                    <div
                      key={qi}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3.5 py-3 transition-all duration-200",
                        isUnanswered
                          ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
                          : currentVal
                            ? "border-[#b8f724]/10 bg-[#b8f724]/[0.02]"
                            : "border-zinc-100 hover:border-[#b8f724]/15 dark:border-zinc-800"
                      )}
                    >
                      <span className="text-[8px] font-bold text-zinc-300 w-4 text-center shrink-0">
                        {String(qi + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[11px] text-zinc-600 leading-snug dark:text-zinc-400">
                        {q.text}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => onAnswer(key, v)}
                            className={cn(
                              "flex size-[30px] items-center justify-center rounded-md border-[1.5px] text-[10px] font-semibold transition-all duration-200",
                              getOptionClass(v, currentVal === v)
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="shrink-0">
                            <IconInfoCircle className="size-4 text-zinc-300 hover:text-[#b8f724] transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-[260px] text-xs"
                        >
                          {q.tip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-6 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-zinc-500 transition-all hover:border-[#b8f724] hover:text-[#b8f724] dark:border-zinc-700"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-[#b8f724] px-7 py-3.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#0a1f1d] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(184,247,36,0.25)]"
        >
          Ver meu diagnóstico →
        </button>
      </div>
    </div>
  )
}
