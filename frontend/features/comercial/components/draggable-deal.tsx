"use client";

import { useDraggable } from "@dnd-kit/core";
import { DealCard } from "./deal-card";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DraggableDealProps {
  deal: DealRow;
  onSelect: (deal: DealRow) => void;
  isDragActive: boolean;
}

export function DraggableDeal({
  deal,
  onSelect,
  isDragActive,
}: DraggableDealProps) {
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
