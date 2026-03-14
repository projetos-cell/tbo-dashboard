"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { DealCard } from "./deal-card";
import { DraggableDeal } from "./draggable-deal";
import { DroppableStageColumn } from "./droppable-stage-column";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { DEAL_STAGES } from "@/lib/constants";
import { IconBriefcase } from "@tabler/icons-react";
import { useDealPipelineDnd } from "@/features/comercial/hooks/use-deal-pipeline-dnd";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealPipelineProps {
  deals: DealRow[];
  isLoading: boolean;
  onSelect: (deal: DealRow) => void;
  onStageDrop?: (dealId: string, newStage: string) => Promise<void> | void;
}

export function DealPipeline({
  deals,
  isLoading,
  onSelect,
  onStageDrop,
}: DealPipelineProps) {
  const {
    activeDeal,
    overColumnId,
    orderedStages,
    grouped,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDealPipelineDnd({ deals, onStageDrop });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage) => (
          <div key={stage} className="min-w-[260px] flex-1">
            <div className="h-8 w-28 animate-pulse rounded bg-gray-100 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border bg-gray-100/40"
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
        <IconBriefcase className="mb-3 h-10 w-10 text-gray-500/50" />
        <p className="text-sm font-medium">Nenhum deal encontrado</p>
        <p className="text-xs text-gray-500">
          Ajuste os filtros ou adicione novos deals ao pipeline.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage) => {
          const cfg = DEAL_STAGES[stage];
          const stageDeals = grouped[stage] ?? [];
          const stageTotal = stageDeals.reduce(
            (s, d) => s + (d.value ?? 0),
            0
          );
          const isOver = overColumnId === stage;

          return (
            <div key={stage} className="min-w-[260px] flex-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-sm font-medium">{cfg.label}</span>
                  <span className="text-xs text-gray-500">
                    ({stageDeals.length})
                  </span>
                </div>
                {stageTotal > 0 && (
                  <span className="text-xs font-medium text-gray-500">
                    {formatCurrency(stageTotal)}
                  </span>
                )}
              </div>

              <DroppableStageColumn stage={stage} isOver={isOver}>
                {stageDeals.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-500">
                    {isOver ? "Soltar aqui" : "Nenhum deal"}
                  </p>
                ) : (
                  stageDeals.map((deal) => (
                    <DraggableDeal
                      key={deal.id}
                      deal={deal}
                      onSelect={onSelect}
                      isDragActive={activeDeal?.id === deal.id}
                    />
                  ))
                )}
              </DroppableStageColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div className="w-[248px] rotate-[2deg] scale-105 opacity-90 shadow-xl">
            <DealCard deal={activeDeal} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
