"use client";

import type { ClientRevenue } from "@/features/founder-dashboard/services/founder-dashboard";
import { calcHHI, getRiskLevel, toPieData, fmt } from "./revenue-concentration-helpers";
import {
  RiskBadge,
  PieLegend,
  ConcentrationDonut,
  ConcentrationLoadingSkeleton,
} from "./revenue-concentration-parts";

interface RevenueConcentrationProps {
  /** Full sorted client list (all clients, descending by receita). */
  data: ClientRevenue[];
  isLoading?: boolean;
  /** How many named slices to show before collapsing the rest into "Outros". */
  topN?: number;
  className?: string;
}

export function RevenueConcentration({
  data,
  isLoading = false,
  topN = 7,
  className = "",
}: RevenueConcentrationProps) {
  if (isLoading) return <ConcentrationLoadingSkeleton />;

  const isEmpty = data.length === 0;

  const top1Pct = data[0]?.pctTotal ?? 0;
  const top3Pct = data.slice(0, 3).reduce((s, c) => s + c.pctTotal, 0);
  const top5Pct = data.slice(0, 5).reduce((s, c) => s + c.pctTotal, 0);
  const hhi = calcHHI(data);
  const riskLevel = getRiskLevel(top3Pct);

  const pieData = toPieData(data, topN);
  const totalReceita = data.reduce((s, c) => s + c.receita, 0);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-900">
          Concentração de Receita
        </h3>
        {!isEmpty && <RiskBadge level={riskLevel} />}
      </div>

      {isEmpty ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          Nenhuma receita registrada no período.
        </p>
      ) : (
        <>
          <ConcentrationDonut pieData={pieData} totalReceita={totalReceita} />

          <PieLegend slices={pieData} />

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;1</span>
                <span className="text-xs font-medium text-gray-900">
                  {top1Pct.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;3</span>
                <span
                  className={`text-xs font-medium ${
                    riskLevel === "alto"
                      ? "text-red-600 dark:text-red-400"
                      : riskLevel === "moderado"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {top3Pct.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;5</span>
                <span className="text-xs font-medium text-gray-900">
                  {top5Pct.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">HHI</span>
                <span
                  className={`text-xs font-medium ${
                    hhi > 2500
                      ? "text-red-600 dark:text-red-400"
                      : hhi > 1500
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {hhi.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {data.length} cliente{data.length !== 1 ? "s" : ""} com receita no período
            </p>
          </div>
        </>
      )}
    </div>
  );
}
