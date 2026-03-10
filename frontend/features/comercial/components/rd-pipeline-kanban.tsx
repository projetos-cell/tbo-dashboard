"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { DealCard } from "./deal-card";
import { DraggableDeal } from "./draggable-deal";
import { DroppableStageColumn } from "./droppable-stage-column";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { Briefcase } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import type { RdPipelineStage } from "@/features/comercial/services/commercial";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface RdPipelineKanbanProps {
  deals: DealRow[];
  stages: RdPipelineStage[];
  isLoading: boolean;
  onSelect: (deal: DealRow) => void;
  onStageDrop?: (dealId: string, newStageId: string, newStageName: string) => Promise<void> | void;
}

// Generate consistent colors for RD stages
const STAGE_COLORS = [
  "#6366f1", "#f59e0b", "#3b82f6", "#8b5cf6", "#0ea5e9",
  "#10b981", "#f97316", "#ec4899", "#14b8a6", "#22c55e",
  "#ef4444", "#64748b",
];

function getStageColor(index: number): string {
  return STAGE_COLORS[index % STAGE_COLORS.length];
}

export function RdPipelineKanban({
  deals,
  stages,
  isLoading,
  onSelect,
  onStageDrop,
}: RdPipelineKanbanProps) {
  const [localDeals, setLocalDeals] = useState<DealRow[]>(deals);
  const [activeDeal, setActiveDeal] = useState<DealRow | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<DealRow[][]>([]);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (!isMutating) {
      setLocalDeals(deals);
    }
  }, [deals, isMutating]);

  // Ctrl+Z undo handler
  useEffect(() => {
    function handleUndo(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.length > 0) {
        e.preventDefault();
        const previous = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));
        setLocalDeals(previous);
        if (onStageDrop) {
          for (const deal of previous) {
            const current = localDeals.find((d) => d.id === deal.id);
            if (
              current &&
              (current as Record<string, unknown>).rd_stage_id !==
                (deal as Record<string, unknown>).rd_stage_id
            ) {
              const rdStageId = (deal as Record<string, unknown>).rd_stage_id as string;
              const rdStageName = (deal as Record<string, unknown>).rd_stage_name as string;
              onStageDrop(deal.id, rdStageId, rdStageName);
            }
          }
        }
      }
    }
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [undoStack, localDeals, onStageDrop]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const orderedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  );

  const grouped = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const stage of orderedStages) {
      map[stage.id] = [];
    }
    // Add an "unmatched" bucket for deals whose rd_stage_id doesn't match any stage
    map["__unmatched__"] = [];

    for (const deal of localDeals) {
      const dealRdStageId = (deal as Record<string, unknown>).rd_stage_id as
        | string
        | null;
      if (dealRdStageId && map[dealRdStageId]) {
        map[dealRdStageId].push(deal);
      } else {
        map["__unmatched__"].push(deal);
      }
    }
    return map;
  }, [localDeals, orderedStages]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = localDeals.find((d) => d.id === event.active.id);
      if (deal) setActiveDeal(deal);
    },
    [localDeals],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setOverColumnId(null);
        return;
      }
      const overData = over.data.current;
      if (overData?.type === "column") {
        setOverColumnId(overData.stage as string);
      } else {
        const overDeal = localDeals.find((d) => d.id === over.id);
        const overDealStageId = overDeal
          ? ((overDeal as Record<string, unknown>).rd_stage_id as string)
          : (over.id as string);
        setOverColumnId(overDealStageId);
      }
    },
    [localDeals],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDeal(null);
      setOverColumnId(null);

      if (!over || !onStageDrop) return;

      const dealId = active.id as string;
      let targetStageId: string;

      const overData = over.data.current;
      if (overData?.type === "column") {
        targetStageId = overData.stage as string;
      } else {
        const overDeal = localDeals.find((d) => d.id === over.id);
        targetStageId = overDeal
          ? ((overDeal as Record<string, unknown>).rd_stage_id as string)
          : (over.id as string);
      }

      const deal = localDeals.find((d) => d.id === dealId);
      if (!deal) return;
      const currentStageId = (deal as Record<string, unknown>)
        .rd_stage_id as string;
      if (currentStageId === targetStageId) return;

      const targetStage = orderedStages.find((s) => s.id === targetStageId);
      if (!targetStage) return;

      // 1. Push undo
      setUndoStack((prev) => [...prev.slice(-19), [...localDeals]]);

      // 2. Optimistic update
      setLocalDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? {
                ...d,
                rd_stage_id: targetStageId,
                rd_stage_name: targetStage.name,
              } as typeof d
            : d,
        ),
      );

      // 3. Persist
      setIsMutating(true);
      try {
        await onStageDrop(dealId, targetStageId, targetStage.name);
      } catch {
        setLocalDeals((prev) =>
          prev.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  rd_stage_id: currentStageId,
                  rd_stage_name: (deal as Record<string, unknown>)
                    .rd_stage_name as string,
                } as typeof d
              : d,
          ),
        );
        setUndoStack((prev) => prev.slice(0, -1));
      } finally {
        setIsMutating(false);
      }
    },
    [localDeals, onStageDrop, orderedStages],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDeal(null);
    setOverColumnId(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {(orderedStages.length > 0 ? orderedStages : Array.from({ length: 5 })).map(
          (_, i) => (
            <div key={i} className="min-w-[260px] flex-1">
              <div className="h-8 w-28 animate-pulse rounded bg-gray-100 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-24 animate-pulse rounded-lg border bg-gray-100/40"
                  />
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Briefcase className="mb-3 h-10 w-10 text-gray-500/50" />
        <p className="text-sm font-medium">Nenhum deal neste funil</p>
        <p className="text-xs text-gray-500">
          Sincronize o RD Station para importar deals.
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
        {orderedStages.map((stage, idx) => {
          const stageDeals = grouped[stage.id] ?? [];
          const stageTotal = stageDeals.reduce(
            (s, d) => s + (d.value ?? 0),
            0,
          );
          const isOver = overColumnId === stage.id;
          const color = getStageColor(idx);

          return (
            <div key={stage.id} className="min-w-[260px] flex-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{stage.name}</span>
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

              <DroppableStageColumn stage={stage.id} isOver={isOver}>
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

        {/* Unmatched deals (stage doesn't match any pipeline stage) */}
        {(grouped["__unmatched__"]?.length ?? 0) > 0 && (
          <div className="min-w-[260px] flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-gray-500">
                Sem etapa
              </span>
              <span className="text-xs text-gray-500">
                ({grouped["__unmatched__"].length})
              </span>
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
