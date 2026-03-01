"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
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
  onStageDrop?: (dealId: string, newStage: string) => Promise<void> | void;
}

const orderedStages = Object.entries(DEAL_STAGES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as DealStageKey);

/* ─────────────────────── Draggable Deal wrapper ─────────────────────── */

function DraggableDeal({
  deal,
  onSelect,
  isDragActive,
}: {
  deal: DealRow;
  onSelect: (deal: DealRow) => void;
  isDragActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
      data: { deal, stage: deal.stage },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "z-50 opacity-50" : ""}
      {...listeners}
      {...attributes}
    >
      <DealCard deal={deal} onClick={onSelect} />
    </div>
  );
}

/* ─────────────────────── Droppable Stage Column ─────────────────────── */

function DroppableStageColumn({
  stage,
  children,
  isOver,
}: {
  stage: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: stage,
    data: { type: "column", stage },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[60px] rounded-lg p-2 transition-colors duration-200 ${
        isOver
          ? "bg-primary/10 ring-2 ring-primary/30 ring-inset"
          : "bg-muted/20"
      }`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────── Main Pipeline Component ─────────────────────── */

export function DealPipeline({
  deals,
  isLoading,
  onSelect,
  onStageDrop,
}: DealPipelineProps) {
  const [localDeals, setLocalDeals] = useState<DealRow[]>(deals);
  const [activeDeal, setActiveDeal] = useState<DealRow | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<DealRow[][]>([]);
  const [isMutating, setIsMutating] = useState(false);

  // Sync localDeals from prop when not mutating (external refresh)
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
        // Re-sync reverted state to Supabase
        if (onStageDrop) {
          for (const deal of previous) {
            const current = localDeals.find((d) => d.id === deal.id);
            if (current && current.stage !== deal.stage) {
              onStageDrop(deal.id, deal.stage as string);
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
    })
  );

  const grouped = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const stage of orderedStages) {
      map[stage] = [];
    }
    for (const deal of localDeals) {
      const key = deal.stage as DealStageKey;
      if (map[key]) {
        map[key].push(deal);
      }
    }
    return map;
  }, [localDeals]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = localDeals.find((d) => d.id === event.active.id);
      if (deal) setActiveDeal(deal);
    },
    [localDeals]
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
        // Hovering over a deal card -- find its stage
        const overDeal = localDeals.find((d) => d.id === over.id);
        setOverColumnId(overDeal?.stage ?? (over.id as string));
      }
    },
    [localDeals]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDeal(null);
      setOverColumnId(null);

      if (!over || !onStageDrop) return;

      const dealId = active.id as string;
      let targetStage: string;

      const overData = over.data.current;
      if (overData?.type === "column") {
        targetStage = overData.stage as string;
      } else {
        const overDeal = localDeals.find((d) => d.id === over.id);
        targetStage = overDeal?.stage ?? (over.id as string);
      }

      const deal = localDeals.find((d) => d.id === dealId);
      if (!deal || deal.stage === targetStage) return;

      // 1. Push current state to undo stack (max 20 entries)
      setUndoStack((prev) => [...prev.slice(-19), [...localDeals]]);

      // 2. Optimistic update -- modify local state immediately
      setLocalDeals((prev) =>
        prev.map((d) =>
          d.id === dealId ? { ...d, stage: targetStage } : d
        )
      );

      // 3. Persist to Supabase with rollback on error
      setIsMutating(true);
      try {
        await onStageDrop(dealId, targetStage);
      } catch {
        // Rollback: restore previous local state from undo stack
        setLocalDeals((prev) => {
          const restored = prev.map((d) =>
            d.id === dealId ? { ...d, stage: deal.stage } : d
          );
          return restored;
        });
        // Remove the entry we just pushed
        setUndoStack((prev) => prev.slice(0, -1));
      } finally {
        setIsMutating(false);
      }
    },
    [localDeals, onStageDrop]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDeal(null);
    setOverColumnId(null);
  }, []);

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

              <DroppableStageColumn stage={stage} isOver={isOver}>
                {stageDeals.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
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

      {/* Drag overlay for smooth movement */}
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
