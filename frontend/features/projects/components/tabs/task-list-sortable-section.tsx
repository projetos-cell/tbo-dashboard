"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

interface SortableSectionGroupProps {
  sectionId: string;
  children: ReactNode;
  /** Spread listeners into SectionHeader dragHandleProps */
  renderHandle: (listeners: Record<string, unknown>, isDragging: boolean) => ReactNode;
}

export function SortableSectionGroup({ sectionId, children, renderHandle }: SortableSectionGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${sectionId}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {renderHandle(listeners ?? {}, isDragging)}
      {children}
    </div>
  );
}
