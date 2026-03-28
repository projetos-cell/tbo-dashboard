"use client";

import { useState, useMemo } from "react";
import {
  IconCheck,
  IconSearch,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTeamMembers } from "@/hooks/use-team";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface MemberPickerProps {
  value: string;
  onSelect: (id: string, fullName: string) => void;
  onClear: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberPicker({ value, onSelect, onClear }: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: members } = useTeamMembers({ is_active: true });
  const user = useAuthStore((s) => s.user);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.toLowerCase();
    const list = q
      ? members.filter((m) => m.full_name.toLowerCase().includes(q))
      : members;
    return [...list].sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return a.full_name.localeCompare(b.full_name, "pt-BR");
    });
  }, [members, search, user?.id]);

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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                {getInitials(value)}
              </span>
              <span className="flex-1 truncate text-left">{value}</span>
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
              <IconUserCircle className="size-4" />
              <span>Selecionar responsável</span>
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
            placeholder="Buscar membro..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="px-3 pt-2 pb-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Selecionar um
          </p>
        </div>
        <div className="max-h-[240px] overflow-y-auto px-1 pb-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isCurrentUser = member.id === user?.id;
              const isSelected = member.full_name === value;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member.id, member.full_name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                    {getInitials(member.full_name)}
                  </span>
                  <span className="flex-1 truncate text-left">
                    {member.full_name}
                    {isCurrentUser && (
                      <span className="ml-1 text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </span>
                  {isSelected && <IconCheck className="size-4 text-foreground" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
