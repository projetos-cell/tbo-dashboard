"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { IconInbox } from "@tabler/icons-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={[
        "flex h-full w-80 flex-shrink-0 flex-col rounded-lg transition-colors duration-150",
        isOver ? "bg-primary/8 ring-2 ring-primary/30" : "bg-muted/50",
      ].join(" ")}
    >
      {/* Header: title + count badge */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-base font-semibold">{title}</span>
          <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5 text-xs tabular-nums">
            {count}
          </Badge>
        </div>
      </div>

      {/* Área de cartões */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center">
              <IconInbox className="text-muted-foreground h-6 w-6" />
              <p className="text-muted-foreground text-xs">Arraste projetos aqui</p>
            </div>
          ) : (
            children
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
