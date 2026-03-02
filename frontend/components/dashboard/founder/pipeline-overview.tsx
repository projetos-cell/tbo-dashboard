"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface Props {
  deals: DealRow[];
}

// Pipeline stages in funnel order (exclude closed stages)
const PIPELINE_STAGES: { key: DealStageKey; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "bg-indigo-100 text-indigo-700" },
  { key: "qualificacao", label: "Qualificação", color: "bg-amber-100 text-amber-700" },
  { key: "proposta", label: "Proposta", color: "bg-blue-100 text-blue-700" },
  { key: "negociacao", label: "Negociação", color: "bg-purple-100 text-purple-700" },
  { key: "fechado_ganho", label: "Ganho", color: "bg-green-100 text-green-700" },
  { key: "fechado_perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PipelineOverview({ deals = [] }: Props) {
  const stages = PIPELINE_STAGES.map((stage) => {
    const items = deals.filter((d) => d.stage === stage.key);
    const value = items.reduce((sum, d) => sum + (d.value ?? 0), 0);
    return { ...stage, count: items.length, value };
  });

  const activeDeals = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido"
  );
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pipeline CRM</CardTitle>
        <Link
          href="/comercial"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver pipeline
        </Link>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum deal no pipeline
          </p>
        ) : (
          <div className="space-y-3">
            {/* Visual funnel */}
            <div className="flex gap-1">
              {stages
                .filter((s) => s.count > 0)
                .map((stage) => (
                  <div
                    key={stage.key}
                    className="flex-1 text-center"
                    style={{
                      flex: Math.max(stage.count / deals.length, 0.1),
                    }}
                  >
                    <div
                      className={`rounded-md py-2 text-xs font-medium ${stage.color}`}
                    >
                      {stage.count}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {stage.label}
                    </p>
                  </div>
                ))}
            </div>

            {/* Summary row */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pipeline ativo
                </p>
                <p className="text-sm font-bold">
                  {formatCurrency(pipelineValue)}
                </p>
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {activeDeals.length} deals
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
