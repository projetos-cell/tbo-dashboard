"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OKR_STATUS, OKR_LEVELS } from "@/lib/constants";
import type { OkrStatusKey, OkrLevelKey } from "@/lib/constants";

interface OkrFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  levelFilter: string;
  onLevelChange: (v: string) => void;
}

export function OkrFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  levelFilter,
  onLevelChange,
}: OkrFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar objetivos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-muted-foreground text-xs font-medium self-center mr-1">
          Nível:
        </span>
        <Badge
          variant={levelFilter === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onLevelChange("")}
        >
          Todos
        </Badge>
        {(Object.entries(OKR_LEVELS) as [OkrLevelKey, (typeof OKR_LEVELS)[OkrLevelKey]][]).map(
          ([key, cfg]) => (
            <Badge
              key={key}
              variant={levelFilter === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onLevelChange(levelFilter === key ? "" : key)}
            >
              {cfg.label}
            </Badge>
          ),
        )}

        <span className="text-muted-foreground text-xs font-medium self-center ml-3 mr-1">
          Status:
        </span>
        <Badge
          variant={statusFilter === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onStatusChange("")}
        >
          Todos
        </Badge>
        {(Object.entries(OKR_STATUS) as [OkrStatusKey, (typeof OKR_STATUS)[OkrStatusKey]][]).map(
          ([key, cfg]) => (
            <Badge
              key={key}
              variant={statusFilter === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onStatusChange(statusFilter === key ? "" : key)}
            >
              {cfg.label}
            </Badge>
          ),
        )}
      </div>
    </div>
  );
}
