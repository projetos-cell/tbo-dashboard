"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

interface Props {
  demands: DemandRow[];
}

const PIPELINE_STAGES = [
  { key: "prospeccao", label: "Prospecção", color: "bg-slate-200 text-slate-700" },
  { key: "proposta", label: "Proposta", color: "bg-blue-100 text-blue-700" },
  { key: "negociacao", label: "Negociação", color: "bg-amber-100 text-amber-700" },
  { key: "fechado", label: "Fechado", color: "bg-green-100 text-green-700" },
  { key: "perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
];

export function PipelineOverview({ demands }: Props) {
  const stages = PIPELINE_STAGES.map((stage) => {
    const items = demands.filter(
      (d: Record<string, unknown>) => (d.status as string) === stage.key || (d.stage as string) === stage.key
    );
    return { ...stage, count: items.length };
  });

  const total = demands.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pipeline CRM</CardTitle>
        <a
          href="/comercial"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver pipeline
        </a>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma demanda no pipeline
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
                      flex: Math.max(stage.count / total, 0.1),
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
              <div className="text-sm text-muted-foreground">
                Total no pipeline
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {total} demandas
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
