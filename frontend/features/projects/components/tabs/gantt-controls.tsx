"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GanttViewMode = "Day" | "Week" | "Month";

interface GanttControlsProps {
  activeMode: GanttViewMode;
  onChange: (mode: GanttViewMode) => void;
}

const MODES: { value: GanttViewMode; label: string }[] = [
  { value: "Day", label: "Dia" },
  { value: "Week", label: "Semana" },
  { value: "Month", label: "Mês" },
];

export function GanttControls({ activeMode, onChange }: GanttControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {MODES.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={activeMode === value ? "default" : "outline"}
          className={cn("text-xs", activeMode !== value && "text-muted-foreground")}
          onClick={() => onChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
