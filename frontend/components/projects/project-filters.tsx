"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ProjectFiltersProps) {
  const statuses = [
    { key: "all", label: "Todos" },
    ...Object.entries(PROJECT_STATUS).map(([key, config]) => ({
      key,
      label: config.label,
      color: config.color,
    })),
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const isActive = statusFilter === s.key;
          return (
            <Badge
              key={s.key}
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer select-none"
              style={
                isActive && "color" in s
                  ? { backgroundColor: s.color, color: "#fff" }
                  : undefined
              }
              onClick={() => onStatusChange(s.key)}
            >
              {s.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
