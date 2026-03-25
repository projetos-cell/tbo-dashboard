"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  ETAPAS,
  TRAILS,
  getLevel,
  getInsight,
  CTA_MESSAGES,
  type LevelKey,
} from "../data/diagnostic-data"
import type { Answers } from "./diagnostic-questions-step"
import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react"

interface ContextData {
  vgv: string
  freq: string
  invest: string
}

interface DiagnosticResultsStepProps {
  answers: Answers
  context: ContextData
  onBack: () => void
  onCTA: () => void
}

const LEVEL_COLORS: Record<LevelKey, { text: string; bg: string; bar: string }> = {
  cego: { text: "text-red-500", bg: "bg-red-500/10 text-red-500", bar: "bg-red-500" },
  miope: { text: "text-amber-500", bg: "bg-amber-500/10 text-amber-500", bar: "bg-amber-500" },
  enxerga: { text: "text-[#b8f724]", bg: "bg-[#b8f724]/10 text-[#b8f724]", bar: "bg-[#b8f724]" },
  domina: { text: "text-emerald-500", bg: "bg-emerald-500/10 text-emerald-500", bar: "bg-emerald-500" },
}

const LEVEL_ICONS: Record<number, string> = { 0: "🔴", 1: "🟡", 2: "🟠", 3: "🟢" }

