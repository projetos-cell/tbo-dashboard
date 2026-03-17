"use client";

// Feature #76 — Modo compacto/expandido nas tabelas (toggle density)

import { IconLayoutRows, IconLayoutList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type TableDensity = "compact" | "normal" | "expanded";

export const DENSITY_LABELS: Record<TableDensity, string> = {
  compact: "Compacto",
  normal: "Normal",
  expanded: "Expandido",
};

// Row padding per density — use in table <tr> cells
export const DENSITY_ROW_PADDING: Record<TableDensity, string> = {
  compact: "py-1",
  normal: "py-3",
  expanded: "py-4",
};

// Icon size per density
export const DENSITY_TEXT: Record<TableDensity, string> = {
  compact: "text-xs",
  normal: "text-sm",
  expanded: "text-sm",
};

const DENSITIES: TableDensity[] = ["compact", "normal", "expanded"];

interface TableDensityToggleProps {
  density: TableDensity;
  onChange: (density: TableDensity) => void;
}

export function TableDensityToggle({ density, onChange }: TableDensityToggleProps) {
  function cycle() {
    const idx = DENSITIES.indexOf(density);
    onChange(DENSITIES[(idx + 1) % DENSITIES.length]);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={cycle}
            className="h-8 gap-1.5 px-2.5 text-xs"
            aria-label={`Densidade: ${DENSITY_LABELS[density]}`}
          >
            {density === "compact" ? (
              <IconLayoutList className="h-3.5 w-3.5" />
            ) : (
              <IconLayoutRows className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{DENSITY_LABELS[density]}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Alternar densidade da tabela</p>
          <p className="text-muted-foreground text-xs mt-0.5">Atual: {DENSITY_LABELS[density]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
