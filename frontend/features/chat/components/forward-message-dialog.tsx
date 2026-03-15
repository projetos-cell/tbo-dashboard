"use client";

import { useState, useMemo } from "react";
import { IconHash, IconSearch, IconUsers, IconUser } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { useForwardMessage, useChannelsWithMembers } from "@/features/chat/hooks/use-chat";
import { useAuthStore } from "@/stores/auth-store";

interface ForwardMessageDialogProps {
  message: MessageRow | null;
  senderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string | undefined;
  profileMap: Record<string, ProfileInfo>;
}

export function ForwardMessageDialog({
  message,
  senderName,
  open,
  onOpenChange,
  currentUserId,
  profileMap,
}: ForwardMessageDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const forwardMsg = useForwardMessage();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: channels = [] } = useChannelsWithMembers();

  const filteredChannels = useMemo(() => {
    const q = search.toLowerCase();
    return channels.filter((ch) => {
      if (ch.type === "direct" && currentUserId) {
        const other = ch.chat_channel_members?.find((m) => m.user_id !== currentUserId);
        if (other) {
          const name = profileMap[other.user_id]?.name ?? "";
          return name.toLowerCase().includes(q);
        }
        return false;
      }
      return (ch.name ?? "").toLowerCase().includes(q);
    });
  }, [channels, search, currentUserId, profileMap]);

  function getChannelDisplayName(ch: (typeof channels)[0]) {
    if (ch.type === "direct" && currentUserId) {
      const other = ch.chat_channel_members?.find((m) => m.user_id !== currentUserId);
      return other ? (profileMap[other.user_id]?.name ?? "DM") : "DM";
    }
    return ch.name ?? "";
  }

  function getChannelIcon(ch: (typeof channels)[0]) {
    if (ch.type === "direct") return <IconUser size={14} className="text-muted-foreground" />;
    if (ch.type === "group") return <IconUsers size={14} className="text-muted-foreground" />;
    return <IconHash size={14} className="text-muted-foreground" />;
  }

  function getChannelAvatar(ch: (typeof channels)[0]) {
    if (ch.type === "direct" && currentUserId) {
      const other = ch.chat_channel_members?.find((m) => m.user_id !== currentUserId);
      if (other) {
        const profile = profileMap[other.user_id];
        return profile ? (
          <Avatar size="sm">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name} />}
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
        ) : null;
      }
    }
    return null;
  }

  function handleForward() {
    if (!selectedChannelId || !userId || !message) return;
    forwardMsg.mutate(
      {
        targetChannelId: selectedChannelId,
        senderId: userId,
        originalMessage: message,
        originalSenderName: senderName,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedChannelId(null);
          setSearch("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Encaminhar mensagem</DialogTitle>
        </DialogHeader>

        {/* Message preview */}
        {message && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{senderName}: </span>
            <span className="line-clamp-2">{message.content}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <IconSearch
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar canal ou conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Channel list */}
        <ScrollArea className="h-56">
          <div className="space-y-0.5">
            {filteredChannels.map((ch) => {
              const avatar = getChannelAvatar(ch);
              const name = getChannelDisplayName(ch);
              const isSelected = selectedChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left",
                    isSelected && "bg-primary/10 text-primary",
                  )}
                >
                  {avatar ?? (
                    <span className="flex h-5 w-5 items-center justify-center">
                      {getChannelIcon(ch)}
                    </span>
                  )}
                  <span className="flex-1 truncate">{name}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              );
            })}
            {filteredChannels.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                Nenhum resultado encontrado
              </p>
            )}
          </div>
        </ScrollArea>

        <Button
          onClick={handleForward}
          disabled={!selectedChannelId || forwardMsg.isPending}
          className="w-full"
        >
          {forwardMsg.isPending ? "Encaminhando..." : "Encaminhar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
