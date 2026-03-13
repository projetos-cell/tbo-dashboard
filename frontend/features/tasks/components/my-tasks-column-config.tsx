"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconAdjustments, IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  MY_TASKS_COLUMNS,
  type ColumnPref,
  type ResolvedColumn,
} from "@/features/tasks/lib/my-tasks-columns";

interface MyTasksColumnConfigProps {
  columns: ResolvedColumn[];
  columnPrefs: ColumnPref[];
  onUpdate: (prefs: ColumnPref[]) => void;
}

export function MyTasksColumnConfig({
  columns,
  columnPrefs,
  onUpdate,
}: MyTasksColumnConfigProps) {
  // Build current prefs map
  const prefMap = new Map(columnPrefs.map((p) => [p.id, p]));

  const toggleVisibility = useCallback(
    (columnId: string, visible: boolean) => {
      const existing = columnPrefs.find((p) => p.id === columnId);
      const def = MY_TASKS_COLUMNS.find((d) => d.id === columnId);
      if (!def) return;

      let next: ColumnPref[];
      if (existing) {
        next = columnPrefs.map((p) =>
          p.id === columnId ? { ...p, visible } : p
        );
      } else {
        next = [
          ...columnPrefs,
          { id: columnId, visible, width: def.defaultWidth },
        ];
      }
      onUpdate(next);
    },
    [columnPrefs, onUpdate]
  );

  const moveColumn = useCallback(
    (columnId: string, direction: "up" | "down") => {
      // Ensure all columns have prefs
      let prefs = columns.map((col) => {
        const existing = prefMap.get(col.id);
        return existing ?? { id: col.id, visible: true, width: col.width };
      });

      const idx = prefs.findIndex((p) => p.id === columnId);
      if (idx < 0) return;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prefs.length) return;

      // Don't swap past "tarefa" (always first)
      if (prefs[swapIdx].id === "tarefa" || prefs[idx].id === "tarefa") return;

      prefs = [...prefs];
      [prefs[idx], prefs[swapIdx]] = [prefs[swapIdx], prefs[idx]];
      onUpdate(prefs);
    },
    [columns, prefMap, onUpdate]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs font-medium"
        >
          <IconAdjustments className="h-3.5 w-3.5" />
          Campos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Campos visíveis
        </p>
        <div className="space-y-0.5">
          {columns.map((col, idx) => {
            const pref = prefMap.get(col.id);
            const isVisible = col.alwaysVisible || (pref ? pref.visible : true);
            const canMove = !col.alwaysVisible && idx > 0;

            return (
              <div
                key={col.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                {!col.alwaysVisible ? (
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveColumn(col.id, "up")}
                      disabled={idx <= 1}
                      className={cn(
                        "text-muted-foreground/40 hover:text-muted-foreground transition-colors",
                        idx <= 1 && "invisible"
                      )}
                    >
                      <IconGripVertical className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="w-3" />
                )}
                <span className="flex-1 text-sm">{col.label}</span>
                <Switch
                  checked={isVisible}
                  onCheckedChange={(checked) =>
                    toggleVisibility(col.id, checked)
                  }
                  disabled={col.alwaysVisible}
                  className="h-4 w-7 data-[state=checked]:bg-primary"
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
