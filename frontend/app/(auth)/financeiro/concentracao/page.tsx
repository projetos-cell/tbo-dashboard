"use client";

import dynamic from "next/dynamic";
import { RBACGuard } from "@/components/rbac-guard";
import { useRevenueConcentrationByClient } from "@/features/financeiro/hooks/use-finance";

const RevenueConcentrationChart = dynamic(
  () =>
    import(
      "@/features/financeiro/components/revenue-concentration-chart"
    ).then((m) => ({ default: m.RevenueConcentrationChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

function ConcentracaoContent() {
  const { data: concentrationData, isLoading: concentrationLoading } =
    useRevenueConcentrationByClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Concentração de Receita
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise de concentração por cliente — risco de dependência.
        </p>
      </div>

      <RevenueConcentrationChart
        data={concentrationData}
        isLoading={concentrationLoading}
        topN={10}
      />
    </div>
  );
}

export default function ConcentracaoPage() {
  return (
    <RBACGuard minRole="diretoria">
      <ConcentracaoContent />
    </RBACGuard>
  );
}
