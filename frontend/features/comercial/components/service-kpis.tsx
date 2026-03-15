"use client";

import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";
import { computeServiceKPIs } from "@/features/comercial/services/services-catalog";

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface ServiceKPIsProps {
  services: ServiceRow[];
}

export function ServiceKPIs({ services }: ServiceKPIsProps) {
  const kpis = computeServiceKPIs(services);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="Servicos ativos"
        value={String(kpis.active)}
        sub={`${kpis.draft} rascunho · ${kpis.archived} arquivado`}
      />
      <KPICard
        label="Preco medio"
        value={formatCurrency(kpis.avgPrice)}
        sub="entre servicos ativos"
      />
      <KPICard
        label="Margem media"
        value={`${kpis.avgMargin.toFixed(1)}%`}
        sub="entre servicos ativos"
      />
      <KPICard
        label="Total cadastrado"
        value={String(kpis.total)}
        sub={Object.entries(kpis.byBU)
          .map(([bu, count]) => `${bu}: ${count}`)
          .join(" · ") || "Nenhum por BU"}
      />
    </div>
  );
}
