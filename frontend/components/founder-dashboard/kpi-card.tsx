"use client";

import type { ReactNode } from "react";
import { Info, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

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
  colorClass = "text-foreground",
  tooltip,
  isLoading = false,
  isEmpty = false,
  error = null,
  onRetry,
  onClick,
}: KpiCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <TooltipInfo tooltip={tooltip} />
        </div>
        <p className="text-sm text-destructive mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
      className={`rounded-lg border bg-card p-5 ${
        onClick ? "cursor-pointer hover:border-primary/30 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <TooltipInfo tooltip={tooltip} />
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
            {icon}
          </span>
        </div>
      </div>

      {isEmpty ? (
        <>
          <p className="text-2xl font-bold text-muted-foreground">&mdash;</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sem dados no periodo
          </p>
        </>
      ) : (
        <>
          <p className={`text-2xl font-bold ${colorClass}`}>
            {typeof value === "number" ? formatDisplayValue(value) : value}
          </p>
          {(sublabel || variation) && (
            <p className="text-xs text-muted-foreground mt-1">
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Informacoes do KPI"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm space-y-2" side="top">
        <p className="font-medium">{tooltip.description}</p>
        {tooltip.formula && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Formula:
            </span>
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-0.5">
              {tooltip.formula}
            </p>
          </div>
        )}
        {tooltip.enters && (
          <div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Entra:
            </span>
            <p className="text-xs text-muted-foreground">{tooltip.enters}</p>
          </div>
        )}
        {tooltip.notEnters && (
          <div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Nao entra:
            </span>
            <p className="text-xs text-muted-foreground">
              {tooltip.notEnters}
            </p>
          </div>
        )}
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Fonte:
          </span>
          <p className="text-xs text-muted-foreground">{tooltip.source}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
