"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const STAGES: { key: string; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "bg-indigo-500" },
  { key: "qualificacao", label: "Qualificação", color: "bg-amber-500" },
  { key: "proposta", label: "Proposta", color: "bg-blue-500" },
  { key: "negociacao", label: "Negociação", color: "bg-purple-500" },
  { key: "fechado_ganho", label: "Ganho", color: "bg-emerald-500" },
];

function fmtCurrency(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

interface PipelineCardProps {
  deals: DealRow[];
}

export function PipelineCard({ deals = [] }: PipelineCardProps) {
  const activeDeals = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido"
  );
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const wonDeals = deals.filter((d) => d.stage === "fechado_ganho");
  const wonValue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);

  const stageCounts = STAGES.map((stage) => ({
    ...stage,
    count: deals.filter((d) => d.stage === stage.key).length,
  }));

  const maxCount = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Pipeline Comercial</p>
          <p className="text-xs text-muted-foreground">{activeDeals.length} deals ativos</p>
        </div>
        <Link
          href="/comercial"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver pipeline <IconArrowRight className="size-3" />
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Nenhum deal
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-3">
          {/* Horizontal bar chart for stages */}
          <div className="space-y-2">
            {stageCounts
              .filter((s) => s.count > 0)
              .map((stage) => (
                <div key={stage.key} className="flex items-center gap-2">
                  <span className="w-20 text-[11px] text-muted-foreground truncate">{stage.label}</span>
                  <div className="flex-1 h-5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all`}
                      style={{ width: `${(stage.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-medium">{stage.count}</span>
                </div>
              ))}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Pipeline ativo</p>
              <p className="text-base font-bold">{fmtCurrency(pipelineValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ganhos</p>
              <p className="text-base font-bold text-emerald-600">{fmtCurrency(wonValue)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
