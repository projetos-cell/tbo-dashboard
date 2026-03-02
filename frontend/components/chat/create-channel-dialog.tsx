"use client";

import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
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
import { useProfiles } from "@/hooks/use-people";
import { useCreateChannel } from "@/hooks/use-chat";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";

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

  const filteredProfiles = (profiles ?? []).filter((p) => {
    if (p.id === userId) return false;
    if (selectedMembers.includes(p.id)) return false;
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
            <Label>Membros</Label>

            {/* Selected members badges */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedMembers.map((id) => {
                  const p = profiles?.find((pr) => pr.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {p?.full_name ?? id.slice(0, 8)}
                      <button
                        type="button"
                        onClick={() => removeMember(id)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search + list */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar pessoas..."
                className="pl-8 h-9"
              />
            </div>

            <ScrollArea className="h-36 rounded border">
              <div className="p-1">
                {filteredProfiles.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    Nenhum resultado
                  </p>
                ) : (
                  filteredProfiles.slice(0, 30).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleMember(p.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                        {(p.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{p.full_name}</span>
                      <span className="text-xs text-muted-foreground truncate ml-auto">
                        {p.email}
                      </span>
                    </button>
                  ))
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
