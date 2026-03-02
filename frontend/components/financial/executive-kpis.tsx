"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Flame,
  Clock,
  Percent,
} from "lucide-react";
import { formatBRL, formatBRLCompact, formatPct, formatMonths } from "@/lib/format";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { ExecutiveKPIs, HealthStatus } from "@/services/financial";
import { getKPIHealthStatus } from "@/services/financial";

interface ExecutiveKPIsProps {
  kpis: ExecutiveKPIs;
  masked?: boolean;
}

const healthColors: Record<HealthStatus, string> = {
  saudavel: "border-l-green-500",
  atencao: "border-l-yellow-500",
  critico: "border-l-red-500",
};

const healthDot: Record<HealthStatus, string> = {
  saudavel: "bg-green-500",
  atencao: "bg-yellow-500",
  critico: "bg-red-500",
};

// Stagger animation variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface KPICardData {
  label: string;
  numericValue: number;
  formatFn: (n: number) => string;
  maskedDisplay: string;
  icon: React.ElementType;
  iconColor: string;
  variation: number | null;
  health: HealthStatus;
  sub: string;
}

export function ExecutiveKPICards({ kpis, masked = false }: ExecutiveKPIsProps) {
  const fmtCompact = useCallback(
    (n: number) => formatBRLCompact(n),
    []
  );
  const fmtPctVal = useCallback(
    (n: number) => `${n.toFixed(1)}%`,
    []
  );
  const fmtMonths = useCallback(
    (n: number) => formatMonths(n),
    []
  );

  const cards: KPICardData[] = [
    {
      label: "Caixa Atual",
      numericValue: kpis.currentCash,
      formatFn: fmtCompact,
      maskedDisplay: "R$ ****",
      icon: DollarSign,
      iconColor: "text-blue-500",
      variation: null,
      health: getKPIHealthStatus("cash", kpis.currentCash),
      sub: masked ? "****" : formatBRL(kpis.currentCash),
    },
    {
      label: "Receita do Mes",
      numericValue: kpis.monthRevenue,
      formatFn: fmtCompact,
      maskedDisplay: "R$ ****",
      icon: ArrowUpCircle,
      iconColor: "text-green-500",
      variation: kpis.revenueVariation,
      health: "saudavel",
      sub: kpis.prevMonthRevenue > 0
        ? `Anterior: ${formatBRLCompact(kpis.prevMonthRevenue, masked)}`
        : "Sem dados do mes anterior",
    },
    {
      label: "Despesa do Mes",
      numericValue: kpis.monthExpenses,
      formatFn: fmtCompact,
      maskedDisplay: "R$ ****",
      icon: ArrowDownCircle,
      iconColor: "text-red-500",
      variation: kpis.expenseVariation,
      health: "saudavel",
      sub: kpis.prevMonthExpenses > 0
        ? `Anterior: ${formatBRLCompact(kpis.prevMonthExpenses, masked)}`
        : "Sem dados do mes anterior",
    },
    {
      label: "Margem Liquida",
      numericValue: kpis.netMarginPct,
      formatFn: fmtPctVal,
      maskedDisplay: "****",
      icon: Percent,
      iconColor: "text-purple-500",
      variation: kpis.marginVariation,
      health: getKPIHealthStatus("margin", kpis.netMarginPct),
      sub: masked
        ? "****"
        : `Resultado: ${formatBRLCompact(kpis.monthRevenue - kpis.monthExpenses)}`,
    },
    {
      label: "Burn Rate",
      numericValue: kpis.burnRate,
      formatFn: fmtCompact,
      maskedDisplay: "R$ ****",
      icon: Flame,
      iconColor: "text-orange-500",
      variation: kpis.burnRateVariation,
      health: getKPIHealthStatus("burnRate", kpis.burnRateVariation),
      sub: "Media ultimos 3 meses",
    },
    {
      label: "Runway",
      numericValue: kpis.runway,
      formatFn: fmtMonths,
      maskedDisplay: "****",
      icon: Clock,
      iconColor: "text-cyan-500",
      variation: null,
      health: getKPIHealthStatus("runway", kpis.runway),
      sub: masked ? "****" : `Caixa / Burn Rate`,
    },
  ];

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {cards.map((c) => (
        <motion.div key={c.label} variants={cardVariant}>
          <Card className={`border-l-4 ${healthColors[c.health]} h-full`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {c.label}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${healthDot[c.health]}`}
                    title={c.health}
                  />
                  <c.icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
              </div>
              <p className="text-xl font-bold truncate">
                {masked ? (
                  c.maskedDisplay
                ) : (
                  <AnimatedNumber
                    value={c.numericValue}
                    format={c.formatFn}
                  />
                )}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground truncate">
                  {c.sub}
                </p>
                {c.variation !== null && (
                  <span
                    className={`inline-flex items-center text-xs font-medium ${
                      c.variation >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {c.variation >= 0 ? (
                      <TrendingUp className="mr-0.5 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3 w-3" />
                    )}
                    {formatPct(c.variation)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
