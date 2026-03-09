"use client";

import { useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import {
  PeriodFilter,
  type PeriodValue,
} from "@/features/founder-dashboard/components/period-filter";
import { ClientMarginTable } from "@/features/financeiro/components/sections/client-margin-table";

function MargensContent() {
  const [period, setPeriod] = useState<PeriodValue>({ preset: "ytd" });
  const { data: d, isLoading } = useFounderDashboard(period);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Margens por Cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Receita vs custos diretos atribuídos via projetos no período.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <ClientMarginTable clientMargins={d?.clientMargins ?? []} />
      )}
    </div>
  );
}

export default function MargensPage() {
  return (
    <RBACGuard minRole="diretoria">
      <MargensContent />
    </RBACGuard>
  );
}
