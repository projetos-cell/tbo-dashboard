"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

interface DealFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  stageFilter: string;
  onStageChange: (v: string) => void;
}

export function DealFilters({
  search,
  onSearchChange,
  stageFilter,
  onStageChange,
}: DealFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar deals..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={stageFilter === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onStageChange("")}
        >
          Todos
        </Badge>
        {Object.entries(DEAL_STAGES).map(([key, cfg]) => (
          <Badge
            key={key}
            variant={stageFilter === key ? "default" : "outline"}
            className="cursor-pointer"
            style={
              stageFilter === key
                ? { backgroundColor: cfg.color, color: "#fff" }
                : undefined
            }
            onClick={() => onStageChange(key)}
          >
            {cfg.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
