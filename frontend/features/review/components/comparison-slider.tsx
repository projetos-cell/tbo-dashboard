"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ComparisonSliderProps {
  leftImageUrl: string;
  rightImageUrl: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function ComparisonSlider({
  leftImageUrl,
  rightImageUrl,
  leftLabel,
  rightLabel,
  className,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50); // 0–100%
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    dragging.current = true;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const touch = e.touches[0];
      if (touch) updatePosition(touch.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePosition]);

  // Allow clicking anywhere on the container to reposition
  const onContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) updatePosition(e.clientX);
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none overflow-hidden rounded-lg cursor-col-resize",
        className
      )}
      onClick={onContainerClick}
    >
      {/* Right image — full width, bottom layer */}
      <img
        src={rightImageUrl}
        alt={rightLabel ?? "Versão direita"}
        className="w-full h-full object-contain block"
        draggable={false}
      />

      {/* Left image — clipped to left portion */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={leftImageUrl}
          alt={leftLabel ?? "Versão esquerda"}
          className="w-full h-full object-contain block"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 flex items-center justify-center w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md cursor-col-resize z-10"
        style={{ left: `${position}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-gray-600"
        >
          <path
            d="M5 3L2 8l3 5M11 3l3 5-3 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Labels */}
      {leftLabel && (
        <div
          className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm pointer-events-none"
          style={{ maxWidth: `${position - 2}%`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {leftLabel}
        </div>
      )}
      {rightLabel && (
        <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm pointer-events-none max-w-[40%] overflow-hidden text-ellipsis whitespace-nowrap">
          {rightLabel}
        </div>
      )}
    </div>
  );
}
