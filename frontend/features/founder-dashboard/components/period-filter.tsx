"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type PeriodPreset = "mtd" | "last3m" | "ytd" | "custom";

export interface PeriodValue {
  preset: PeriodPreset;
  from?: string; // ISO date, only for custom
  to?: string;   // ISO date, only for custom
}

const PRESET_LABELS: Record<PeriodPreset, string> = {
  mtd: "MTD",
  last3m: "Últimos 3 meses",
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
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 transition-colors shadow-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
        {displayLabel}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
          <div className="space-y-1">
            {(["mtd", "last3m", "ytd"] as PeriodPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  value.preset === preset
                    ? "bg-tbo-orange text-white"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
                onClick={() => select(preset)}
              >
                {PRESET_LABELS[preset]}
              </button>
            ))}

            {/* Custom range */}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
              <p className="text-xs font-medium text-gray-500 px-1">
                Personalizado
              </p>
              <div className="flex items-center gap-2 px-1">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-7 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-tbo-orange/20"
                />
                <span className="text-xs text-gray-500 shrink-0">a</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-7 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-tbo-orange/20"
                />
              </div>
              <button
                type="button"
                className="w-full h-7 rounded-lg bg-tbo-orange text-white text-xs font-medium hover:bg-tbo-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!customFrom || !customTo}
                onClick={applyCustom}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
      return { from, to: today, label: "Últimos 3 meses" };
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
