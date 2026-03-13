"use client";

import { useState, useRef, useEffect } from "react";
import { IconCalendar, IconChevronDown, IconX } from "@tabler/icons-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DatePreset =
  | "today"
  | "7d"
  | "30d"
  | "mtd"
  | "last_month"
  | "custom";

export interface DateRangeValue {
  preset: DatePreset;
  from?: string; // ISO date YYYY-MM-DD
  to?: string;   // ISO date YYYY-MM-DD
}

const PRESET_LABELS: Record<DatePreset, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  mtd: "Mês atual",
  last_month: "Mês anterior",
  custom: "Personalizado",
};

// ── resolveDateRange helper ───────────────────────────────────────────────────

export function resolveDateRange(value: DateRangeValue): {
  from: string;
  to: string;
  label: string;
} {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (value.preset) {
    case "today":
      return { from: today, to: today, label: "Hoje" };

    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: d.toISOString().split("T")[0], to: today, label: "Últimos 7 dias" };
    }

    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { from: d.toISOString().split("T")[0], to: today, label: "Últimos 30 dias" };
    }

    case "mtd": {
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      return { from, to: today, label: "Mês atual" };
    }

    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: first.toISOString().split("T")[0],
        to: last.toISOString().split("T")[0],
        label: "Mês anterior",
      };
    }

    case "custom":
      return {
        from: value.from ?? today,
        to: value.to ?? today,
        label:
          value.from && value.to
            ? `${formatIso(value.from)} — ${formatIso(value.to)}`
            : "Personalizado",
      };
  }
}

function formatIso(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Optional className override on the root wrapper */
  className?: string;
}

export function DateRangeFilter({ value, onChange, className = "" }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(value.from ?? "");
  const [customTo, setCustomTo] = useState(value.to ?? "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function selectPreset(preset: DatePreset) {
    if (preset === "custom") return; // handled by Apply
    onChange({ preset });
    setOpen(false);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    onChange({ preset: "custom", from: customFrom, to: customTo });
    setOpen(false);
  }

  function clearFilter() {
    onChange({ preset: "mtd" });
    setCustomFrom("");
    setCustomTo("");
  }

  const resolved = resolveDateRange(value);
  const isCustom = value.preset === "custom";
  const hasCustomDates = isCustom && value.from && value.to;

  const displayLabel = hasCustomDates
    ? `${formatIso(value.from!)} — ${formatIso(value.to!)}`
    : PRESET_LABELS[value.preset];

  const isNonDefault = value.preset !== "mtd";

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5
          text-xs font-medium transition-colors
          ${isNonDefault
            ? "border-tbo-orange bg-tbo-orange/10 text-tbo-orange dark:bg-tbo-orange/20"
            : "border-gray-200 bg-white text-gray-900 hover:bg-gray-100"
          }
        `}
      >
        <IconCalendar className="h-3.5 w-3.5 shrink-0" />
        <span>{displayLabel}</span>
        <IconChevronDown
          className={`h-3 w-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Clear badge (when non-default) */}
      {isNonDefault && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); clearFilter(); }}
          className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Limpar filtro de período"
        >
          <IconX className="h-3 w-3" />
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200
            bg-white shadow-md p-2 space-y-0.5
          "
        >
          {/* Presets */}
          {(["today", "7d", "30d", "mtd", "last_month"] as DatePreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`
                w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors
                ${value.preset === preset
                  ? "bg-tbo-orange text-white font-medium"
                  : "text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              {PRESET_LABELS[preset]}
            </button>
          ))}

          {/* Custom range */}
          <div className="border-t border-gray-200 pt-2 mt-2 space-y-2 px-1">
            <p className="text-xs font-medium text-gray-500">Personalizado</p>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-0.5 block">De</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  max={customTo || undefined}
                  className="
                    w-full rounded-md border border-gray-200 bg-white px-2 py-1
                    text-xs text-gray-900
                    focus:outline-none focus:ring-1 focus:ring-tbo-orange focus:border-tbo-orange
                  "
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-0.5 block">Até</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  min={customFrom || undefined}
                  className="
                    w-full rounded-md border border-gray-200 bg-white px-2 py-1
                    text-xs text-gray-900
                    focus:outline-none focus:ring-1 focus:ring-tbo-orange focus:border-tbo-orange
                  "
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!customFrom || !customTo}
              onClick={applyCustom}
              className="
                w-full rounded-md bg-tbo-orange py-1.5 text-xs font-medium text-white
                transition-opacity
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:hover:opacity-90
              "
            >
              Aplicar
            </button>
          </div>

          {/* Resolved range label */}
          {value.preset !== "custom" && (
            <p className="text-[10px] text-gray-500 px-1 pt-1">
              {resolved.from === resolved.to
                ? formatIso(resolved.from)
                : `${formatIso(resolved.from)} — ${formatIso(resolved.to)}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
