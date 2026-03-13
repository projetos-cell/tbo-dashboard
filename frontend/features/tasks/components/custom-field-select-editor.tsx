"use client";

import { useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { FieldOption } from "@/schemas/custom-field";

// ─── Select Editor ────────────────────────────────────

export function SelectEditor({
  value,
  options,
  onSave,
  readonly,
}: {
  value: unknown;
  options: FieldOption[];
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedId = typeof value === "string" ? value : null;
  const selected = options.find((o) => o.id === selectedId) ?? null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selected ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 border font-normal"
              style={
                selected.color
                  ? {
                      backgroundColor: selected.color + "22",
                      color: selected.color,
                      borderColor: selected.color + "44",
                    }
                  : undefined
              }
            >
              {selected.label}
            </Badge>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar"}
            </span>
          )}
          {!readonly && <IconChevronDown className="h-3 w-3 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar opção..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção</CommandEmpty>
            <CommandGroup>
              {selectedId && (
                <CommandItem
                  onSelect={() => { onSave(null); setOpen(false); }}
                  className="text-muted-foreground text-xs"
                >
                  Limpar seleção
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.label}
                  onSelect={() => { onSave(opt.id); setOpen(false); }}
                  className="flex items-center gap-2"
                >
                  {opt.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span className="flex-1">{opt.label}</span>
                  {opt.id === selectedId && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Multi-Select Editor ─────────────────────────────

export function MultiSelectEditor({
  value,
  options,
  onSave,
  readonly,
}: {
  value: unknown;
  options: FieldOption[];
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedIds: string[] = Array.isArray(value) ? (value as string[]) : [];
  const selectedOptions = options.filter((o) => selectedIds.includes(o.id));

  function toggle(optId: string) {
    const next = selectedIds.includes(optId)
      ? selectedIds.filter((id) => id !== optId)
      : [...selectedIds, optId];
    onSave(next);
  }

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1 py-0.5 -mx-1 transition-colors flex flex-wrap items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.map((opt) => (
                <Badge
                  key={opt.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 border font-normal"
                  style={
                    opt.color
                      ? {
                          backgroundColor: opt.color + "22",
                          color: opt.color,
                          borderColor: opt.color + "44",
                        }
                      : undefined
                  }
                >
                  {opt.label}
                </Badge>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar"}
            </span>
          )}
          {!readonly && <IconChevronDown className="h-3 w-3 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar opções..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.label}
                    onSelect={() => toggle(opt.id)}
                    className="flex items-center gap-2"
                  >
                    {opt.color && (
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
