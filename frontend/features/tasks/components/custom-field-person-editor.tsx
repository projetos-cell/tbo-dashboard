"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useTeamMembers } from "@/hooks/use-team";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PersonEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useTeamMembers({ is_active: true });
  const selectedId = typeof value === "string" ? value : null;
  const selected = members.find((m) => m.id === selectedId) ?? null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-2",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selected ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                  {getInitials(selected.full_name)}
                </AvatarFallback>
              </Avatar>
              <span>{selected.full_name}</span>
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar pessoa"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>Nenhum membro</CommandEmpty>
            <CommandGroup>
              {selectedId && (
                <CommandItem
                  onSelect={() => { onSave(null); setOpen(false); }}
                  className="text-muted-foreground text-xs"
                >
                  Remover seleção
                </CommandItem>
              )}
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.full_name}
                  onSelect={() => { onSave(m.id); setOpen(false); }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[10px] font-semibold bg-muted">
                      {getInitials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{m.full_name}</span>
                  {m.id === selectedId && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
