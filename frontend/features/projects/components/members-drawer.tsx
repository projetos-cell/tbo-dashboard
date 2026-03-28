"use client";

import { useState, useMemo, useCallback } from "react";
import { IconPlus, IconTrash, IconSearch } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MemberInfo } from "./member-avatar-stack";

interface MembersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberInfo[];
  allProfiles: MemberInfo[];
  onAddMember: (member: MemberInfo) => void;
  onRemoveMember: (memberId: string) => void;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function MembersDrawer({
  open,
  onOpenChange,
  members,
  allProfiles,
  onAddMember,
  onRemoveMember,
}: MembersDrawerProps) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const handleConfirmRemove = useCallback(() => {
    if (pendingRemoveId) {
      onRemoveMember(pendingRemoveId);
      setPendingRemoveId(null);
    }
  }, [pendingRemoveId, onRemoveMember]);

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const q = search.toLowerCase();
    return members.filter((m) =>
      m.full_name?.toLowerCase().includes(q)
    );
  }, [members, search]);

  const memberIds = new Set(members.map((m) => m.id));
  const availableProfiles = useMemo(() => {
    return allProfiles.filter(
      (p) => !memberIds.has(p.id) && p.full_name?.toLowerCase().includes(addSearch.toLowerCase())
    );
  }, [allProfiles, memberIds, addSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Membros do Projeto ({members.length})</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search + Add */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                placeholder="Buscar membro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Popover open={addOpen} onOpenChange={setAddOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <IconPlus className="size-3.5" />
                  Adicionar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-2 border-b">
                  <input
                    autoFocus
                    placeholder="Buscar pessoa..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {availableProfiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-3">
                      Nenhuma pessoa disponível
                    </p>
                  ) : (
                    availableProfiles.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          onAddMember(person);
                          setAddSearch("");
                        }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent/60 transition-colors"
                      >
                        <Avatar className="size-6 shrink-0">
                          <AvatarImage src={person.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {getInitials(person.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-left truncate">{person.full_name}</span>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Members list */}
          <div className="space-y-1 overflow-y-auto flex-1">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {members.length === 0
                  ? "Nenhum membro neste projeto"
                  : "Nenhum resultado para a busca"}
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                    onClick={() => setPendingRemoveId(member.id)}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={pendingRemoveId !== null}
        onOpenChange={(o) => { if (!o) setPendingRemoveId(null); }}
        title="Remover membro?"
        description="Este membro será removido do projeto."
        confirmLabel="Remover"
        onConfirm={handleConfirmRemove}
      />
    </Dialog>
  );
}
