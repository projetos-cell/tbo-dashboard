"use client";

import { useState } from "react";
import {
  IconArrowsSort,
  IconLayoutList,
  IconFilter,
  IconPlus,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type SortField = "name" | "status" | "construtora" | "due_date" | "created_at";
export type SortDir = "asc" | "desc";
export type GroupField = "none" | "status" | "construtora" | "priority" | "owner";

export interface CustomFilter {
  id: string;
  field: string;
  value: string;
  label: string;
}

export interface ListToolbarState {
  sortField: SortField;
  sortDir: SortDir;
  groupBy: GroupField;
  customFilters: CustomFilter[];
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Nome" },
  { value: "status", label: "Status" },
  { value: "construtora", label: "Construtora" },
  { value: "due_date", label: "Prazo" },
  { value: "created_at", label: "Data de criação" },
];

const GROUP_OPTIONS: { value: GroupField; label: string }[] = [
  { value: "none", label: "Sem agrupamento" },
  { value: "status", label: "Status" },
  { value: "construtora", label: "Construtora" },
  { value: "priority", label: "Prioridade" },
  { value: "owner", label: "Responsável" },
];

const FILTER_FIELDS: { value: string; label: string; options?: { value: string; label: string }[] }[] = [
  {
    value: "status",
    label: "Status",
    options: Object.entries(PROJECT_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
  },
  {
    value: "priority",
    label: "Prioridade",
    options: [
      { value: "urgente", label: "Urgente" },
      { value: "alta", label: "Alta" },
      { value: "media", label: "Média" },
      { value: "baixa", label: "Baixa" },
    ],
  },
  {
    value: "owner",
    label: "Responsável",
  },
];

interface ProjectListToolbarProps {
  state: ListToolbarState;
  onChange: (state: ListToolbarState) => void;
}

export function ProjectListToolbar({ state, onChange }: ProjectListToolbarProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === state.sortField)?.label ?? "Nome";
  const activeGroupLabel = GROUP_OPTIONS.find((o) => o.value === state.groupBy)?.label ?? "Sem agrupamento";

  const handleAddFilter = (field: string, value: string, label: string) => {
    const id = `${field}:${value}`;
    if (state.customFilters.some((f) => f.id === id)) return;
    onChange({
      ...state,
      customFilters: [...state.customFilters, { id, field, value, label }],
    });
    setFilterMenuOpen(false);
  };

  const handleRemoveFilter = (id: string) => {
    onChange({
      ...state,
      customFilters: state.customFilters.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5">
      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
            <IconArrowsSort className="size-3.5" />
            <span className="hidden sm:inline">Ordenar:</span>
            <span className="font-medium text-foreground">{activeSortLabel}</span>
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={state.sortField}
            onValueChange={(v) => onChange({ ...state, sortField: v as SortField })}
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Direção</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={state.sortDir}
            onValueChange={(v) => onChange({ ...state, sortDir: v as SortDir })}
          >
            <DropdownMenuRadioItem value="asc">Crescente (A → Z)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">Decrescente (Z → A)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/60" />

      {/* Group */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
            <IconLayoutList className="size-3.5" />
            <span className="hidden sm:inline">Agrupar:</span>
            <span className={cn("font-medium", state.groupBy !== "none" ? "text-foreground" : "text-muted-foreground")}>
              {activeGroupLabel}
            </span>
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Agrupar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={state.groupBy}
            onValueChange={(v) => onChange({ ...state, groupBy: v as GroupField })}
          >
            {GROUP_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/60" />

      {/* Active custom filters */}
      {state.customFilters.map((f) => (
        <Badge
          key={f.id}
          variant="secondary"
          className="h-6 gap-1 pl-2 pr-1 text-xs"
        >
          {f.label}
          <button
            type="button"
            onClick={() => handleRemoveFilter(f.id)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
          >
            <IconX className="size-3" />
          </button>
        </Badge>
      ))}

      {/* Filter: existing or "+' */}
      <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
            {state.customFilters.length > 0 ? (
              <IconPlus className="size-3.5" />
            ) : (
              <>
                <IconFilter className="size-3.5" />
                <span className="hidden sm:inline">Filtro</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Adicionar filtro
          </p>
          {FILTER_FIELDS.map((field) => (
            <div key={field.value}>
              {field.options ? (
                field.options.map((opt) => {
                  const id = `${field.value}:${opt.value}`;
                  const alreadyAdded = state.customFilters.some((f) => f.id === id);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddFilter(field.value, opt.value, `${field.label}: ${opt.label}`)}
                      className={cn(
                        "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        alreadyAdded
                          ? "cursor-not-allowed text-muted-foreground/50"
                          : "hover:bg-muted",
                      )}
                    >
                      {field.label}: {opt.label}
                    </button>
                  );
                })
              ) : (
                <p className="px-2 py-1.5 text-xs text-muted-foreground italic">
                  {field.label} (em breve)
                </p>
              )}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
