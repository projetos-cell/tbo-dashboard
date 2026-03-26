"use client";

import { IconCheck } from "@tabler/icons-react";
import { WORKFLOW_STAGE_CONFIG } from "@/features/review/constants";
import { WORKFLOW_STAGES_ORDER, getStageIndex } from "@/features/review/types";
import type { ReviewWorkflowStage } from "@/features/review/types";

interface WorkflowStageIndicatorProps {
  currentStage: ReviewWorkflowStage;
}

export function WorkflowStageIndicator({
  currentStage,
}: WorkflowStageIndicatorProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STAGES_ORDER.map((stage, idx) => {
        const config = WORKFLOW_STAGE_CONFIG[stage];
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <div key={stage} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all"
                style={
                  isPast
                    ? { backgroundColor: "#22c55e", color: "#fff" }
                    : isCurrent
                    ? { backgroundColor: config.color, color: "#fff", boxShadow: `0 0 0 3px ${config.color}33` }
                    : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                }
              >
                {isPast ? (
                  <IconCheck className="h-3.5 w-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className="max-w-[80px] text-center text-[10px] leading-tight"
                style={{
                  color: isCurrent
                    ? config.color
                    : isFuture
                    ? "var(--muted-foreground)"
                    : "#22c55e",
                  fontWeight: isCurrent ? 600 : 400,
                  opacity: isFuture ? 0.5 : 1,
                }}
              >
                {config.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < WORKFLOW_STAGES_ORDER.length - 1 && (
              <div
                className="mx-1 mt-[-14px] h-0.5 w-6 transition-colors"
                style={{
                  backgroundColor: idx < currentIndex ? "#22c55e" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
