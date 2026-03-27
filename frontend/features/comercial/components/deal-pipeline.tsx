"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { DealCard } from "./deal-card";
import { DraggableDeal } from "./draggable-deal";
import { DroppableStageColumn } from "./droppable-stage-column";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import { IconBriefcase, IconArrowsSort, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDealPipelineDnd } from "@/features/comercial/hooks/use-deal-pipeline-dnd";
import { AddStageDialog } from "./add-stage-dialog";
import type { CrmStageRow } from "@/features/comercial/services/commercial";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

type SortKey = "updated_at" | "value_desc" | "value_asc" | "probability" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated_at", label: "Mais recente" },
  { key: "value_desc", label: "Maior valor" },
  { key: "value_asc", label: "Menor valor" },
  { key: "probability", label: "Probabilidade" },
  { key: "name", label: "Nome A-Z" },
];

function sortDeals(deals: DealRow[], sortKey: SortKey): DealRow[] {
  const sorted = [...deals];
  switch (sortKey) {
    case "value_desc":
      return sorted.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    case "value_asc":
      return sorted.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    case "probability":
      return sorted.sort((a, b) => (b.probability ?? 0) - (a.probability ?? 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "updated_at":
    default:
      return sorted.sort((a, b) =>
        new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime()
      );
  }
}

interface DealPipelineProps {
  deals: DealRow[];
  isLoading: boolean;
  onSelect: (deal: DealRow) => void;
  onStageDrop?: (dealId: string, newStage: string) => Promise<void> | void;
  bulkMode?: boolean;
  selectedIds?: Set<string>;
  onBulkToggle?: (dealId: string, checked: boolean) => void;
  onQuickUpdate?: (dealId: string, field: string, value: unknown) => void;
  customStages?: CrmStageRow[];
  onCreateDeal?: () => void;
}

export function DealPipeline({
  deals,
  isLoading,
  onSelect,
  onStageDrop,
  bulkMode,
  selectedIds,
  onBulkToggle,
  onQuickUpdate,
  customStages,
  onCreateDeal,
}: DealPipelineProps) {
  const [columnSort, setColumnSort] = useState<SortKey>("updated_at");
  const [addStageOpen, setAddStageOpen] = useState(false);

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
  } = useDealPipelineDnd({ deals, onStageDrop, customStages });

  // Build stage config map (constants + custom from Supabase)
  const stageConfigMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; bg: string }>();
    for (const [key, cfg] of Object.entries(DEAL_STAGES)) {
      map.set(key, { label: cfg.label, color: cfg.color, bg: cfg.bg });
    }
    if (customStages) {
      for (const s of customStages) {
        map.set(s.id, {
          label: s.label,
          color: s.color ?? "#6b7280",
          bg: s.bg ?? "rgba(107,114,128,0.12)",
        });
      }
    }
    return map;
  }, [customStages]);

  // Apply sorting to each stage group
  const sortedGrouped = useMemo(() => {
    const result: Record<string, DealRow[]> = {};
    for (const [stage, stageDeals] of Object.entries(grouped)) {
      result[stage] = sortDeals(stageDeals, columnSort);
    }
    return result;
  }, [grouped, columnSort]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {orderedStages.map((stage, colIdx) => (
          <div
            key={stage}
            className="min-w-[240px] sm:min-w-[260px] flex-1"
            style={{ opacity: 0, animation: `fadeSlideIn 0.3s ease-out ${colIdx * 60}ms forwards` }}
          >
            <div className="h-8 w-28 animate-pulse rounded bg-gray-100 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[100px] animate-pulse rounded-lg border bg-gray-100/40"
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
    <div className="space-y-2">
      {/* Sort control */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 gap-1.5">
              <IconArrowsSort className="h-3.5 w-3.5" />
              {SORT_OPTIONS.find((o) => o.key === columnSort)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.key}
                onClick={() => setColumnSort(opt.key)}
                className={columnSort === opt.key ? "font-medium" : ""}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="Pipeline de deals">
          {orderedStages.map((stage) => {
            const cfg = stageConfigMap.get(stage) ?? { label: stage, color: "#6b7280", bg: "rgba(107,114,128,0.12)" };
            const stageDeals = sortedGrouped[stage] ?? [];
            const stageTotal = stageDeals.reduce(
              (s, d) => s + (d.value ?? 0),
              0
            );
            const isOver = overColumnId === stage;

            return (
              <div key={stage} className="min-w-[240px] sm:min-w-[260px] flex-1" role="group" aria-label={cfg.label}>
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

                <DroppableStageColumn stage={stage} isOver={isOver} label={cfg.label}>
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

          {/* Add stage column */}
          <div className="min-w-[120px] flex items-start justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-400 hover:text-gray-600 gap-1"
              onClick={() => setAddStageOpen(true)}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Etapa
            </Button>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal ? (
            <div className="w-[248px] rotate-[2deg] scale-105 opacity-90 shadow-xl">
              <DealCard deal={activeDeal} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddStageDialog
        open={addStageOpen}
        onOpenChange={setAddStageOpen}
        existingStageCount={orderedStages.length}
      />
    </div>
  );
}
