"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

function toInputValue(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(range: DateRange | undefined): string {
  if (!range?.start && !range?.end) return "";
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  if (range.start && range.end)
    return `${fmt(range.start)} – ${fmt(range.end)}`;
  if (range.start) return `${fmt(range.start)} – ...`;
  if (range.end) return `... – ${fmt(range.end)}`;
  return "";
}

export function DateRangePicker({ value, onChange, className, placeholder = "Selecionar período" }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value ? new Date(e.target.value + "T00:00:00") : null;
    onChange?.({ start: d, end: value?.end ?? null });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value ? new Date(e.target.value + "T00:00:00") : null;
    onChange?.({ start: value?.start ?? null, end: d });
  };

  const displayText = formatDisplay(value);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-100 transition-colors",
          className
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={displayText ? "text-gray-900" : "text-gray-500"}>
          {displayText || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-gray-200 bg-white p-4 shadow-lg min-w-[280px]">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Início</label>
              <input
                type="date"
                value={toInputValue(value?.start ?? null)}
                onChange={handleStartChange}
                className="flex h-8 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tbo-orange"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Fim</label>
              <input
                type="date"
                value={toInputValue(value?.end ?? null)}
                onChange={handleEndChange}
                min={toInputValue(value?.start ?? null)}
                className="flex h-8 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tbo-orange"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-md bg-tbo-orange px-3 py-1.5 text-xs font-medium text-white hover:bg-tbo-orange-700"
              onClick={() => setOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
