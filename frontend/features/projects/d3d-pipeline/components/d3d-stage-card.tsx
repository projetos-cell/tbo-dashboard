"use client";

import { cn } from "@/lib/utils";
import {
  IconUpload,
  IconPhoto,
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconCircleDashed,
} from "@tabler/icons-react";
import { D3D_TAG_COLORS, D3D_STATUS_DISPLAY } from "../constants";
import type { D3DStageConfig, D3DStageState } from "../types";

interface D3DStageCardProps {
  config: D3DStageConfig;
  state?: D3DStageState;
  index: number;
  readOnly?: boolean;
  onImageUpload?: (stageKey: string, file: File) => void;
  onImageClick?: (stageKey: string, imageUrl: string) => void;
  onStatusChange?: (stageId: string, status: string) => void;
}

export function D3DStageCard({
  config,
  state,
  index,
  readOnly = false,
  onImageUpload,
  onImageClick,
  onStatusChange,
}: D3DStageCardProps) {
  const isStart = config.key === "00_briefing";
  const isEnd = config.key === "07_entrega_final";
  const status = state?.status ?? "pending";
  const statusDisplay = D3D_STATUS_DISPLAY[status as keyof typeof D3D_STATUS_DISPLAY];
  const tagConfig = D3D_TAG_COLORS[config.tag];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(config.key, file);
    }
  };

  return (
    <div
      className={cn(
        "group flex w-[268px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        isStart && "border-orange-600 bg-orange-600 text-white",
        isEnd && "border-zinc-900 bg-zinc-900 text-white",
        !isStart && !isEnd && "border-zinc-200 bg-white"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image area */}
      <div
        className={cn(
          "relative h-[120px] w-full overflow-hidden",
          state?.image_url && "h-[140px] cursor-pointer"
        )}
        onClick={() => {
          if (state?.image_url && onImageClick) {
            onImageClick(config.key, state.image_url);
          }
        }}
      >
        {state?.image_url ? (
          <img
            src={state.image_url}
            alt={config.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-2 border-b transition-colors",
              isStart && "border-white/12 bg-white/8",
              isEnd && "border-white/6 bg-white/4",
              !isStart && !isEnd && "border-zinc-100 bg-zinc-50 hover:bg-zinc-100"
            )}
          >
            <IconPhoto
              className={cn(
                "h-7 w-7",
                isStart && "text-white/25",
                isEnd && "text-white/20",
                !isStart && !isEnd && "text-zinc-300"
              )}
              stroke={1.5}
            />
            {!readOnly && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isStart && "text-white/45",
                  isEnd && "text-white/30",
                  !isStart && !isEnd && "text-zinc-400"
                )}
              >
                Upload visual
              </span>
            )}
          </div>
        )}
        {!readOnly && !state?.image_url && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-4">
        <div
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-xs font-medium",
            isStart && "border border-white/15 bg-white/20 text-white",
            isEnd && "border border-white/8 bg-white/10 text-white/60",
            !isStart && !isEnd && "border border-zinc-200 bg-zinc-100 text-zinc-600"
          )}
        >
          {String(index).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-[15px] font-medium leading-tight tracking-tight",
              (isStart || isEnd) && "text-white"
            )}
          >
            {config.label}
          </h3>
          <p
            className={cn(
              "mt-0.5 text-[11px]",
              isStart && "text-white/65",
              isEnd && "text-white/45",
              !isStart && !isEnd && "text-zinc-400"
            )}
          >
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="mt-3 flex items-center gap-2 px-5">
        <div
          className={cn(
            "relative h-[3px] flex-1 overflow-hidden rounded-full",
            isStart && "bg-white/12",
            isEnd && "bg-white/8",
            !isStart && !isEnd && "bg-zinc-100"
          )}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width:
                status === "completed" || status === "approved"
                  ? "100%"
                  : status === "in_progress"
                    ? "50%"
                    : "0%",
              backgroundColor: isStart
                ? "rgba(255,255,255,0.3)"
                : isEnd
                  ? "rgba(255,255,255,0.25)"
                  : config.color,
            }}
          />
        </div>
        <span
          className={cn(
            "flex-shrink-0 whitespace-nowrap text-[11px] font-medium tracking-tight",
            isStart && "text-white/70",
            isEnd && "text-white/50",
            !isStart && !isEnd && "text-zinc-500"
          )}
        >
          {config.estimatedDays}
        </span>
      </div>

      {/* Description */}
      <div className="px-5 py-2.5">
        <p
          className={cn(
            "text-[12.5px] leading-relaxed",
            isStart && "text-white/75",
            isEnd && "text-white/55",
            !isStart && !isEnd && "text-zinc-500"
          )}
        >
          {config.description}
        </p>
      </div>

      {/* Deliverables */}
      {config.deliverables.length > 0 && (
        <div className="flex flex-col gap-1.5 px-5 pb-3">
          {config.deliverables.map((d, di) => (
            <div
              key={di}
              className={cn(
                "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                isStart && "border-white/12 bg-white/8 text-white/70",
                isEnd && "border-white/8 bg-white/5 text-white/60 hover:bg-white/8",
                !isStart && !isEnd && "border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <DeliverableIcon type={d.iconType} isSpecial={isStart || isEnd} />
              <div className="min-w-0 flex-1">
                <span>{d.label}</span>
                {d.specs && d.specs.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.specs.map((spec) => (
                      <span
                        key={spec.label}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide",
                          spec.type === "format" && "bg-blue-50 text-blue-500",
                          spec.type === "res" && "bg-purple-50 text-purple-500",
                          spec.type === "channel" && "bg-emerald-50 text-emerald-500",
                          (isStart || isEnd) && "bg-white/10 text-white/60"
                        )}
                      >
                        {spec.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className={cn(
          "mt-auto flex items-center justify-between border-t px-5 py-3",
          isStart && "border-white/12",
          isEnd && "border-white/8",
          !isStart && !isEnd && "border-zinc-100"
        )}
      >
        <span
          className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
          style={{
            backgroundColor: isStart || isEnd ? "rgba(255,255,255,0.15)" : tagConfig.bg,
            color: isStart || isEnd ? "white" : tagConfig.color,
          }}
        >
          {tagConfig.label}
        </span>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          {!readOnly && state && (
            <StatusBadge
              status={status}
              isSpecial={isStart || isEnd}
              onClick={() => {
                if (onStatusChange && state) {
                  const nextStatus =
                    status === "pending"
                      ? "in_progress"
                      : status === "in_progress"
                        ? "completed"
                        : status;
                  onStatusChange(state.id, nextStatus);
                }
              }}
            />
          )}
          <span
            className={cn(
              "text-[11px] font-medium",
              isStart && "text-white/50",
              isEnd && "text-white/40",
              !isStart && !isEnd && "text-zinc-400"
            )}
          >
            {config.owner}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function DeliverableIcon({ type, isSpecial }: { type: string; isSpecial: boolean }) {
  const colors = {
    ref: { bg: "rgba(59,130,246,0.06)", color: "#3B82F6" },
    model: { bg: "rgba(232,81,2,0.06)", color: "#E85102" },
    render: { bg: "rgba(16,185,129,0.06)", color: "#10B981" },
    check: { bg: "rgba(245,158,11,0.06)", color: "#F59E0B" },
  };
  const c = colors[type as keyof typeof colors] ?? colors.ref;

  return (
    <div
      className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded text-[10px]"
      style={{
        backgroundColor: isSpecial ? "rgba(255,255,255,0.12)" : c.bg,
        color: isSpecial ? "white" : c.color,
      }}
    >
      {type === "check" ? "✓" : type === "model" ? "▲" : type === "render" ? "●" : "◆"}
    </div>
  );
}

function StatusBadge({
  status,
  isSpecial,
  onClick,
}: {
  status: string;
  isSpecial: boolean;
  onClick: () => void;
}) {
  const StatusIcon =
    status === "completed" || status === "approved"
      ? IconCheck
      : status === "in_progress"
        ? IconPlayerPlay
        : status === "changes_requested"
          ? IconClock
          : IconCircleDashed;

  const display = D3D_STATUS_DISPLAY[status as keyof typeof D3D_STATUS_DISPLAY];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors",
        "hover:opacity-80"
      )}
      style={{
        backgroundColor: isSpecial ? "rgba(255,255,255,0.15)" : display?.bg,
        color: isSpecial ? "white" : display?.color,
      }}
      title={`Clique para avançar status`}
    >
      <StatusIcon className="h-3 w-3" stroke={2} />
      {display?.label}
    </button>
  );
}
