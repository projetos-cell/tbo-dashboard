"use client";

import { cn } from "@/lib/utils";
import { IconDiamond, IconCheck } from "@tabler/icons-react";
import type { D3DStageConfig, D3DStageState } from "../types";

interface D3DGateNodeProps {
  config: D3DStageConfig;
  state?: D3DStageState;
  readOnly?: boolean;
  onApprove?: (stageId: string) => void;
  onRequestChanges?: (stageId: string) => void;
}

export function D3DGateNode({
  config,
  state,
  readOnly = false,
  onApprove,
  onRequestChanges,
}: D3DGateNodeProps) {
  const status = state?.status ?? "pending";
  const isApproved = status === "approved";
  const isFinal = config.key === "gate_final";
  const gateColor = isFinal ? "#10B981" : "#F59E0B";

  return (
    <div className="relative flex w-[136px] flex-shrink-0 flex-col items-center justify-center gap-1.5 py-3">
      {/* Horizontal line through center */}
      <div className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200" />

      {/* Diamond icon */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm",
          isApproved ? "border-emerald-200" : "border-zinc-200"
        )}
      >
        {isApproved ? (
          <IconCheck className="h-4 w-4 text-emerald-500" stroke={2} />
        ) : (
          <IconDiamond
            className="h-4 w-4"
            stroke={1.5}
            style={{ color: gateColor }}
          />
        )}
      </div>

      {/* Label */}
      <span className="relative z-10 whitespace-nowrap bg-zinc-50 px-1.5 text-[9px] uppercase tracking-wider text-zinc-400">
        Entrega ao cliente
      </span>

      {/* Action text */}
      <span
        className={cn(
          "relative z-10 bg-zinc-50 px-1 text-center text-[10px] leading-tight",
          isApproved ? "font-medium text-emerald-500" : "text-amber-500"
        )}
      >
        {config.label}
      </span>

      {/* Action buttons (internal view only) */}
      {!readOnly && state && status !== "approved" && status !== "completed" && (
        <div className="relative z-10 mt-1 flex gap-1">
          <button
            onClick={() => onApprove?.(state.id)}
            className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            Aprovar
          </button>
          <button
            onClick={() => onRequestChanges?.(state.id)}
            className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-600 transition-colors hover:bg-amber-100"
          >
            Revisar
          </button>
        </div>
      )}
    </div>
  );
}
