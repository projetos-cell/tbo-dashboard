"use client";

import { useDroppable } from "@dnd-kit/core";

interface DroppableStageColumnProps {
  stage: string;
  children: React.ReactNode;
  isOver: boolean;
  label?: string;
}

export function DroppableStageColumn({
  stage,
  children,
  isOver,
  label,
}: DroppableStageColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
    data: { type: "column", stage },
  });

  return (
    <div
      ref={setNodeRef}
      role="group"
      aria-label={label ?? stage}
      className={`space-y-2 min-h-[60px] rounded-lg p-2 transition-colors duration-200 ${
        isOver
          ? "bg-tbo-orange/10 ring-2 ring-tbo-orange/30 ring-inset"
          : "bg-gray-100/20"
      }`}
    >
      {children}
    </div>
  );
}
