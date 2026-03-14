"use client";

import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECT_STATUS, BU_LIST, BU_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  buFilter: string;
  onBuChange: (bu: string) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  buFilter,
  onBuChange,
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
    <div className="space-y-4">
      {/* BU Tabs — primary filter */}
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

      {/* Search + Status chips row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
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
    </div>
  );
}
