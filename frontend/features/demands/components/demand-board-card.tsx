"use client";

import * as React from "react";
import { IconGripVertical } from "@tabler/icons-react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { DemandCard } from "./demand-card";
import type { DemandRow } from "./demand-card";

export type { DemandRow };
export { DemandCard };

export const normalize = (status: string | null) =>
  !status ? "Briefing" : status === "Concluido" ? "Concluido" : status;

/* ─────────────────────── Draggable Card wrapper ─────────────────────── */

interface DraggableDemandCardProps {
  demand: DemandRow;
  onClick?: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDelete: () => void;
  isDragActive: boolean;
}

export function DraggableDemandCard({
  demand,
  onClick,
  onStatusChange,
  onPriorityChange,
  onDelete,
  isDragActive,
}: DraggableDemandCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: demand.id,
      data: { demand, status: normalize(demand.status) },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50" : ""}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute left-0 top-0 bottom-0 w-6 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <IconGripVertical className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div className="group/card">
        <DemandCard
          demand={demand}
          onClick={onClick}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onDelete={onDelete}
          isDragging={isDragging || isDragActive}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Droppable Column ─────────────────────── */

interface DroppableColumnProps {
  status: string;
  children: React.ReactNode;
  isOver: boolean;
}

export function DroppableColumn({
  status,
  children,
  isOver,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] space-y-2 rounded-lg p-2 transition-colors duration-200 ${
        isOver
          ? "bg-tbo-orange/10 ring-2 ring-tbo-orange/30 ring-inset"
          : "bg-gray-100/30"
      }`}
    >
      {children}
    </div>
  );
}
