"use client"

import { useEffect, useState } from "react"

const STEPS = [
  { pct: 15, text: "Analisando visão estratégica..." },
  { pct: 35, text: "Mapeando conhecimento do comprador..." },
  { pct: 55, text: "Avaliando domínio do processo..." },
  { pct: 70, text: "Medindo capacidade de avaliação..." },
  { pct: 85, text: "Calculando custo da ignorância..." },
  { pct: 100, text: "Gerando diagnóstico completo..." },
]

interface ProcessingOverlayProps {
  active: boolean
  onComplete: () => void
}

export function ProcessingOverlay({ active, onComplete }: ProcessingOverlayProps) {
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    if (!active) {
      setStepIdx(0)
      return
    }

    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < STEPS.length) {
        setStepIdx(i)
      } else {
        clearInterval(interval)
        setTimeout(onComplete, 400)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [active, onComplete])

  if (!active) return null

  const step = STEPS[stepIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1f1d] animate-in fade-in duration-300">
      <div className="text-center">
        <p className="text-[10px] font-semibold tracking-[3px] uppercase text-zinc-400 mb-5">
          Processando diagnóstico
        </p>
        <div className="w-[300px] h-1 rounded-full bg-white/[0.06] mx-auto mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#b8f724] transition-all duration-500 ease-out"
            style={{ width: `${step.pct}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-500">{step.text}</p>
      </div>
    </div>
  )
}
