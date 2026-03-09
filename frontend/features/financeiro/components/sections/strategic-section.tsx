"use client";

import dynamic from "next/dynamic";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt } from "@/features/financeiro/lib/formatters";

const MonthlyTrendChart = dynamic(
  () =>
    import(
      "@/features/founder-dashboard/components/monthly-trend-chart"
    ).then((m) => ({ default: m.MonthlyTrendChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-lg bg-gray-100" />
    ),
  }
);

const CashWaterfallChart = dynamic(
  () =>
    import(
      "@/features/founder-dashboard/components/cash-waterfall-chart"
    ).then((m) => ({ default: m.CashWaterfallChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] animate-pulse rounded-lg bg-gray-100" />
    ),
  }
);

interface Props {
  d: FounderDashboardSnapshot | undefined;
  isLoading: boolean;
  effectiveCaixa: number;
  effectiveCaixaPrevisto30d: number;
}

export function StrategicSection({
  d,
  isLoading,
  effectiveCaixa,
  effectiveCaixaPrevisto30d,
}: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Estratégico
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold mb-1">
            Evolução Mensal (6 meses)
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Receita · Despesa · Margem — mês atual inclui dados parciais
          </p>
          {isLoading ? (
            <div className="h-[220px] animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <MonthlyTrendChart data={d?.monthlyTrend ?? []} />
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold mb-1">
            Projeção de Caixa — 30d
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Caixa atual → +AR pendente → −AP pendente = Saldo previsto
          </p>
          {isLoading ? (
            <div className="h-[200px] animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <CashWaterfallChart
              caixaAtual={effectiveCaixa}
              arNext30={d?.arNext30 ?? 0}
              apNext30={d?.apNext30 ?? 0}
            />
          )}
          {d && !isLoading && (
            <div className="mt-3 flex justify-between text-xs text-gray-500 border-t pt-2">
              <span>
                AR:{" "}
                <span className="text-emerald-500 font-medium">
                  {fmt(d.arNext30)}
                </span>
              </span>
              <span>
                AP:{" "}
                <span className="text-rose-500 font-medium">
                  {fmt(d.apNext30)}
                </span>
              </span>
              <span>
                Saldo:{" "}
                <span
                  className={
                    effectiveCaixaPrevisto30d >= 0
                      ? "text-blue-500 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {fmt(effectiveCaixaPrevisto30d)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
