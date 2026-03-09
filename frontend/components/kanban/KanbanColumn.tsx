"use client";

import type { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Props — 7.1
// ---------------------------------------------------------------------------

export interface KanbanColumnProps {
  title: string;
  count: number;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component — 7.3 (contêiner) + 7.4 (área de scroll)
// ---------------------------------------------------------------------------

export function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    // 7.3 — largura fixa, h-full, fundo sutil via bg-muted/50, bordas arredondadas
    <div className="bg-muted/50 flex h-full w-80 flex-shrink-0 flex-col rounded-lg">
      {/* 7.2 — Header: title + count badge */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-base font-semibold">{title}</span>
          <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5 text-xs tabular-nums">
            {count}
          </Badge>
        </div>
      </div>

      {/* 7.4 — Área de cartões: ScrollArea com scroll interno, flex-1 para ocupar altura */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3">{children}</div>
      </ScrollArea>
    </div>
  );
}
