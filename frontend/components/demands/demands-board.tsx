"use client";

import { useState, useCallback, useMemo } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, ExternalLink, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  DEMAND_BOARD_COLUMNS,
  BU_COLORS,
} from "@/lib/constants";
import { useUpdateDemand, useDeleteDemand } from "@/hooks/use-demands";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const normalize = (status: string | null) =>
  !status ? "Briefing" : status === "Concluido" ? "Concluido" : status;

/* ───────────────────────────── Card ───────────────────────────── */

function DemandCard({
  demand,
  onClick,
  onStatusChange,
  onPriorityChange,
  onDelete,
  isDragging,
}: {
  demand: DemandRow;
  onClick?: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
}) {
  const priCfg = demand.prioridade
    ? DEMAND_PRIORITY[demand.prioridade.toLowerCase()]
    : null;
  const isDone =
    demand.feito ||
    demand.status === "Concluido" ||
    demand.status === "Concluido";
  const overdue =
    demand.due_date &&
    !isDone &&
    demand.due_date < new Date().toISOString().split("T")[0];

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 ring-2 ring-primary/40" : ""
      }`}
      onClick={onClick}
    >
      {/* Context menu trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acoes</DropdownMenuLabel>
            <DropdownMenuItem onClick={onClick}>
              Abrir detalhes
            </DropdownMenuItem>
            {demand.notion_url && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(demand.notion_url!, "_blank");
                }}
              >
                <ExternalLink className="size-3.5 mr-2" />
                Abrir no Notion
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {Object.entries(DEMAND_STATUS)
              .filter(([key]) => key !== "Concluido")
              .map(([key, cfg]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(key);
                  }}
                >
                  <span
                    className="size-2 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
            {Object.entries(DEMAND_PRIORITY).map(([key, cfg]) => (
              <DropdownMenuItem
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onPriorityChange(key);
                }}
              >
                <span
                  className="size-2 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p
        className={`text-sm font-medium leading-tight pr-6 ${isDone ? "line-through opacity-60" : ""}`}
      >
        {demand.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {priCfg && (
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: priCfg.color }}
            title={priCfg.label}
          />
        )}
        {demand.responsible && (
          <span className="text-xs text-muted-foreground">
            {demand.responsible}
          </span>
        )}
        {demand.bus && demand.bus.length > 0 && (
          <div className="flex gap-0.5">
            {demand.bus.slice(0, 2).map((bu) => {
              const buColor = BU_COLORS[bu];
              return (
                <Badge
                  key={bu}
                  variant="secondary"
                  className="text-[9px] px-1 py-0"
                  style={
                    buColor
                      ? { backgroundColor: buColor.bg, color: buColor.color }
                      : undefined
                  }
                >
                  {bu}
                </Badge>
              );
            })}
          </div>
        )}
        {demand.due_date && (
          <span
            className={`ml-auto text-xs ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
          >
            {format(new Date(demand.due_date + "T12:00:00"), "dd MMM", {
              locale: ptBR,
            })}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Draggable Card wrapper ─────────────────────── */

function DraggableDemandCard({
  demand,
  onClick,
  onStatusChange,
  onPriorityChange,
  onDelete,
  isDragActive,
}: {
  demand: DemandRow;
  onClick?: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDelete: () => void;
  isDragActive: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: demand.id,
    data: { demand, status: normalize(demand.status) },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50" : ""}`}
    >
      {/* Drag handle overlaid on top-left */}
      <div
        {...listeners}
        {...attributes}
        className="absolute left-0 top-0 bottom-0 w-6 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="group/card">
        <DemandCard
          demand={demand}
          onClick={onClick}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onDelete={onDelete}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Droppable Column ─────────────────────── */

function DroppableColumn({
  status,
  children,
  isOver,
}: {
  status: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] space-y-2 rounded-lg p-2 transition-colors duration-200 ${
        isOver
          ? "bg-primary/10 ring-2 ring-primary/30 ring-inset"
          : "bg-muted/30"
      }`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── Board ─────────────────────────── */

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

  // Sync from props when not mutating
  if (
    demands !== localDemands &&
    !updateDemand.isPending &&
    !deleteDemand.isPending
  ) {
    setLocalDemands(demands);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columnDemands = useMemo(() => {
    const map: Record<string, DemandRow[]> = {};
    for (const status of DEMAND_BOARD_COLUMNS) {
      map[status] = [];
    }
    for (const d of localDemands) {
      const col = normalize(d.status);
      if (map[col]) {
        map[col].push(d);
      }
    }
    return map;
  }, [localDemands]);

  const handleStatusChange = useCallback(
    (demandId: string, newStatus: string) => {
      const feito = newStatus === "Concluido" || newStatus === "Concluido";
      setLocalDemands((prev) =>
        prev.map((d) =>
          d.id === demandId ? { ...d, status: newStatus, feito } : d
        )
      );
      updateDemand.mutate({
        id: demandId,
        updates: { status: newStatus, feito },
      });
    },
    [updateDemand]
  );

  const handlePriorityChange = useCallback(
    (demandId: string, prioridade: string) => {
      setLocalDemands((prev) =>
        prev.map((d) => (d.id === demandId ? { ...d, prioridade } : d))
      );
      updateDemand.mutate({ id: demandId, updates: { prioridade } });
    },
    [updateDemand]
  );

  const handleDelete = useCallback(
    (demandId: string) => {
      setLocalDemands((prev) => prev.filter((d) => d.id !== demandId));
      deleteDemand.mutate(demandId);
    },
    [deleteDemand]
  );

  /* ─── Drag handlers ─── */

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const demand = localDemands.find((d) => d.id === active.id);
    if (demand) {
      setActiveDemand(demand);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    // Check if hovering over a column directly
    const overData = over.data.current;
    if (overData?.type === "column") {
      setOverColumnId(overData.status as string);
      return;
    }

    // Hovering over another card -- find which column it belongs to
    const overDemand = localDemands.find((d) => d.id === over.id);
    if (overDemand) {
      setOverColumnId(normalize(overDemand.status));
      return;
    }

    setOverColumnId(over.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDemand(null);
    setOverColumnId(null);

    if (!over) return;

    const demandId = active.id as string;

    // Determine the target column status
    let targetStatus: string;
    const overData = over.data.current;
    if (overData?.type === "column") {
      targetStatus = overData.status as string;
    } else {
      // Dropped on a card - use that card's column
      const overDemand = localDemands.find((d) => d.id === over.id);
      targetStatus = overDemand ? normalize(overDemand.status) : (over.id as string);
    }

    const demand = localDemands.find((d) => d.id === demandId);
    if (!demand || normalize(demand.status) === targetStatus) return;

    handleStatusChange(demandId, targetStatus);
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
          const demands = columnDemands[status] ?? [];
          const isOver = overColumnId === status;

          return (
            <div key={status} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cfg?.color }}
                />
                <h3 className="text-sm font-semibold">
                  {cfg?.label ?? status}
                </h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {demands.length}
                </Badge>
              </div>

              <DroppableColumn status={status} isOver={isOver}>
                {demands.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    {isOver ? "Soltar aqui" : "Nenhuma demanda"}
                  </p>
                ) : (
                  demands.map((demand) => (
                    <DraggableDemandCard
                      key={demand.id}
                      demand={demand}
                      onClick={() => onSelect(demand)}
                      onStatusChange={(s) =>
                        handleStatusChange(demand.id, s)
                      }
                      onPriorityChange={(p) =>
                        handlePriorityChange(demand.id, p)
                      }
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

      {/* Drag overlay -- rendered outside the columns for smooth movement */}
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
