"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { DEMAND_STATUS, DEMAND_BOARD_COLUMNS } from "@/lib/constants";
import { useUpdateDemand, useDeleteDemand } from "@/features/demands/hooks/use-demands";
import {
  DemandCard,
  DraggableDemandCard,
  DroppableColumn,
  normalize,
  type DemandRow,
} from "./demand-board-card";

interface DemandsBoardProps {
  demands: DemandRow[];
  onSelect: (demand: DemandRow) => void;
}

export function DemandsBoard({ demands, onSelect }: DemandsBoardProps) {
  const updateDemand = useUpdateDemand();
  const deleteDemand = useDeleteDemand();
  const [localDemands, setLocalDemands] = useState(demands);
  const [activeDemand, setActiveDemand] = useState<DemandRow | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<DemandRow[][]>([]);
  const isMutatingRef = useRef(false);

  // Ctrl+Z undo handler
  useEffect(() => {
    function handleUndo(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.length > 0) {
        e.preventDefault();
        const previous = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));
        setLocalDemands(previous);
        for (const demand of previous) {
          const current = localDemands.find((d) => d.id === demand.id);
          if (current && current.status !== demand.status) {
            updateDemand.mutate({
              id: demand.id,
              updates: { status: demand.status, feito: demand.feito },
            });
          }
        }
      }
    }
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [undoStack, localDemands, updateDemand]);

  // Sync from props when not mutating
  useEffect(() => {
    if (!isMutatingRef.current) {
      setLocalDemands(demands);
    }
  }, [demands]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columnDemands = useMemo(() => {
    const map: Record<string, DemandRow[]> = {};
    for (const status of DEMAND_BOARD_COLUMNS) map[status] = [];
    for (const d of localDemands) {
      const col = normalize(d.status);
      if (map[col]) map[col].push(d);
    }
    return map;
  }, [localDemands]);

  const handleStatusChange = useCallback(
    (demandId: string, newStatus: string) => {
      const feito = newStatus === "Concluido" || newStatus === "Concluído";
      setUndoStack((prev) => [...prev.slice(-19), [...localDemands]]);
      isMutatingRef.current = true;
      setLocalDemands((prev) =>
        prev.map((d) => (d.id === demandId ? { ...d, status: newStatus, feito } : d))
      );
      updateDemand.mutate(
        { id: demandId, updates: { status: newStatus, feito } },
        { onSettled: () => { isMutatingRef.current = false; } }
      );
    },
    [updateDemand, localDemands]
  );

  const handlePriorityChange = useCallback(
    (demandId: string, prioridade: string) => {
      isMutatingRef.current = true;
      setLocalDemands((prev) =>
        prev.map((d) => (d.id === demandId ? { ...d, prioridade } : d))
      );
      updateDemand.mutate(
        { id: demandId, updates: { prioridade } },
        { onSettled: () => { isMutatingRef.current = false; } }
      );
    },
    [updateDemand]
  );

  const handleDelete = useCallback(
    (demandId: string) => {
      isMutatingRef.current = true;
      setLocalDemands((prev) => prev.filter((d) => d.id !== demandId));
      deleteDemand.mutate(demandId, {
        onSettled: () => { isMutatingRef.current = false; },
      });
    },
    [deleteDemand]
  );

  function handleDragStart(event: DragStartEvent) {
    const demand = localDemands.find((d) => d.id === event.active.id);
    if (demand) setActiveDemand(demand);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) { setOverColumnId(null); return; }
    const overData = over.data.current;
    if (overData?.type === "column") {
      setOverColumnId(overData.status as string);
      return;
    }
    const overDemand = localDemands.find((d) => d.id === over.id);
    setOverColumnId(overDemand ? normalize(overDemand.status) : (over.id as string));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDemand(null);
    setOverColumnId(null);
    if (!over) return;

    const overData = over.data.current;
    const targetStatus = overData?.type === "column"
      ? (overData.status as string)
      : normalize(localDemands.find((d) => d.id === over.id)?.status ?? (over.id as string));

    const demand = localDemands.find((d) => d.id === active.id);
    if (!demand || normalize(demand.status) === targetStatus) return;
    handleStatusChange(active.id as string, targetStatus);
  }

  function handleDragCancel() {
    setActiveDemand(null);
    setOverColumnId(null);
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
      <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
        {DEMAND_BOARD_COLUMNS.map((status) => {
          const cfg = DEMAND_STATUS[status];
          const colDemands = columnDemands[status] ?? [];
          const isOver = overColumnId === status;

          return (
            <div key={status} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cfg?.color }}
                />
                <h3 className="text-sm font-semibold">{cfg?.label ?? status}</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {colDemands.length}
                </Badge>
              </div>

              <DroppableColumn status={status} isOver={isOver}>
                {colDemands.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-500">
                    {isOver ? "Soltar aqui" : "Nenhuma demanda"}
                  </p>
                ) : (
                  colDemands.map((demand) => (
                    <DraggableDemandCard
                      key={demand.id}
                      demand={demand}
                      onClick={() => onSelect(demand)}
                      onStatusChange={(s) => handleStatusChange(demand.id, s)}
                      onPriorityChange={(p) => handlePriorityChange(demand.id, p)}
                      onDelete={() => handleDelete(demand.id)}
                      isDragActive={activeDemand?.id === demand.id}
                    />
                  ))
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDemand ? (
          <div className="w-[264px] rotate-[2deg] scale-105 opacity-90 shadow-xl">
            <DemandCard
              demand={activeDemand}
              onStatusChange={() => {}}
              onPriorityChange={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
