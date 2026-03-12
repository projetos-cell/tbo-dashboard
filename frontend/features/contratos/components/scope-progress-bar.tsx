"use client";

import { cn } from "@/lib/utils";

interface ScopeProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ScopeProgressBar({
  progress,
  className,
  showLabel = true,
  size = "md",
}: ScopeProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  const barColor =
    clamped === 100
      ? "bg-green-500"
      : clamped >= 75
        ? "bg-blue-500"
        : clamped >= 50
          ? "bg-yellow-500"
          : clamped > 0
            ? "bg-orange-500"
            : "bg-muted";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 rounded-full bg-muted overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={cn(
            "font-medium tabular-nums shrink-0",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
