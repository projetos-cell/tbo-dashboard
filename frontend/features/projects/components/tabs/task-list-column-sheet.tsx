"use client";

import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { IconColumns } from "@tabler/icons-react";
import { COLUMNS } from "./task-list-helpers";

interface TaskListColumnSheetProps {
  columnOrder: string[];
  hiddenColumns: Set<string>;
  onToggleVisibility: (colId: string) => void;
  onMoveUp: (colId: string) => void;
  onMoveDown: (colId: string) => void;
}

export function TaskListColumnSheet({
  columnOrder,
  hiddenColumns,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: TaskListColumnSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Personalizar colunas"
        >
          <IconColumns className="size-3.5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[360px]">
        <SheetHeader>
          <SheetTitle>Personalizar Colunas</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {columnOrder.map((colId, idx) => {
            const col = COLUMNS.find((c) => c.id === colId);
            if (!col || col.id === "check") return null;
            const isHidden = hiddenColumns.has(colId);
            return (
              <div key={colId} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button" onClick={() => onMoveUp(colId)}
                    className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === 0}
                  >
                    <IconArrowUp className="size-3" />
                  </button>
                  <button
                    type="button" onClick={() => onMoveDown(colId)}
                    className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === columnOrder.length - 1}
                  >
                    <IconArrowDown className="size-3" />
                  </button>
                </div>
                <span className="flex-1 text-sm">{col.label || col.id}</span>
                {col.id !== "title" && (
                  <Switch checked={!isHidden} onCheckedChange={() => onToggleVisibility(colId)} />
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
