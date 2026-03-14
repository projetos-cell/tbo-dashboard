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
import { useToast } from "@/hooks/use-toast";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const orderedStages = Object.entries(DEAL_STAGES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as DealStageKey);

interface UseDealPipelineDndOptions {
  deals: DealRow[];
  onStageDrop?: (dealId: string, newStage: string) => Promise<void> | void;
}

export function useDealPipelineDnd({
  deals,
  onStageDrop,
}: UseDealPipelineDndOptions) {
  const { toast } = useToast();
  const [localDeals, setLocalDeals] = useState<DealRow[]>(deals);
  const [activeDeal, setActiveDeal] = useState<DealRow | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<DealRow[][]>([]);
  const [isMutating, setIsMutating] = useState(false);

  // Sync localDeals from prop when not mutating (external refresh)
  useEffect(() => {
    if (!isMutating) setLocalDeals(deals);
  }, [deals, isMutating]);

  // Ctrl+Z undo
  useEffect(() => {
    function handleUndo(e: KeyboardEvent) {
      if (!((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.length > 0))
        return;
      e.preventDefault();
      const previous = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      setLocalDeals(previous);
      if (onStageDrop) {
        for (const deal of previous) {
          const current = localDeals.find((d) => d.id === deal.id);
          if (current && current.stage !== deal.stage) {
            onStageDrop(deal.id, deal.stage as string);
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

  const grouped = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const stage of orderedStages) map[stage] = [];
    for (const deal of localDeals) {
      const key = deal.stage as DealStageKey;
      if (map[key]) map[key].push(deal);
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
      const overData = over.data.current;
      const targetStage =
        overData?.type === "column"
          ? (overData.stage as string)
          : (localDeals.find((d) => d.id === over.id)?.stage ??
            (over.id as string));

      const deal = localDeals.find((d) => d.id === dealId);
      if (!deal || deal.stage === targetStage) return;

      // 1. Push to undo stack (max 20)
      setUndoStack((prev) => [...prev.slice(-19), [...localDeals]]);

      // 2. Optimistic update
      setLocalDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
      );

      // 3. Persist with rollback on error
      setIsMutating(true);
      try {
        await onStageDrop(dealId, targetStage);
      } catch {
        setLocalDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))
        );
        setUndoStack((prev) => prev.slice(0, -1));
        toast({
          title: "Erro ao mover deal",
          description: "Não foi possível salvar a mudança. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsMutating(false);
      }
    },
    [localDeals, onStageDrop, toast]
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
