"use client";

import { useState, useRef, useCallback } from "react";
import { ReviewAnnotationPin } from "./review-annotation-pin";
import type { ReviewAnnotation } from "@/features/review/types";

interface ReviewViewerProps {
  imageUrl: string;
  imageName?: string;
  annotations: ReviewAnnotation[];
  selectedPinId: string | null;
  newPin: { x: number; y: number } | null;
  showResolved: boolean;
  onPinSelect: (id: string | null) => void;
  onImageClick: (x: number, y: number) => void;
}

export function ReviewViewer({
  imageUrl,
  imageName,
  annotations,
  selectedPinId,
  newPin,
  showResolved,
  onPinSelect,
  onImageClick,
}: ReviewViewerProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  const visibleAnnotations = showResolved
    ? annotations.filter((a) => !a.parent_id)
    : annotations.filter((a) => !a.parent_id && !a.resolved);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      onImageClick(
        Math.round(xPct * 100) / 100,
        Math.round(yPct * 100) / 100
      );
    },
    [onImageClick]
  );

  return (
    <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4 min-h-0">
      <div
        ref={imageRef}
        className="relative cursor-crosshair select-none"
        onClick={handleImageClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={imageName ?? "Review image"}
          className="max-w-full max-h-[calc(100vh-220px)] object-contain rounded-md shadow-md"
          draggable={false}
        />

        {/* Existing pins */}
        {visibleAnnotations.map((ann, i) => (
          <ReviewAnnotationPin
            key={ann.id}
            index={i}
            annotation={ann}
            isSelected={selectedPinId === ann.id}
            onClick={(id) => {
              onPinSelect(selectedPinId === id ? null : id);
            }}
          />
        ))}

        {/* New pin preview */}
        {newPin && (
          <div
            className="absolute flex items-center justify-center size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 border-2 border-blue-600 text-white text-[10px] font-bold shadow-lg animate-pulse z-10"
            style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
          >
            +
          </div>
        )}
      </div>
    </div>
  );
}
