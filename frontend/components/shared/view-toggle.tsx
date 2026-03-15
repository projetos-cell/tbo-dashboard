"use client";

import { IconLayoutKanban, IconList, IconTable, IconLayoutGrid } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type ViewMode = "board" | "list" | "table" | "gallery";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const VIEWS = [
  { value: "board" as const, icon: IconLayoutKanban, label: "Board" },
  { value: "list" as const, icon: IconList, label: "Lista" },
  { value: "table" as const, icon: IconTable, label: "Tabela" },
  { value: "gallery" as const, icon: IconLayoutGrid, label: "Galeria" },
] as const;

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="bg-muted/30 flex items-center rounded-lg border p-0.5">
      {VIEWS.map(({ value: v, icon: Icon, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
