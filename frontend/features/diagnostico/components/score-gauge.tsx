"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { LevelKey } from "../data/diagnostic-data"

interface ScoreGaugeProps {
  score: number // 0-100
  level: { name: string; cls: LevelKey }
  size?: number
}

const LEVEL_STROKE: Record<LevelKey, string> = {
  cego: "#ef4444",
  miope: "#f59e0b",
  enxerga: "#b8f724",
  domina: "#22c55e",
}

export function ScoreGauge({ score, level, size = 200 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timeout)
  }, [score])

  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius // semicircle
  const offset = circumference - (animatedScore / 100) * circumference

  const strokeColor = LEVEL_STROKE[level.cls]

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(size / 2, size / 2, radius, 180, 360)}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={describeArc(size / 2, size / 2, radius, 180, 180 + (animatedScore / 100) * 180)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor}40)`,
          }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = 180 + (tick / 100) * 180
          const rad = (angle * Math.PI) / 180
          const innerR = radius - strokeWidth / 2 - 6
          const outerR = radius - strokeWidth / 2 - 2
          return (
            <line
              key={tick}
              x1={size / 2 + innerR * Math.cos(rad)}
              y1={size / 2 + innerR * Math.sin(rad)}
              x2={size / 2 + outerR * Math.cos(rad)}
              y2={size / 2 + outerR * Math.sin(rad)}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* Score text */}
      <div
        className="absolute flex flex-col items-center"
        style={{ bottom: 12 }}
      >
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: strokeColor }}
        >
          {animatedScore}
        </span>
        <span className="text-[8px] font-medium tracking-[2px] uppercase text-zinc-400">
          de 100 pontos
        </span>
        <span
          className={cn(
            "mt-1.5 text-[9px] font-bold tracking-[1px] uppercase px-3 py-0.5 rounded-full",
            level.cls === "cego" && "bg-red-500/10 text-red-500",
            level.cls === "miope" && "bg-amber-500/10 text-amber-500",
            level.cls === "enxerga" && "bg-[#b8f724]/10 text-[#b8f724]",
            level.cls === "domina" && "bg-emerald-500/10 text-emerald-500"
          )}
        >
          {level.name}
        </span>
      </div>
    </div>
  )
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 0) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
