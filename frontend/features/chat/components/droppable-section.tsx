"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableSectionProps {
  sectionId: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableSection({ sectionId, children, className }: DroppableSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id: sectionId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-8 space-y-0.5 rounded-md transition-colors duration-150",
        isOver && "bg-accent/20 ring-1 ring-accent/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
