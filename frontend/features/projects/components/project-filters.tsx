"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BU_LIST, BU_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  buFilter: string;
  onBuChange: (bu: string) => void;
}

export function ProjectFilters({
  buFilter,
  onBuChange,
}: ProjectFiltersProps) {
  return (
    <Tabs value={buFilter} onValueChange={onBuChange}>
      <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
        <TabsTrigger
          value="all"
          className={cn(
            "data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            buFilter !== "all" && "text-muted-foreground hover:text-foreground",
          )}
        >
          Todos
        </TabsTrigger>
        {BU_LIST.map((bu) => {
          const buStyle = BU_COLORS[bu];
          const isActive = buFilter === bu;
          return (
            <TabsTrigger
              key={bu}
              value={bu}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={
                isActive && buStyle
                  ? { backgroundColor: buStyle.color, color: "#fff" }
                  : undefined
              }
            >
              {bu}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
