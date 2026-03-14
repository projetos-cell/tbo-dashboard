"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import type { Database } from "@/lib/supabase/types";
import type { RdPipelineStage } from "@/features/comercial/services/commercial";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface UsePipelineDndOptions {
  deals: DealRow[];
  stages: RdPipelineStage[];
  onStageDrop?: (dealId: string, newStageId: string, newStageName: string) => Promise<void> | void;
}

export function usePipelineDnd({ deals, stages, onStageDrop }: UsePipelineDndOptions) {
  const [localDeals, setLocalDeals] = useState<DealRow[]>(deals);
  const [activeDeal, setActiveDeal] = useState<DealRow | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<DealRow[][]>([]);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (!isMutating) setLocalDeals(deals);
  }, [deals, isMutating]);

  // Ctrl+Z undo
  useEffect(() => {
    function handleUndo(e: KeyboardEvent) {
      if (!((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.length > 0)) return;
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
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [undoStack, localDeals, onStageDrop]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const orderedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );

  const grouped = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const stage of orderedStages) map[stage.id] = [];
    map["__unmatched__"] = [];
    for (const deal of localDeals) {
      const stageId = (deal as Record<string, unknown>).rd_stage_id as string | null;
      if (stageId && map[stageId]) map[stageId].push(deal);
      else map["__unmatched__"].push(deal);
    }
    return map;
  }, [localDeals, orderedStages]);

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
      if (!over) { setOverColumnId(null); return; }
      const overData = over.data.current;
      if (overData?.type === "column") {
        setOverColumnId(overData.stage as string);
      } else {
        const overDeal = localDeals.find((d) => d.id === over.id);
        setOverColumnId(
          overDeal
            ? ((overDeal as Record<string, unknown>).rd_stage_id as string)
            : (over.id as string)
        );
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
      const overData = over.data.current;
      let targetStageId: string;
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
      const currentStageId = (deal as Record<string, unknown>).rd_stage_id as string;
      if (currentStageId === targetStageId) return;

      const targetStage = orderedStages.find((s) => s.id === targetStageId);
      if (!targetStage) return;

      setUndoStack((prev) => [...prev.slice(-19), [...localDeals]]);
      setLocalDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? { ...d, rd_stage_id: targetStageId, rd_stage_name: targetStage.name } as typeof d
            : d
        )
      );

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
                  rd_stage_name: (deal as Record<string, unknown>).rd_stage_name as string,
                } as typeof d
              : d
          )
        );
        setUndoStack((prev) => prev.slice(0, -1));
      } finally {
        setIsMutating(false);
      }
    },
    [localDeals, onStageDrop, orderedStages]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDeal(null);
    setOverColumnId(null);
  }, []);

  return {
    localDeals,
    activeDeal,
    overColumnId,
    orderedStages,
    grouped,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
