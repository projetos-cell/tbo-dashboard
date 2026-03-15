"use client";

import { IconBookmark, IconBookmarkOff, IconX } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookmarks, useRemoveBookmark } from "../hooks/use-chat-bookmarks";
import type { ProfileInfo } from "../utils/profile-utils";
import { getInitials } from "../utils/profile-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageContent } from "./message-bubble-parts";

interface BookmarksPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileMap: Record<string, ProfileInfo>;
  onJumpToMessage?: (messageId: string) => void;
}

export function BookmarksPanel({
  open,
  onOpenChange,
  profileMap,
  onJumpToMessage,
}: BookmarksPanelProps) {
  const { data: bookmarks, isLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <IconBookmark size={16} />
            Mensagens salvas
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !bookmarks?.length ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center">
              <IconBookmark size={32} className="text-muted-foreground/40" />
              <p className="text-sm font-medium">Nenhuma mensagem salva</p>
              <p className="text-xs text-muted-foreground">
                Salve mensagens importantes para acessar aqui
              </p>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {bookmarks.map((bookmark) => {
                const msg = bookmark.chat_messages;
                if (!msg) return null;
                const profile = profileMap[msg.sender_id ?? ""];
                const senderName = profile?.name ?? "Usuário";
                const time = new Date(msg.created_at ?? "").toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={bookmark.id}
                    className="group rounded-lg border bg-muted/30 p-3 flex gap-3 hover:bg-muted/60 transition-colors"
                  >
                    <Avatar size="sm" className="shrink-0 mt-0.5">
                      {profile?.avatarUrl && (
                        <AvatarImage src={profile.avatarUrl} alt={senderName} />
                      )}
                      <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold truncate">{senderName}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-left leading-relaxed line-clamp-3 hover:text-primary transition-colors w-full"
                        onClick={() => onJumpToMessage?.(msg.id)}
                      >
                        <MessageContent
                          content={msg.content ?? ""}
                          profileMap={profileMap}
                        />
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => removeBookmark.mutate(msg.id)}
                      title="Remover dos favoritos"
                    >
                      <IconBookmarkOff size={13} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
