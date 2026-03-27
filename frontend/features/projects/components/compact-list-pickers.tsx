"use client";

import { useState, useMemo, useRef } from "react";
import {
  IconUserCircle,
  IconX,
  IconPlus,
  IconBuilding,
  IconCheck,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTeamMembers } from "@/hooks/use-team";
import { cn } from "@/lib/utils";

// ─── Person Dropdown Select ───────────────────────────────────────────────────

export function PersonSelect({
  value,
  currentId,
  onChange,
}: {
  value: string;
  currentId: string;
  onChange: (id: string | null, name: string | null) => void;
}) {
  const { data: members } = useTeamMembers({ is_active: true });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.full_name.toLowerCase().includes(q));
  }, [members, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {value ? (
            <>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700"
              >
                {value
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1">
          {currentId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconUserCircle className="size-4" />
              <span>Remover responsavel</span>
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isSelected = member.id === currentId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(member.id, member.full_name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                    {member.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-left">{member.full_name}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">atual</span>
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

// ─── Construtora Picker Cell ──────────────────────────────────────────────────

export function ConstrutoraSelect({
  value,
  construtoras,
  onChange,
}: {
  value: string;
  construtoras: string[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue = search.trim() && !construtoras.some(
    (c) => c.toLowerCase() === search.trim().toLowerCase()
  );

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
    setSearch("");
  }

  return (
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
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {value ? (
            <>
              <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
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
        <div className="max-h-[220px] overflow-y-auto p-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
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
                    isSelected && "bg-muted/60",
                  )}
                >
                  <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  {isSelected && (
                    <IconCheck className="size-3.5 text-foreground" />
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
