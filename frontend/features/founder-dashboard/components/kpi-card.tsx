"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Info, RefreshCw } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface KpiTooltipContent {
  description: string;
  formula?: string;
  enters?: string;
  notEnters?: string;
  source: string;
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  sublabel?: string;
  variation?: string;
  icon: ReactNode;
  colorClass?: string;
  tooltip: KpiTooltipContent;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  onClick?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayValue(value: string | number): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Component ────────────────────────────────────────────────────────────────

export function KpiCard({
  title,
  value,
  sublabel,
  variation,
  icon,
  colorClass = "text-gray-900",
  tooltip,
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  error = null,
  onRetry,
  onClick,
}: KpiCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="animate-pulse bg-gray-100 rounded h-4 w-24" />
          <div className="animate-pulse bg-gray-100 rounded-lg h-8 w-8" />
        </div>
        <div className="animate-pulse bg-gray-100 rounded h-7 w-32 mb-1" />
        <div className="animate-pulse bg-gray-100 rounded h-3 w-20" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </span>
          <TooltipInfo tooltip={tooltip} />
        </div>
        <p className="text-sm text-red-500 mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${
        onClick ? "cursor-pointer hover:border-tbo-orange/30 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <TooltipInfo tooltip={tooltip} />
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100/40">
            {icon}
          </span>
        </div>
      </div>

      {isEmpty ? (
        <>
          <p className="text-2xl font-bold tabular-nums text-gray-500">&mdash;</p>
          <p className="text-xs text-gray-500 mt-1">
            {emptyMessage || "Sem dados no período"}
          </p>
        </>
      ) : (
        <>
          <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>
            {typeof value === "number" ? formatDisplayValue(value) : value}
          </p>
          {(sublabel || variation) && (
            <p className="text-xs text-gray-500 mt-1">
              {sublabel}
              {sublabel && variation && " | "}
              {variation}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── Tooltip "i" ──────────────────────────────────────────────────────────────

function TooltipInfo({ tooltip }: { tooltip: KpiTooltipContent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Informações do KPI"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg p-3 space-y-2">
          <p className="text-sm font-medium text-gray-900">{tooltip.description}</p>
          {tooltip.formula && (
            <div>
              <span className="text-xs font-medium text-gray-500">
                Fórmula:
              </span>
              <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-md mt-0.5">
                {tooltip.formula}
              </p>
            </div>
          )}
          {tooltip.enters && (
            <div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Entra:
              </span>
              <p className="text-xs text-gray-500">{tooltip.enters}</p>
            </div>
          )}
          {tooltip.notEnters && (
            <div>
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Não entra:
              </span>
              <p className="text-xs text-gray-500">
                {tooltip.notEnters}
              </p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-gray-500">
              Fonte:
            </span>
            <p className="text-xs text-gray-500">{tooltip.source}</p>
          </div>
        </div>
      )}
    </div>
  );
}
