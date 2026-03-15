"use client";

import { useState, useMemo } from "react";
import { IconHash, IconSearch, IconUsers } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrowsableChannels, useJoinChannel } from "@/features/chat/hooks/use-chat";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";

interface BrowseChannelsDialogProps {
  onSelectChannel?: (id: string) => void;
}

export function BrowseChannelsDialog({ onSelectChannel }: BrowseChannelsDialogProps) {
  const open = useChatStore((s) => s.isBrowseChannelsOpen);
  const setOpen = useChatStore((s) => s.setBrowseChannelsOpen);
  const userId = useAuthStore((s) => s.user?.id);

  const [search, setSearch] = useState("");

  const { data: channels, isLoading } = useBrowsableChannels(open);
  const joinChannel = useJoinChannel();

  const { memberOf, notMember } = useMemo(() => {
    if (!channels || !userId) return { memberOf: [], notMember: [] };
    const filtered = search
      ? channels.filter(
          (ch) =>
            ch.name.toLowerCase().includes(search.toLowerCase()) ||
            ch.description?.toLowerCase().includes(search.toLowerCase()),
        )
      : channels;

    const memberOf = filtered.filter((ch) =>
      ch.chat_channel_members?.some((m) => m.user_id === userId),
    );
    const notMember = filtered.filter(
      (ch) => !ch.chat_channel_members?.some((m) => m.user_id === userId),
    );
    return { memberOf, notMember };
  }, [channels, userId, search]);

  function handleJoin(channelId: string) {
    joinChannel.mutate(channelId, {
      onSuccess: () => {
        onSelectChannel?.(channelId);
        setOpen(false);
      },
    });
  }

  function handleOpen(channelId: string) {
    onSelectChannel?.(channelId);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Explorar canais</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar canais..."
            className="pl-9"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[360px] -mx-2 px-2">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {notMember.length === 0 && memberOf.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhum canal encontrado
                </p>
              )}

              {notMember.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1">
                    Canais disponíveis
                  </p>
                  {notMember.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <IconHash size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ch.name}</p>
                        {ch.description && (
                          <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <IconUsers size={10} />
                          {ch.chat_channel_members?.length ?? 0} membros
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shrink-0 h-7 text-xs"
                        onClick={() => handleJoin(ch.id)}
                        disabled={joinChannel.isPending}
                      >
                        Entrar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {memberOf.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1">
                    Canais que você participa
                  </p>
                  {memberOf.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <IconHash size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ch.name}</p>
                        {ch.description && (
                          <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <IconUsers size={10} />
                          {ch.chat_channel_members?.length ?? 0} membros
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-7 text-xs"
                        onClick={() => handleOpen(ch.id)}
                      >
                        Abrir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
