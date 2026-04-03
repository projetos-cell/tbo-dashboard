"use client";

import { useState, useRef, useEffect } from "react";
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";

export type CommercialPeriod = "7d" | "30d" | "90d" | "ytd" | "all" | "custom";

export interface CommercialPeriodValue {
  preset: CommercialPeriod;
  from?: string;
  to?: string;
}

const PRESET_LABELS: Record<CommercialPeriod, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  ytd: "YTD",
  all: "Tudo",
  custom: "Personalizado",
};

interface Props {
  value: CommercialPeriodValue;
  onChange: (value: CommercialPeriodValue) => void;
}

export function CommercialPeriodFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(value.from ?? "");
  const [customTo, setCustomTo] = useState(value.to ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function select(preset: CommercialPeriod) {
    if (preset === "custom") return;
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
        <IconCalendar className="h-3.5 w-3.5 text-gray-500" />
        {displayLabel}
        <IconChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
          <div className="space-y-1">
            {(["7d", "30d", "90d", "ytd", "all"] as CommercialPeriod[]).map((preset) => (
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
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
              <p className="text-xs font-medium text-gray-500 px-1">Personalizado</p>
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

export function resolveCommercialPeriod(period: CommercialPeriodValue): { from: Date | null; to: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period.preset) {
    case "7d":
      return { from: new Date(Date.now() - 7 * 86_400_000), to: today };
    case "30d":
      return { from: new Date(Date.now() - 30 * 86_400_000), to: today };
    case "90d":
      return { from: new Date(Date.now() - 90 * 86_400_000), to: today };
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), to: today };
    case "all":
      return { from: null, to: null };
    case "custom":
      return {
        from: period.from ? new Date(period.from) : null,
        to: period.to ? new Date(period.to) : null,
      };
  }
}

export function filterByPeriod<T extends { created_at?: string | null; updated_at?: string | null }>(
  items: T[],
  period: CommercialPeriodValue,
  dateField: "created_at" | "updated_at" = "created_at",
): T[] {
  const { from, to } = resolveCommercialPeriod(period);
  if (!from && !to) return items;

  return items.filter((item) => {
    const dateStr = item[dateField];
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}
