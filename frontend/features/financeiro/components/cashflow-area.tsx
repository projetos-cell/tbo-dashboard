"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useFinanceCashFlowProjection } from "@/features/financeiro/hooks/use-finance";

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const fmtCompact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 1,
});

const PERIOD_OPTIONS = [
  { label: "30 dias", value: 30 },
  { label: "60 dias", value: 60 },
  { label: "90 dias", value: 90 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg text-xs space-y-1.5">
      <p className="font-semibold text-sm">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium">{fmt.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CashflowArea() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError } = useFinanceCashFlowProjection(days);

  const points = data ?? [];

  // Compute avg daily outflow to use as burn rate threshold
  const totalOutflow = points.reduce((s, p) => s + p.outflow, 0);
  const avgDailyBurn = points.length > 0 ? totalOutflow / points.length : 0;
  const burnThreshold = avgDailyBurn * 30; // 1 month burn reserve

  // Tick every 7 days to avoid crowding
  const tickDates = points
    .filter((_, i) => i === 0 || (i + 1) % 7 === 0)
    .map((p) => p.label);

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-1 self-end">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              days === opt.value
                ? "bg-tbo-orange text-white"
                : "bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="h-[220px] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-tbo-orange border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="h-[220px] flex items-center justify-center text-sm text-red-500">
          Erro ao carregar projeção de caixa.
        </div>
      )}

      {!isLoading && !isError && points.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
          <TrendingUp className="w-8 h-8 opacity-40" />
          <p className="text-sm">Nenhum título previsto nos próximos {days} dias</p>
        </div>
      )}

      {!isLoading && !isError && points.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={points}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              ticks={tickDates}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => fmtCompact.format(v)}
              tick={{ fontSize: 10 }}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} />
            {burnThreshold > 0 && (
              <ReferenceLine
                y={burnThreshold}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: "Reserva",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#EF4444",
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="inflow"
              name="Entradas"
              stroke="#22C55E"
              strokeWidth={1.5}
              fill="url(#inflowGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="outflow"
              name="Saídas"
              stroke="#F43F5E"
              strokeWidth={1.5}
              fill="url(#outflowGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Saldo Acumulado"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#balanceGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
