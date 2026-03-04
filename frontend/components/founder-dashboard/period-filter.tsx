"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────────────────────────

export type PeriodPreset = "mtd" | "last3m" | "ytd" | "custom";

export interface PeriodValue {
  preset: PeriodPreset;
  from?: string; // ISO date, only for custom
  to?: string;   // ISO date, only for custom
}

const PRESET_LABELS: Record<PeriodPreset, string> = {
  mtd: "MTD",
  last3m: "Ultimos 3 meses",
  ytd: "YTD",
  custom: "Personalizado",
};

// ── Component ────────────────────────────────────────────────────────────────

interface PeriodFilterProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(value.from ?? "");
  const [customTo, setCustomTo] = useState(value.to ?? "");

  function select(preset: PeriodPreset) {
    if (preset === "custom") return; // handled by Apply button
    onChange({ preset });
    setOpen(false);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    onChange({ preset: "custom", from: customFrom, to: customTo });
    setOpen(false);
  }

  const displayLabel =
    value.preset === "custom" && value.from && value.to
      ? `${fmtDate(value.from)} — ${fmtDate(value.to)}`
      : PRESET_LABELS[value.preset];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {displayLabel}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          {(["mtd", "last3m", "ytd"] as PeriodPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              className={`w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors ${
                value.preset === preset
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => select(preset)}
            >
              {PRESET_LABELS[preset]}
            </button>
          ))}

          {/* Custom range */}
          <div className="border-t pt-2 mt-2 space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">
              Personalizado
            </p>
            <div className="flex items-center gap-2 px-1">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-7 text-xs"
              />
              <span className="text-xs text-muted-foreground">a</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              disabled={!customFrom || !customTo}
              onClick={applyCustom}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Resolve a PeriodValue to concrete from/to ISO date strings.
 * Used by the service layer to determine query boundaries.
 */
export function resolvePeriodBounds(period: PeriodValue): {
  from: string;
  to: string;
  label: string;
} {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (period.preset) {
    case "mtd": {
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      return { from: monthStart, to: today, label: "MTD" };
    }
    case "last3m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      const from = d.toISOString().split("T")[0];
      return { from, to: today, label: "Ultimos 3 meses" };
    }
    case "ytd": {
      const from = `${now.getFullYear()}-01-01`;
      return { from, to: today, label: "YTD" };
    }
    case "custom": {
      return {
        from: period.from || today,
        to: period.to || today,
        label: `${fmtDate(period.from || today)} — ${fmtDate(period.to || today)}`,
      };
    }
  }
}
