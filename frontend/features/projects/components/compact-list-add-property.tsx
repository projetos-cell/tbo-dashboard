"use client";

import { useMemo } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES_SUGGESTED, PROPERTY_TYPES } from "./compact-list-column-config";
import type { ExtraColumn } from "./compact-list-column-config";

export function AddPropertyPopover({
  open,
  onOpenChange,
  extraColumns,
  propertySearch,
  onPropertySearchChange,
  onAddSuggested,
  onAddType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraColumns: ExtraColumn[];
  propertySearch: string;
  onPropertySearchChange: (value: string) => void;
  onAddSuggested: (key: string) => void;
  onAddType: (type: string) => void;
}) {
  const filteredPropertyTypes = useMemo(() => {
    if (!propertySearch.trim()) return PROPERTY_TYPES;
    const q = propertySearch.toLowerCase();
    return PROPERTY_TYPES.filter((p) => p.label.toLowerCase().includes(q));
  }, [propertySearch]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Adicionar propriedade"
        >
          <IconPlus className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0" sideOffset={4}>
        {/* Suggested */}
        <div className="border-b border-border/60 p-2">
          <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Sugeridas
          </p>
          <div className="grid grid-cols-2 gap-0.5">
            {PROPERTY_TYPES_SUGGESTED.map((prop) => {
              const alreadyAdded = extraColumns.some((c) => c.id === prop.key);
              return (
                <button
                  key={prop.key}
                  type="button"
                  disabled={alreadyAdded}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    alreadyAdded ? "cursor-not-allowed opacity-40" : "hover:bg-muted",
                  )}
                  onClick={() => onAddSuggested(prop.key)}
                >
                  <prop.icon className="size-4 text-muted-foreground" />
                  <span className="truncate">{prop.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + all types */}
        <div className="p-2">
          <div className="mb-1.5 flex items-center gap-1.5 px-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Selecionar tipo
            </p>
            <div className="relative flex-1">
              <IconSearch className="absolute left-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={propertySearch}
                onChange={(e) => onPropertySearchChange(e.target.value)}
                className="h-5 w-full rounded border-0 bg-transparent pl-5 text-xs outline-none placeholder:text-muted-foreground"
                placeholder=""
              />
            </div>
          </div>
          <div className="grid max-h-[280px] grid-cols-2 gap-0.5 overflow-y-auto">
            {filteredPropertyTypes.map((prop) => (
              <button
                key={prop.type}
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                onClick={() => onAddType(prop.type)}
              >
                <prop.icon className="size-4 text-muted-foreground" />
                <span className="truncate">{prop.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
