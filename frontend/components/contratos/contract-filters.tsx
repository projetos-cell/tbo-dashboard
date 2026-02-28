"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { CONTRACT_STATUS, type ContractStatusKey } from "@/lib/constants";

interface ContractFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
}

const statusOptions: { key: string; label: string }[] = [
  { key: "", label: "Todos" },
  ...Object.entries(CONTRACT_STATUS).map(([key, cfg]) => ({
    key,
    label: cfg.label,
  })),
];

export function ContractFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ContractFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar contratos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.key;
          const cfg = CONTRACT_STATUS[opt.key as ContractStatusKey];
          return (
            <Badge
              key={opt.key}
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer"
              style={
                isActive && cfg
                  ? { backgroundColor: cfg.color, color: "#fff" }
                  : undefined
              }
              onClick={() => onStatusChange(opt.key)}
            >
              {opt.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
