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
import { usePipelineDnd } from "@/features/comercial/hooks/use-pipeline-dnd";
import { IconBriefcase, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";
import type { RdPipelineStage } from "@/features/comercial/services/commercial";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

// Generate consistent colors for RD stages
const STAGE_COLORS = [
  "#6366f1", "#f59e0b", "#3b82f6", "#8b5cf6", "#0ea5e9",
  "#10b981", "#f97316", "#ec4899", "#14b8a6", "#22c55e",
  "#ef4444", "#64748b",
];
function getStageColor(index: number) { return STAGE_COLORS[index % STAGE_COLORS.length]; }

interface RdPipelineKanbanProps {
  deals: DealRow[];
  stages: RdPipelineStage[];
  isLoading: boolean;
  onSelect: (deal: DealRow) => void;
  onStageDrop?: (dealId: string, newStageId: string, newStageName: string) => Promise<void> | void;
  bulkMode?: boolean;
  selectedIds?: Set<string>;
  onBulkToggle?: (dealId: string, checked: boolean) => void;
  onQuickUpdate?: (dealId: string, field: string, value: unknown) => void;
  onCreateDeal?: () => void;
}

export function RdPipelineKanban({
  deals,
  stages,
  isLoading,
  onSelect,
  onStageDrop,
  bulkMode,
  selectedIds,
  onBulkToggle,
  onQuickUpdate,
  onCreateDeal,
}: RdPipelineKanbanProps) {
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
  } = usePipelineDnd({ deals, stages, onStageDrop });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {(orderedStages.length > 0 ? orderedStages : Array.from({ length: 5 })).map((_, i) => (
          <div key={i} className="min-w-[240px] sm:min-w-[260px] flex-1">
            <div className="h-8 w-28 animate-pulse rounded bg-gray-100 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((__, j) => (
                <div key={j} className="h-24 animate-pulse rounded-lg border bg-gray-100/40" />
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
        <p className="text-sm font-medium">Nenhum deal neste funil</p>
        <p className="text-xs text-gray-500">Crie um deal ou importe dados para começar.</p>
        {onCreateDeal && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5"
            onClick={onCreateDeal}
          >
            <IconPlus className="h-4 w-4" />
            Novo Deal
          </Button>
        )}
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
      <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="Pipeline de deals">
        {orderedStages.map((stage, idx) => {
          const stageDeals = grouped[stage.id] ?? [];
          const stageTotal = stageDeals.reduce((s, d) => s + (d.value ?? 0), 0);
          const isOver = overColumnId === stage.id;
          const color = getStageColor(idx);

          return (
            <div key={stage.id} className="min-w-[240px] sm:min-w-[260px] flex-1" role="group" aria-label={stage.name}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">{stage.name}</span>
                  <span className="text-xs text-gray-500">({stageDeals.length})</span>
                </div>
                {stageTotal > 0 && (
                  <span className="text-xs font-medium text-gray-500">
                    {formatCurrency(stageTotal)}
                  </span>
                )}
              </div>

              <DroppableStageColumn stage={stage.id} isOver={isOver} label={stage.name}>
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
                      selectable={bulkMode}
                      selected={selectedIds?.has(deal.id)}
                      onBulkToggle={onBulkToggle}
                      onQuickUpdate={onQuickUpdate}
                    />
                  ))
                )}
              </DroppableStageColumn>
            </div>
          );
        })}

        {/* Unmatched deals */}
        {(grouped["__unmatched__"]?.length ?? 0) > 0 && (
          <div className="min-w-[240px] sm:min-w-[260px] flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-gray-500">Sem etapa</span>
              <span className="text-xs text-gray-500">({grouped["__unmatched__"].length})</span>
            </div>
            <div className="space-y-2 rounded-lg border border-dashed p-2">
              {grouped["__unmatched__"].map((deal) => (
                <div key={deal.id} onClick={() => onSelect(deal)}>
                  <DealCard deal={deal} onClick={onSelect} />
                </div>
              ))}
            </div>
          </div>
        )}
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
