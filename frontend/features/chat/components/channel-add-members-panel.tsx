"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

interface ChannelAddMembersPanelProps {
  profiles: Profile[];
  memberIds: Set<string>;
  selectedNewMembers: string[];
  memberSearch: string;
  isAdding: boolean;
  onSearchChange: (value: string) => void;
  onToggleMember: (id: string) => void;
  onRemoveSelected: (id: string) => void;
  onConfirm: () => void;
}

export function ChannelAddMembersPanel({
  profiles,
  memberIds,
  selectedNewMembers,
  memberSearch,
  isAdding,
  onSearchChange,
  onToggleMember,
  onRemoveSelected,
  onConfirm,
}: ChannelAddMembersPanelProps) {
  const filteredProfiles = profiles.filter((p) => {
    if (memberIds.has(p.id)) return false;
    if (selectedNewMembers.includes(p.id)) return false;
    if (!memberSearch) return true;
    return (
      p.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );
  });

  function profileName(id: string) {
    return profiles.find((p) => p.id === id)?.full_name ?? id.slice(0, 8);
  }

  return (
    <div className="space-y-2 rounded-md border p-2">
      {selectedNewMembers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedNewMembers.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 pr-1">
              {profileName(id)}
              <button
                type="button"
                onClick={() => onRemoveSelected(id)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <IconSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={memberSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar pessoas..."
          className="pl-8 h-9"
        />
      </div>

      <ScrollArea className="h-28 rounded border">
        <div className="p-1">
          {filteredProfiles.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2 text-center">Nenhum resultado</p>
          ) : (
            filteredProfiles.slice(0, 20).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleMember(p.id)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                  {(p.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-xs">{p.full_name}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <Button
        size="sm"
        className="w-full h-8 text-xs"
        onClick={onConfirm}
        disabled={selectedNewMembers.length === 0 || isAdding}
      >
        {isAdding ? "Adicionando..." : `Adicionar ${selectedNewMembers.length} membro(s)`}
      </Button>
    </div>
  );
}
