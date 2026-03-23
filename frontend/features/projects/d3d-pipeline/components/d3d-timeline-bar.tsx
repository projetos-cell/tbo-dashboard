"use client";

import { cn } from "@/lib/utils";
import { D3D_TIMELINE_SEGMENTS } from "../constants";
import type { D3DStageState } from "../types";

interface D3DTimelineBarProps {
  stages: D3DStageState[];
  className?: string;
}

export function D3DTimelineBar({ stages, className }: D3DTimelineBarProps) {
  const stageMap = new Map(stages.map((s) => [s.stage_key, s]));

  return (
    <div className={cn("rounded-xl border bg-white p-5", className)}>
      <div className="flex items-center gap-0">
        {/* Segments */}
        <div className="flex flex-1 items-center gap-0 min-w-0">
          {D3D_TIMELINE_SEGMENTS.map((seg, idx) => {
            const state = stageMap.get(seg.key);
            const isCompleted = state?.status === "completed" || state?.status === "approved";
            const isActive = state?.status === "in_progress";

            return (
              <div key={seg.key} className="contents">
                {idx > 0 && (
                  <div className="relative mx-0.5 h-1.5 w-2 flex-shrink-0">
                    <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-zinc-200" />
                  </div>
                )}
                <div className="flex flex-col items-center min-w-0" style={{ flex: seg.flex }}>
                  <span className="mb-2 whitespace-nowrap text-[11px] font-medium tracking-tight text-zinc-900">
                    {seg.days}
                  </span>
                  <div
                    className={cn(
                      "h-1.5 w-full rounded-full transition-opacity",
                      !isCompleted && !isActive && "opacity-30"
                    )}
                    style={{ backgroundColor: seg.color }}
                  />
                  <span
                    className={cn(
                      "mt-2 truncate text-center text-[10px] tracking-wide",
                      "isGate" in seg && seg.isGate ? "text-[9px] text-zinc-400" : "text-zinc-500"
                    )}
                  >
                    {seg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="ml-5 flex flex-shrink-0 flex-col items-center border-l border-zinc-200 pl-5">
          <span className="text-3xl font-normal tracking-tight text-orange-600">55–80</span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-400">
            dias úteis
          </span>
        </div>
      </div>
    </div>
  );
}
