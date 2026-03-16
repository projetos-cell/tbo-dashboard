"use client";

import { useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import {
  findOrCreateDirectChannel,
  createGroupDM,
} from "@/features/chat/services/chat";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CreateDMDialog() {
  const open = useChatStore((s) => s.isCreateDMOpen);
  const setOpen = useChatStore((s) => s.setCreateDMOpen);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  const qc = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: profiles } = useProfiles();

  const filteredProfiles = (profiles ?? []).filter((p) => {
    if (p.id === userId) return false;
    if (selectedUsers.includes(p.id)) return false;
    if (!search) return true;
    return (
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  async function handleSubmit() {
    if (!userId || !tenantId || selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const supabase = createClient();
      let channel;
      if (selectedUsers.length === 1) {
        // Direct message (1-on-1)
        channel = await findOrCreateDirectChannel(
          supabase,
          tenantId,
          userId,
          selectedUsers[0],
        );
      } else {
        // Group DM
        channel = await createGroupDM(
          supabase,
          tenantId,
          userId,
          selectedUsers,
        );
      }
      // Refresh channel list so the new DM appears in the sidebar
      await qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      setSelectedChannelId(channel.id);
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao criar conversa: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSelectedUsers([]);
    setSearch("");
  }

  function toggleUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  }

  function removeUser(id: string) {
    setSelectedUsers((prev) => prev.filter((u) => u !== id));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            Selecione uma pessoa para DM ou várias para criar um grupo.
          </p>

          {/* Selected users badges */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedUsers.map((id) => {
                const p = profiles?.find((pr) => pr.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {p?.full_name ?? id.slice(0, 8)}
                    <button
                      type="button"
                      onClick={() => removeUser(id)}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pessoas..."
              className="pl-8 h-9"
            />
          </div>

          {/* User list */}
          <ScrollArea className="h-48 rounded border">
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
                    onClick={() => toggleUser(p.id)}
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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || loading}
          >
            {loading
              ? "Criando..."
              : selectedUsers.length <= 1
                ? "Iniciar Conversa"
                : `Criar Grupo (${selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
