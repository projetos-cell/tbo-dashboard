"use client";

import { useState, useMemo } from "react";
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { cn } from "@/lib/utils";

interface ConstrutoraPickerProps {
  value: string;
  onSelect: (name: string) => void;
  onClear: () => void;
}

export function ConstrutoraFormPicker({
  value,
  onSelect,
  onClear,
}: ConstrutoraPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: projects } = useProjects();

  const construtoras = useMemo(() => {
    const set = new Set<string>(["HORIZONTE"]);
    if (projects) {
      for (const p of projects) {
        if (p.construtora && !/^[0-9a-f]{8}-/i.test(p.construtora)) {
          set.add(p.construtora);
        }
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue =
    search.trim() &&
    !construtoras.some(
      (c) => c.toLowerCase() === search.trim().toLowerCase(),
    );

  function handlePick(v: string) {
    onSelect(v);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
            "hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            !value && "text-muted-foreground",
          )}
        >
          {value ? (
            <>
              <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-left">{value}</span>
              <IconChevronDown className="size-3.5 text-muted-foreground" />
              <span
                role="button"
                tabIndex={-1}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onClear();
                  }
                }}
              >
                <IconX className="size-3.5" />
              </span>
            </>
          ) : (
            <>
              <IconBuilding className="size-4" />
              <span>Selecionar construtora</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <IconSearch className="size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                handlePick(search.trim().toUpperCase());
              }
            }}
            placeholder="Buscar ou criar..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto px-1 py-1">
          {isNewValue && (
            <button
              type="button"
              onClick={() => handlePick(search.trim().toUpperCase())}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-blue-600 transition-colors hover:bg-muted"
            >
              <IconPlus className="size-4" />
              <span>Criar &quot;{search.trim().toUpperCase()}&quot;</span>
            </button>
          )}
          {filtered.length === 0 && !isNewValue ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma construtora encontrada
            </p>
          ) : (
            filtered.map((c) => {
              const isSelected = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handlePick(c)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  {isSelected && (
                    <IconCheck className="size-4 text-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
