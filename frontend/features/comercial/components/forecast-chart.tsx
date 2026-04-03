"use client";

import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { ForecastMonth, ForecastSummary } from "@/features/comercial/lib/forecast";

interface ForecastChartProps {
  data: ForecastSummary;
}

const COLORS = {
  pessimista: "#22c55e",
  realista: "#3b82f6",
  otimista: "#e2e8f0",
};

export function ForecastChart({ data }: ForecastChartProps) {
  const { months } = data;
  if (months.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">
        Sem dados de forecast. Preencha <code>expected_close</code> nos deals.
      </div>
    );
  }

  const maxVal = Math.max(...months.map((m) => m.otimista), 1);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        {([
          ["Pessimista (>70%)", COLORS.pessimista],
          ["Realista (ponderado)", COLORS.realista],
          ["Otimista (total)", COLORS.otimista],
        ] as const).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {months.map((month) => (
          <ForecastBar key={month.month} month={month} maxVal={maxVal} />
        ))}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Pessimista</p>
          <p className="text-sm font-semibold tabular-nums" style={{ color: COLORS.pessimista }}>
            {formatCurrency(data.totalPessimista)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Realista</p>
          <p className="text-sm font-semibold tabular-nums" style={{ color: COLORS.realista }}>
            {formatCurrency(data.totalRealista)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Otimista</p>
          <p className="text-sm font-semibold tabular-nums text-gray-700">
            {formatCurrency(data.totalOtimista)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ForecastBar({ month, maxVal }: { month: ForecastMonth; maxVal: number }) {
  const pctOtimista = (month.otimista / maxVal) * 100;
  const pctRealista = (month.realista / maxVal) * 100;
  const pctPessimista = (month.pessimista / maxVal) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14 shrink-0 tabular-nums">{month.label}</span>
      <div className="flex-1 relative h-6">
        {/* Otimista (background) */}
        <div
          className="absolute top-0 left-0 h-full rounded-md transition-all duration-300"
          style={{ width: `${pctOtimista}%`, backgroundColor: COLORS.otimista }}
        />
        {/* Realista */}
        <div
          className="absolute top-0 left-0 h-full rounded-md transition-all duration-300"
          style={{ width: `${pctRealista}%`, backgroundColor: COLORS.realista, opacity: 0.7 }}
        />
        {/* Pessimista */}
        <div
          className="absolute top-0 left-0 h-full rounded-md transition-all duration-300"
          style={{ width: `${pctPessimista}%`, backgroundColor: COLORS.pessimista, opacity: 0.8 }}
        />
        {/* Label */}
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-[10px] font-medium text-white drop-shadow-sm">
            {formatCurrency(month.realista)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">{month.dealCount}d</span>
    </div>
  );
}

// ── Compact forecast card for hub ───────────────────────────────────────────

interface ForecastCardProps {
  data: ForecastSummary;
}

export function ForecastCompactCard({ data }: ForecastCardProps) {
  const { currentMonth } = data;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">Forecast do mes (realista)</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: "#3b82f6" }}>
          {currentMonth ? formatCurrency(currentMonth.realista) : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">Cenario pessimista</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: "#22c55e" }}>
          {currentMonth ? formatCurrency(currentMonth.pessimista) : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">Cenario otimista</span>
        <span className="text-sm font-semibold tabular-nums text-gray-700">
          {currentMonth ? formatCurrency(currentMonth.otimista) : "—"}
        </span>
      </div>
      {currentMonth && (
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-1">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${currentMonth.otimista > 0 ? (currentMonth.realista / currentMonth.otimista) * 100 : 0}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
