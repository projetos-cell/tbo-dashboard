"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KanbanView = "board" | "list" | "table";

export interface KanbanHeaderProps {
  view: KanbanView;
  onViewChange: (view: KanbanView) => void;
}

// ---------------------------------------------------------------------------
// View options config
// ---------------------------------------------------------------------------

const VIEW_OPTIONS: { value: KanbanView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "board", label: "Board", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
  { value: "table", label: "Table", icon: Table2 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanHeader({ view, onViewChange }: KanbanHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <h1 className="text-foreground text-3xl font-bold tracking-tight">Kanban Board</h1>

      {/* View toggle */}
      <Tabs value={view} onValueChange={(v) => onViewChange(v as KanbanView)}>
        <TabsList className="h-9">
          {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 px-3 text-sm">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
