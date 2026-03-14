"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { IconSearch } from "@tabler/icons-react";
import { ROLE_CONFIG } from "./team-ui";
import type { TeamFilters } from "@/schemas/team";
import type { RoleSlug } from "@/lib/permissions";

interface TeamToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  filters: TeamFilters;
  onFilterChange: (filters: TeamFilters) => void;
}

export function TeamToolbar({
  searchInput,
  onSearchChange,
  filters,
  onFilterChange,
}: TeamToolbarProps) {
  const roles = ["founder", "diretoria", "lider", "colaborador"] as const;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select
          value={filters.role ?? "all"}
          onValueChange={(v) =>
            onFilterChange({
              ...filters,
              role: v === "all" ? undefined : (v as RoleSlug),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos os niveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os niveis</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            filters.is_active === undefined
              ? "all"
              : filters.is_active
                ? "active"
                : "inactive"
          }
          onValueChange={(v) =>
            onFilterChange({
              ...filters,
              is_active: v === "all" ? undefined : v === "active",
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
