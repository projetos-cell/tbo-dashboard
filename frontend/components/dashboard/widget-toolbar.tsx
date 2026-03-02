"use client";

import { Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { WidgetDef } from "@/lib/dashboard-widgets";

interface WidgetToolbarProps {
  view: "founder" | "general";
  widgets: WidgetDef[];
}

export function WidgetToolbar({ view, widgets }: WidgetToolbarProps) {
  const { hideWidget: _h, showWidget, resetLayout, ...state } =
    useDashboardStore();

  const hidden =
    view === "founder" ? state.founderHidden : state.generalHidden;

  const hiddenWidgets = widgets.filter((w) => hidden.includes(w.id));

  // Nothing to show if all widgets are visible
  if (hiddenWidgets.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Re-show hidden widgets */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {hiddenWidgets.length} oculto{hiddenWidgets.length > 1 ? "s" : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Widgets ocultos
          </p>
          {hiddenWidgets.map((w) => (
            <button
              key={w.id}
              onClick={() => showWidget(view, w.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              {w.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Reset layout */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={() => resetLayout(view)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Resetar layout
      </Button>
    </div>
  );
}
