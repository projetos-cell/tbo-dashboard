"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PEOPLE_STATUS } from "@/lib/constants";
import { Search } from "lucide-react";

interface PeopleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function PeopleFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: PeopleFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar pessoas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={statusFilter === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onStatusChange("")}
        >
          Todos
        </Badge>
        {Object.entries(PEOPLE_STATUS).map(([key, cfg]) => (
          <Badge
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            className="cursor-pointer"
            style={
              statusFilter === key
                ? { backgroundColor: cfg.color, color: "#fff" }
                : undefined
            }
            onClick={() => onStatusChange(statusFilter === key ? "" : key)}
          >
            {cfg.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
