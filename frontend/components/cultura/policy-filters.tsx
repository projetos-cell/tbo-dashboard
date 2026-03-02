"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POLICY_CATEGORIES,
  POLICY_STATUS,
  type PolicyCategoryKey,
  type PolicyStatusKey,
} from "@/lib/constants";

export interface PolicyFilterValues {
  search: string;
  status: string;
  category: string;
  sort: string;
}

interface PolicyFiltersProps {
  filters: PolicyFilterValues;
  onChange: (filters: PolicyFilterValues) => void;
}

export function PolicyFilters({ filters, onChange }: PolicyFiltersProps) {
  const update = (partial: Partial<PolicyFilterValues>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por titulo, categoria, texto..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 h-9"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status chips */}
        <div className="flex gap-1">
          <Badge
            variant={filters.status === "" ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => update({ status: "" })}
          >
            Todas
          </Badge>
          {(
            Object.entries(POLICY_STATUS) as [
              PolicyStatusKey,
              (typeof POLICY_STATUS)[PolicyStatusKey],
            ][]
          ).map(([key, def]) => (
            <Badge
              key={key}
              variant={filters.status === key ? "default" : "outline"}
              className="cursor-pointer text-xs"
              style={
                filters.status === key
                  ? { backgroundColor: def.color, color: "#fff" }
                  : {}
              }
              onClick={() => update({ status: filters.status === key ? "" : key })}
            >
              {def.label}
            </Badge>
          ))}
        </div>

        {/* Category select */}
        <Select
          value={filters.category || "all"}
          onValueChange={(val) => update({ category: val === "all" ? "" : val })}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {(
              Object.entries(POLICY_CATEGORIES) as [
                PolicyCategoryKey,
                (typeof POLICY_CATEGORIES)[PolicyCategoryKey],
              ][]
            ).map(([key, def]) => (
              <SelectItem key={key} value={key}>
                {def.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort select */}
        <Select
          value={filters.sort || "recent"}
          onValueChange={(val) => update({ sort: val })}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="next_review">Proxima revisao</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
