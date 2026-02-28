"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
}: SliderProps) {
  const currentValue = value?.[0] ?? defaultValue?.[0] ?? min;
  const pct = ((currentValue - min) / (max - min)) * 100;

  function handleTrackInteraction(clientX: number, rect: DOMRect) {
    const x = clientX - rect.left;
    const newPct = Math.max(0, Math.min(1, x / rect.width));
    const rawVal = min + newPct * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    onValueChange?.([Math.max(min, Math.min(max, steppedVal))]);
  }

  function startDrag(e: React.MouseEvent, trackElement: HTMLElement) {
    e.preventDefault();
    const handleMove = (ev: MouseEvent) => {
      const rect = trackElement.getBoundingClientRect();
      handleTrackInteraction(ev.clientX, rect);
    };
    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center h-5", className)}>
      <div
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleTrackInteraction(e.clientX, rect);
        }}
        onMouseDown={(e) => startDrag(e, e.currentTarget)}
      >
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
        style={{ left: `calc(${pct}% - 10px)` }}
        onMouseDown={(e) => {
          const track = e.currentTarget.parentElement!;
          startDrag(e, track);
        }}
      />
    </div>
  );
}
Slider.displayName = "Slider";

export { Slider };
