"use client";

import { useState, useRef, useMemo } from "react";
import {
  IconBuilding,
  IconCheck,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { cn } from "@/lib/utils";

/* ── Construtora Dropdown (card-sized) ──────────────────────────────── */

export function ConstrutoraCardSelect({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string | null) => void;
}) {
  const { data: allProjects } = useProjects();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const construtoras = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProjects ?? []) {
      if (p.construtora && !/^[0-9a-f]{8}-/i.test(p.construtora)) {
        set.add(p.construtora);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allProjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue =
    search.trim() &&
    !construtoras.some((c) => c.toLowerCase() === search.trim().toLowerCase());

  function handleSelect(v: string) {
    onSave(v);
    setOpen(false);
    setSearch("");
  }

  return (
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setTimeout(() => inputRef.current?.focus(), 50);
          else setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 truncate rounded px-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent/50"
          >
            {value ? (
              <>
                <IconBuilding className="size-3 shrink-0" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground/60">+ Construtora</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start" sideOffset={4}>
          <div className="border-b border-border/60 p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  handleSelect(search.trim().toUpperCase());
                }
              }}
              placeholder="Buscar ou criar..."
              className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto p-1">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(null);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <IconX className="size-3.5" />
                <span>Remover construtora</span>
              </button>
            )}
            {isNewValue && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(search.trim().toUpperCase());
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-blue-600 transition-colors hover:bg-muted"
              >
                <IconPlus className="size-3.5" />
                <span>Criar &quot;{search.trim().toUpperCase()}&quot;</span>
              </button>
            )}
            {filtered.length === 0 && !isNewValue ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                Nenhuma construtora encontrada
              </p>
            ) : (
              filtered.map((c) => {
                const isSelected = c === value;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(c);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                      isSelected && "bg-muted font-medium"
                    )}
                  >
                    <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{c}</span>
                    {isSelected && <IconCheck className="ml-auto size-3.5 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
