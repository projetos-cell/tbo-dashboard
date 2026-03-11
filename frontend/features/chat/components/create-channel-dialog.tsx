"use client";

import { useState } from "react";
import { IconX, IconSearch, IconCheck } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useCreateChannel } from "@/features/chat/hooks/use-chat";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { cn } from "@/lib/utils";

/** "Nathália Runge Martins Rodrigues" → "Nathália R." */
function abbreviateName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return full;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

export function CreateChannelDialog() {
  const open = useChatStore((s) => s.isCreateChannelOpen);
  const setOpen = useChatStore((s) => s.setCreateChannelOpen);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);
  const userId = useAuthStore((s) => s.user?.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("channel");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const { data: profiles } = useProfiles();
  const createChannel = useCreateChannel();

  // All available profiles (excluding self)
  const availableProfiles = (profiles ?? []).filter(
    (p) => p.id !== userId,
  );

  // Filtered for search (but keep selected ones visible with check)
  const filteredProfiles = availableProfiles.filter((p) => {
    if (!memberSearch) return true;
    return (
      p.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );
  });

  function handleSubmit() {
    if (!name.trim()) return;
    createChannel.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        memberIds: selectedMembers,
      },
      {
        onSuccess: (channel) => {
          setSelectedChannelId(channel.id);
          handleClose();
        },
      },
    );
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setDescription("");
    setType("channel");
    setSelectedMembers([]);
    setMemberSearch("");
  }

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  function removeMember(id: string) {
    setSelectedMembers((prev) => prev.filter((m) => m !== id));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Canal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ch-name">Nome do canal</Label>
            <Input
              id="ch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: marketing, dev-backend"
              maxLength={60}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ch-desc">Descrição (opcional)</Label>
            <Input
              id="ch-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sobre o que é esse canal?"
              maxLength={200}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="channel">Canal público</SelectItem>
                <SelectItem value="private">Canal privado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members */}
          <div className="space-y-1.5">
            <Label>
              Membros
              {selectedMembers.length > 0 && (
                <span className="text-muted-foreground font-normal ml-1.5">
                  ({selectedMembers.length} selecionado{selectedMembers.length > 1 ? "s" : ""})
                </span>
              )}
            </Label>

            {/* Selected members badges */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedMembers.map((id) => {
                  const p = profiles?.find((pr) => pr.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {p?.full_name ? abbreviateName(p.full_name) : id.slice(0, 8)}
                      <button
                        type="button"
                        onClick={() => removeMember(id)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar pessoas..."
                className="pl-8 h-9"
              />
            </div>

            {/* Member list */}
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-1">
                {filteredProfiles.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center">
                    Nenhum resultado
                  </p>
                ) : (
                  filteredProfiles.slice(0, 30).map((p) => {
                    const isSelected = selectedMembers.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleMember(p.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                        )}
                      >
                        <Avatar size="sm" className="shrink-0">
                          {p.avatar_url && (
                            <AvatarImage
                              src={p.avatar_url}
                              alt={p.full_name ?? ""}
                            />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(p.full_name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate flex-1 text-left">
                          {p.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {p.email}
                        </span>
                        {isSelected && (
                          <IconCheck className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createChannel.isPending}
          >
            {createChannel.isPending ? "Criando..." : "Criar Canal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
