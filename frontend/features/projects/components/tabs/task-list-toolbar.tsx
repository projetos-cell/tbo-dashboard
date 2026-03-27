"use client";

import { useMemo, useState } from "react";
import { IconArrowUp, IconArrowDown, IconArrowsSort, IconAlignLeft, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TaskSortField, TaskListFilters } from "./project-tasks-toolbar";
import { SUGGESTED_EXTRA_COLUMNS, PROPERTY_TYPES, CUSTOM_FIELD_ICON_MAP, type ColumnConfig, type ExtraColumn } from "./task-list-helpers";
import { TaskListColumnSheet } from "./task-list-column-sheet";

function CustomFieldIcon({ type }: { type: string }) {
  const Icon = CUSTOM_FIELD_ICON_MAP[type] ?? IconAlignLeft;
  return <Icon className="size-3 opacity-60" />;
}

function SortIcon({ field, filters }: { field: TaskSortField; filters: TaskListFilters }) {
  if (filters.sortField !== field) return <IconArrowsSort className="size-3 opacity-0 group-hover:opacity-40" />;
  return filters.sortDir === "asc" ? <IconArrowUp className="size-3 text-foreground" /> : <IconArrowDown className="size-3 text-foreground" />;
}

interface CustomFieldDef { id: string; name: string; type: string }

export interface TaskListTableHeaderProps {
  visibleColumns: ColumnConfig[];
  columnOrder: string[];
  hiddenColumns: Set<string>;
  columnWidths: Record<string, number>;
  extraColumns: ExtraColumn[];
  customFields?: CustomFieldDef[];
  filters: TaskListFilters;
  addMenuOpen: boolean;
  setAddMenuOpen: (open: boolean) => void;
  onHeaderClick: (field: TaskSortField) => void;
  onStartResize: (colId: string, startX: number) => void;
  onToggleColumnVisibility: (colId: string) => void;
  onMoveColumnUp: (colId: string) => void;
  onMoveColumnDown: (colId: string) => void;
  onAddExtraColumn: (type: string, label: string, icon: typeof IconAlignLeft) => void;
  onRemoveExtraColumn: (id: string) => void;
  getColumnWidth: (col: ColumnConfig) => number;
}

export function TaskListTableHeader({
  visibleColumns, columnOrder, hiddenColumns, extraColumns, customFields, filters,
  addMenuOpen, setAddMenuOpen, onHeaderClick, onStartResize,
  onToggleColumnVisibility, onMoveColumnUp, onMoveColumnDown,
  onAddExtraColumn, onRemoveExtraColumn, getColumnWidth,
}: TaskListTableHeaderProps) {
  const [propertySearch, setPropertySearch] = useState("");
  const filteredPropertyTypes = useMemo(() => {
    if (!propertySearch.trim()) return PROPERTY_TYPES;
    const q = propertySearch.toLowerCase();
    return PROPERTY_TYPES.filter((p) => p.label.toLowerCase().includes(q));
  }, [propertySearch]);

  return (
    <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
      <div className="w-[28px]" />
      {visibleColumns.map((col) => (
        <div
          key={col.id}
          className={cn("group/col relative", col.hideOnMobile && "hidden md:block")}
          style={{ width: col.flex ? undefined : getColumnWidth(col), flex: col.flex ? "1 1 0%" : "0 0 auto", minWidth: col.flex ? col.minWidth : undefined }}
        >
          <button
            type="button"
            className={cn("group flex w-full items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none", col.sortable && "cursor-pointer hover:text-foreground")}
            onClick={() => col.sortable && col.id !== "check" && onHeaderClick(col.id as TaskSortField)}
            disabled={!col.sortable}
          >
            {col.label}
            {col.sortable && col.id !== "check" && <SortIcon field={col.id as TaskSortField} filters={filters} />}
          </button>
          {col.resizable && (
            <div
              className="absolute -right-1.5 top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 transition-opacity hover:opacity-100 group-hover/col:opacity-60"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onStartResize(col.id, e.clientX); }}
            >
              <div className="h-4 w-0.5 rounded-full bg-primary" />
            </div>
          )}
        </div>
      ))}

      {extraColumns.map((col) => (
        <button key={col.id} type="button" className={cn("group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none hidden md:flex cursor-pointer hover:text-foreground", col.width)} onClick={() => onRemoveExtraColumn(col.id)} title={`Remover "${col.label}"`}>
          <col.icon className="size-3 opacity-60" />
          <span className="truncate">{col.label}</span>
        </button>
      ))}

      {(customFields ?? []).map((field) => (
        <button key={field.id} type="button" className="group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none hidden md:flex cursor-pointer hover:text-foreground" style={{ width: 130, flex: "0 0 auto" }} onClick={() => onRemoveExtraColumn(field.id)} title={`Remover "${field.name}"`}>
          <CustomFieldIcon type={field.type} />
          <span className="truncate">{field.name}</span>
          <IconTrash className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
      ))}

      <TaskListColumnSheet columnOrder={columnOrder} hiddenColumns={hiddenColumns} onToggleVisibility={onToggleColumnVisibility} onMoveUp={onMoveColumnUp} onMoveDown={onMoveColumnDown} />

      <Popover open={addMenuOpen} onOpenChange={(open) => { setAddMenuOpen(open); if (!open) setPropertySearch(""); }}>
        <PopoverTrigger asChild>
          <button type="button" className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Adicionar propriedade">
            <IconPlus className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0" sideOffset={4}>
          <div className="border-b border-border/60 p-2">
            <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sugeridas</p>
            <div className="grid grid-cols-2 gap-0.5">
              {SUGGESTED_EXTRA_COLUMNS.map((prop) => {
                const alreadyAdded = extraColumns.some((c) => c.id.includes(prop.key));
                return (
                  <button key={prop.key} type="button" disabled={alreadyAdded} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors", alreadyAdded ? "cursor-not-allowed opacity-40" : "hover:bg-muted")} onClick={() => onAddExtraColumn(prop.key, prop.label, prop.icon)}>
                    <prop.icon className="size-4 text-muted-foreground" />
                    <span className="truncate">{prop.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-2">
            <div className="mb-1.5 flex items-center gap-1.5 px-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Selecionar tipo</p>
              <div className="relative flex-1">
                <IconSearch className="absolute left-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} className="h-5 w-full rounded border-0 bg-transparent pl-5 text-xs outline-none placeholder:text-muted-foreground" placeholder="" />
              </div>
            </div>
            <div className="grid max-h-[280px] grid-cols-2 gap-0.5 overflow-y-auto">
              {filteredPropertyTypes.map((prop) => (
                <button key={prop.type} type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted" onClick={() => onAddExtraColumn(prop.type, prop.label, prop.icon)}>
                  <prop.icon className="size-4 text-muted-foreground" />
                  <span className="truncate">{prop.label}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
