"use client";

import { useMemo } from "react";
import { DealCard } from "./deal-card";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { Briefcase } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

interface DealPipelineProps {
  deals: DealRow[];
  isLoading: boolean;
  onSelect: (deal: DealRow) => void;
  onStageDrop?: (dealId: string, newStage: string) => void;
}

const orderedStages = Object.entries(DEAL_STAGES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as DealStageKey);

export function DealPipeline({
  deals,
  isLoading,
  onSelect,
  onStageDrop,
}: DealPipelineProps) {
  const grouped = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const stage of orderedStages) {
      map[stage] = [];
    }
    for (const deal of deals) {
      const key = deal.stage as DealStageKey;
      if (map[key]) {
        map[key].push(deal);
      }
    }
    return map;
  }, [deals]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage) => (
          <div key={stage} className="min-w-[260px] flex-1">
            <div className="h-8 w-28 animate-pulse rounded bg-muted mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border bg-muted/40"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhum deal encontrado</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou adicione novos deals ao pipeline.
        </p>
      </div>
    );
  }

  function handleDragStart(e: React.DragEvent, dealId: string) {
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, stage: string) {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId && onStageDrop) {
      onStageDrop(dealId, stage);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {orderedStages.map((stage) => {
        const cfg = DEAL_STAGES[stage];
        const stageDeals = grouped[stage] ?? [];
        const stageTotal = stageDeals.reduce(
          (s, d) => s + (d.value ?? 0),
          0,
        );

        return (
          <div
            key={stage}
            className="min-w-[260px] flex-1"
            onDrop={(e) => handleDrop(e, stage)}
            onDragOver={handleDragOver}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-sm font-medium">{cfg.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({stageDeals.length})
                </span>
              </div>
              {stageTotal > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(stageTotal)}
                </span>
              )}
            </div>

            <div className="space-y-2 min-h-[60px] rounded-lg border border-dashed border-transparent transition-colors">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                >
                  <DealCard deal={deal} onClick={onSelect} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
