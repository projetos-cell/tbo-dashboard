"use client";

import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ReviewAnnotation } from "@/features/review/types";

interface ReviewAnnotationPinProps {
  index: number;
  annotation: ReviewAnnotation;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export function ReviewAnnotationPin({
  index,
  annotation,
  isSelected,
  onClick,
}: ReviewAnnotationPinProps) {
  if (annotation.x_pct === null || annotation.y_pct === null) return null;

  return (
    <button
      type="button"
      className={cn(
        "absolute flex items-center justify-center size-6 -translate-x-1/2 -translate-y-1/2 rounded-full text-[10px] font-bold shadow-lg border-2 transition-transform hover:scale-125 z-10",
        annotation.resolved
          ? "bg-green-500 border-green-600 text-white"
          : isSelected
            ? "bg-orange-500 border-orange-600 text-white scale-125"
            : "bg-orange-500 border-orange-600 text-white"
      )}
      style={{ left: `${annotation.x_pct}%`, top: `${annotation.y_pct}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(annotation.id);
      }}
      title={annotation.content}
    >
      {annotation.resolved ? <IconCheck className="size-3" /> : index + 1}
    </button>
  );
}
