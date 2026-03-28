"use client";

import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "project", label: "Projeto" },
  { value: "demand", label: "Tarefa" },
  { value: "client", label: "Cliente" },
  { value: "contract", label: "Contrato" },
  { value: "financial", label: "Financeiro" },
  { value: "profile", label: "Perfil" },
  { value: "team", label: "Time" },
];

interface AuditFiltersProps {
  search: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (v: string) => void;
  onEntityTypeChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClear: () => void;
}

export function AuditFilters({
  search,
  entityType,
  dateFrom,
  dateTo,
  onSearchChange,
  onEntityTypeChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: AuditFiltersProps) {
  const hasFilters = search || entityType !== "all" || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar ação, entidade, usuário..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-[260px]"
        />
      </div>

      <Select value={entityType} onValueChange={onEntityTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de entidade" />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="w-[160px]"
      />
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="w-[160px]"
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