const PRIORITY_STYLES = {
  critical: { card: "border-l-red-500", badge: "bg-red-500/10 text-red-500", label: "Crítica" },
  high: { card: "border-l-[#b8f724]", badge: "bg-[#b8f724]/10 text-[#b8f724]", label: "Alta" },
  medium: { card: "border-l-amber-500", badge: "bg-amber-500/10 text-amber-500", label: "Média" },
  low: { card: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-500", label: "Baixa" },
} as const

function useEtapaScores(answers: Answers) {
  return useMemo(() => {
    return ETAPAS.map((etapa, ei) => {
      let score = 0
      const criticals: string[] = []
      etapa.qs.forEach((q, qi) => {
        const val = answers[`${ei}_${qi}`]
        if (val) {
          score += val * q.weight
          if (val <= 2) criticals.push(q.text)
        }
      })
      score = Math.round(score)
      const pct = score / etapa.max
      const level = getLevel(pct)
      const insight = getInsight(ei, pct)
      return { score, pct, level, insight, criticals, etapa }
    })
  }, [answers])
}

export function DiagnosticResultsStep({
  answers,
  context,
  onBack,
  onCTA,
}: DiagnosticResultsStepProps) {
  const etapaResults = useEtapaScores(answers)

  const totalScore = useMemo(
    () => etapaResults.reduce((a, r) => a + r.score, 0),
    [etapaResults]
  )
  const totalMax = useMemo(
    () => ETAPAS.reduce((a, e) => a + e.max, 0),
    []
  )
  const totalPct = totalScore / totalMax
  const level = getLevel(totalPct)
  const colors = LEVEL_COLORS[level.cls]
  const ctaMsg = CTA_MESSAGES[level.cls]

  // Cost of ignorance
  const cost = useMemo(() => {
    const vgvVal = parseFloat(context.vgv) || 30
    const freqVal = parseFloat(context.freq) || 1
    const investPct = parseFloat(context.invest) || 2
    const vgvM = vgvVal * 1_000_000
    const ignorance = 1 - totalPct

    const mktSpend = vgvM * (investPct / 100)
    const wasteRate = Math.min(0.3, ignorance * 0.35)
    const wasteValue = Math.round(mktSpend * wasteRate)

    const delayMonths = Math.round(ignorance * 4)
    const monthlyCarry = vgvM * 0.008
    const delayCost = Math.round(delayMonths * monthlyCarry)

    const velocityLoss = Math.round(ignorance * 0.15 * vgvM)
    const totalCost = wasteValue + delayCost + velocityLoss
    const annualCost = Math.round(totalCost * freqVal)

    return { wasteValue, wasteRate, delayCost, delayMonths, monthlyCarry, velocityLoss, totalCost, annualCost, freqVal }
  }, [context, totalPct])

  // Trails
  const sortedTrails = useMemo(() => {
    return TRAILS.map((trail) => {
      const avgPct = trail.etapas.reduce((a, ei) => a + etapaResults[ei].pct, 0) / trail.etapas.length
      let priority: keyof typeof PRIORITY_STYLES
      if (avgPct < 0.35) priority = "critical"
      else if (avgPct < 0.55) priority = "high"
      else if (avgPct < 0.75) priority = "medium"
      else priority = "low"
      return { ...trail, avgPct, priority }
    })
      .filter((t) => t.avgPct < 0.85)
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      })
  }, [etapaResults])

  const fmtR = (v: number) => "R$ " + v.toLocaleString("pt-BR")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-7">
      {/* ===== MATURITY DASHBOARD ===== */}

      {/* Overall badge */}
      <div className="flex items-center gap-4 rounded-xl bg-[#0a1f1d] p-5 text-white">
        <span className="text-3xl">{LEVEL_ICONS[level.idx]}</span>
        <div className="flex-1">
          <h3 className="text-base font-extrabold tracking-tight uppercase">
            Diagnóstico de Maturidade
          </h3>
          <p className="text-[9px] text-zinc-400 mt-0.5">
            Nível geral de conhecimento em marketing imobiliário
          </p>
        </div>
        <div className="text-right">
          <div className={cn("text-3xl font-extrabold tracking-tight", colors.text)}>
            {totalScore}
            <span className="text-sm text-zinc-500">/{totalMax}</span>
          </div>
          <p className="text-[8px] tracking-[1px] uppercase text-zinc-400">
            {Math.round(totalPct * 100)}% de domínio
          </p>
          <span className={cn("inline-block mt-1 text-[9px] font-semibold tracking-[1px] uppercase px-2.5 py-0.5 rounded", colors.bg)}>
            {level.name}
          </span>
        </div>
      </div>

      {/* Radar-like summary bar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-[10px] font-semibold tracking-[2px] uppercase text-zinc-400 mb-4">
          Visão por dimensão
        </h4>
        <div className="space-y-3">
          {etapaResults.map((r, i) => {
            const c = LEVEL_COLORS[r.level.cls]
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-[140px] text-[10px] font-medium text-zinc-600 truncate dark:text-zinc-400">
                  {r.etapa.title}
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", c.bar)}
                    style={{ width: `${Math.round(r.pct * 100)}%` }}
                  />
                </div>
                <span className={cn("text-[10px] font-bold w-10 text-right", c.text)}>
                  {Math.round(r.pct * 100)}%
                </span>
                <span className={cn("text-[7px] font-semibold tracking-[0.5px] uppercase px-2 py-0.5 rounded", c.bg)}>
                  {r.level.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Etapa detail cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {etapaResults.map((r, i) => {
          const c = LEVEL_COLORS[r.level.cls]
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className={cn("absolute inset-x-0 top-0 h-[3px]", c.bar)} />
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold tracking-tight">{r.etapa.title}</h4>
                <span className={cn("text-[8px] font-semibold tracking-[1px] uppercase px-2 py-0.5 rounded", c.bg)}>
                  {r.level.name} · {Math.round(r.pct * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 mb-3 overflow-hidden dark:bg-zinc-800">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", c.bar)}
                  style={{ width: `${Math.round(r.pct * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{r.insight}</p>
              {r.criticals.length > 0 && (
                <div className="mt-3 space-y-1">
                  {r.criticals.map((crit, ci) => (
                    <div
                      key={ci}
                      className="flex items-start gap-1.5 rounded bg-red-50 px-2 py-1.5 text-[9px] text-red-600 dark:bg-red-950/20"
                    >
                      <IconAlertTriangle className="size-3 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ===== COST OF IGNORANCE ===== */}
      <div className="relative overflow-hidden rounded-xl bg-[#0a1f1d] p-6 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-red-500" />
        <div className="mb-5">
          <h3 className="text-lg font-extrabold tracking-tight uppercase">
            Custo Estimado da Ignorância
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">
            Quanto você perde por não ter repertório de marketing — por
            empreendimento
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-5 md:grid-cols-3">
          <CostCard
            label="Desperdício em marketing"
            value={fmtR(cost.wasteValue)}
            explain={`~${Math.round(cost.wasteRate * 100)}% do investimento perdido por não saber avaliar entregas, aprovar briefings fracos e aceitar resultados medianos.`}
          />
          <CostCard
            label="Custo do atraso"
            value={fmtR(cost.delayCost)}
            explain={`~${cost.delayMonths} meses de atraso no lançamento por processo mal conduzido. Capital parado custa ${fmtR(Math.round(cost.monthlyCarry))}/mês.`}
          />
          <CostCard
            label="VGV em risco"
            value={fmtR(cost.velocityLoss)}
            explain="Marketing fraco = venda lenta. Unidades encalhadas, descontos forçados, estoque que vira custo."
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border-2 border-red-500/30 bg-red-500/5 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-zinc-400">
              Custo total estimado por lançamento
            </p>
            {cost.freqVal > 1 && (
              <p className="text-[9px] text-zinc-500 mt-0.5">
                Com {cost.freqVal} lançamentos/ano: {fmtR(cost.annualCost)}/ano
              </p>
            )}
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-red-500 md:text-3xl">
            {fmtR(cost.totalCost)}
          </span>
        </div>

        <p className="mt-4 text-[8px] text-zinc-500 leading-relaxed italic border-t border-white/5 pt-4">
          Estimativa conservadora baseada em médias de mercado. O custo real pode
          ser significativamente maior dependendo da praça, concorrência e
          condições macroeconômicas. O objetivo não é precisão — é dimensionar o
          que a falta de repertório custa.
        </p>
      </div>

      {/* ===== RECOMMENDED TRAILS ===== */}
      {sortedTrails.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold tracking-[3px] uppercase text-zinc-400 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            Trilhas Recomendadas
          </h4>
          <div className="space-y-2.5">
            {sortedTrails.map((trail, i) => {
              const style = PRIORITY_STYLES[trail.priority]
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
                    style.card
                  )}
                >
                  <span className={cn("text-[7px] font-bold tracking-[1px] uppercase px-2 py-1 rounded w-16 text-center shrink-0", style.badge)}>
                    {style.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold tracking-tight">{trail.name}</h5>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{trail.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {trail.modules.map((m) => (
                        <span
                          key={m}
                          className="text-[7px] font-medium px-1.5 py-0.5 rounded bg-[#b8f724]/5 text-[#7da01a] tracking-wide uppercase"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== CTA BLOCK ===== */}
      <div className="relative overflow-hidden rounded-xl bg-[#b8f724] p-8 text-center">
        <div className="absolute -top-1/2 -right-[20%] w-[300px] h-[300px] rounded-full bg-white/5" />
        <h3 className="relative z-10 text-xl font-extrabold tracking-tight uppercase text-[#0a1f1d] md:text-2xl">
          {ctaMsg.title}
        </h3>
        <p className="relative z-10 mt-2 text-[11px] text-[#0a1f1d]/70 max-w-md mx-auto">
          {ctaMsg.sub}
        </p>
        <p className="relative z-10 mt-3 text-[13px] text-[#0a1f1d]/50 mb-5">
          Você ainda terceiriza tudo com as agências
          <br />e ainda não clicou no botão abaixo.
        </p>
        <button
          onClick={onCTA}
          className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-[#0a1f1d] px-8 py-4 text-xs font-bold tracking-[1px] uppercase text-[#b8f724] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)]"
        >
          Quero enxergar
          <IconArrowRight className="size-4" />
        </button>
      </div>

      {/* Back */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-6 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-zinc-500 transition-all hover:border-[#b8f724] hover:text-[#b8f724] dark:border-zinc-700"
        >
          ← Refazer diagnóstico
        </button>
      </div>
    </div>
  )
}

function CostCard({
  label,
  value,
  explain,
}: {
  label: string
  value: string
  explain: string
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
      <p className="text-[8px] font-semibold tracking-[1.5px] uppercase text-zinc-400 mb-1.5">
        {label}
      </p>
      <p className="text-xl font-extrabold tracking-tight text-red-500">
        {value}
      </p>
      <p className="mt-1 text-[9px] text-zinc-500 leading-relaxed">{explain}</p>
    </div>
  )
}
