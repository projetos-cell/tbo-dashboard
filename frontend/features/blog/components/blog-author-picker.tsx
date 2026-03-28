"use client";

import { useState } from "react";
import { IconUser, IconCheck, IconX } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeamMembers } from "@/hooks/use-team";
import { getInitials } from "@/lib/utils";

export interface BlogAuthorInfo {
  id: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface BlogAuthorPickerProps {
  authorId: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  onSelect: (author: BlogAuthorInfo) => void;
  disabled?: boolean;
}

export function BlogAuthorPicker({
  authorId,
  authorName,
  authorAvatarUrl,
  onSelect,
  disabled,
}: BlogAuthorPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useTeamMembers({ is_active: true });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-normal"
          disabled={disabled}
        >
          {authorId ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={authorAvatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(authorName ?? "")}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{authorName ?? "Autor"}</span>
              <button
                type="button"
                className="ml-auto text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({ id: null, name: null, avatarUrl: null });
                }}
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <IconUser className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Selecionar autor</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
            <CommandGroup>
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.full_name}
                  onSelect={() => {
                    onSelect({ id: m.id, name: m.full_name, avatarUrl: m.avatar_url ?? null });
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={m.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{m.full_name}</span>
                  {m.id === authorId && <IconCheck className="ml-auto h-4 w-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
