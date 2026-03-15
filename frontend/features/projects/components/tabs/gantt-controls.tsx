"use client";

import { useState } from "react";
import {
  IconFilter,
  IconPalette,
  IconLayoutRows,
  IconFlag,
  IconCalendarEvent,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────

export type GanttViewMode = "Day" | "Week" | "Month";
export type GanttFilter = "all" | "incomplete" | "complete";
export type GanttColorBy = "status" | "priority" | "assignee" | "section";

export interface GanttOptions {
  viewMode: GanttViewMode;
  filter: GanttFilter;
  colorBy: GanttColorBy;
  compact: boolean;
  showBaseline: boolean;
  autoSchedule: boolean;
}

export const DEFAULT_GANTT_OPTIONS: GanttOptions = {
  viewMode: "Week",
  filter: "all",
  colorBy: "status",
  compact: false,
  showBaseline: false,
  autoSchedule: false,
};

// ─── Config ───────────────────────────────────────────────

const VIEW_MODES: { value: GanttViewMode; label: string }[] = [
  { value: "Day", label: "Dia" },
  { value: "Week", label: "Semana" },
  { value: "Month", label: "Mês" },
];

const FILTER_OPTIONS: { value: GanttFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "incomplete", label: "Incompletas" },
  { value: "complete", label: "Concluídas" },
];

const COLOR_OPTIONS: { value: GanttColorBy; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
  { value: "assignee", label: "Responsável" },
  { value: "section", label: "Seção" },
];

// ─── Props ────────────────────────────────────────────────

interface GanttControlsProps {
  options: GanttOptions;
  onChange: (options: GanttOptions) => void;
  hasBaseline?: boolean;
  onSaveBaseline?: () => void;
  onClearBaseline?: () => void;
}

// ─── Component ────────────────────────────────────────────

export function GanttControls({
  options,
  onChange,
  hasBaseline = false,
  onSaveBaseline,
  onClearBaseline,
}: GanttControlsProps) {
  const set = <K extends keyof GanttOptions>(key: K, value: GanttOptions[K]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View mode buttons */}
      <div className="flex items-center gap-0.5 rounded-md border border-border/50 p-0.5">
        {VIEW_MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => set("viewMode", value)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              options.viewMode === value
                ? "bg-[#e85102] text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <IconFilter className="size-3.5" />
            {FILTER_OPTIONS.find((o) => o.value === options.filter)?.label}
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">Filtrar tarefas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FILTER_OPTIONS.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => set("filter", value)}
              className={cn(options.filter === value && "font-medium")}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color by */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <IconPalette className="size-3.5" />
            Cor: {COLOR_OPTIONS.find((o) => o.value === options.colorBy)?.label}
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">Cor das barras</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {COLOR_OPTIONS.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => set("colorBy", value)}
              className={cn(options.colorBy === value && "font-medium")}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compact */}
      <Button
        variant={options.compact ? "default" : "outline"}
        size="sm"
        className={cn("gap-1.5 text-xs h-7", options.compact && "bg-[#e85102] border-[#e85102]")}
        onClick={() => set("compact", !options.compact)}
      >
        <IconLayoutRows className="size-3.5" />
        Compacto
      </Button>

      {/* Baseline */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={options.showBaseline ? "default" : "outline"}
            size="sm"
            className={cn("gap-1.5 text-xs h-7", options.showBaseline && "bg-[#e85102] border-[#e85102]")}
          >
            <IconFlag className="size-3.5" />
            Baseline
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">Linha de base</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => set("showBaseline", !options.showBaseline)}>
            {options.showBaseline ? "Ocultar baseline" : "Exibir baseline"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSaveBaseline}>
            {hasBaseline ? "Atualizar baseline" : "Salvar baseline"}
          </DropdownMenuItem>
          {hasBaseline && (
            <DropdownMenuItem
              onClick={onClearBaseline}
              className="text-red-600 focus:text-red-600"
            >
              Remover baseline
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auto-schedule */}
      <div className="flex items-center gap-1.5 ml-1">
        <Switch
          id="auto-schedule"
          checked={options.autoSchedule}
          onCheckedChange={(v) => set("autoSchedule", v)}
          className="h-4 w-7 [&>span]:size-3"
        />
        <Label htmlFor="auto-schedule" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
          <IconCalendarEvent className="size-3.5" />
          Auto-agendar
        </Label>
      </div>
    </div>
  );
}
