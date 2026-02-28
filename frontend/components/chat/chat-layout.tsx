"use client";

import { useState } from "react";
import { MessageSquare, Hash } from "lucide-react";
import { ChannelList } from "./channel-list";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useChannels, useMessages, useSendMessage } from "@/hooks/use-chat";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatLayout() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: channels, isLoading: loadingChannels } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { data: messages, isLoading: loadingMessages } = useMessages(selectedChannelId);
  const sendMessage = useSendMessage();

  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);

  function handleSend(content: string) {
    if (!selectedChannelId || !tenantId || !userId) return;
    sendMessage.mutate({
      channel_id: selectedChannelId,
      sender_id: userId,
      tenant_id: tenantId,
      content,
    });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border overflow-hidden">
      {/* Sidebar — channels */}
      <div className="w-60 shrink-0 border-r bg-muted/30 p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Canais
        </h3>
        {loadingChannels ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        ) : !channels || channels.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum canal.</p>
        ) : (
          <ChannelList
            channels={channels}
            selectedId={selectedChannelId}
            onSelect={setSelectedChannelId}
          />
        )}
      </div>

      {/* Main area — messages */}
      <div className="flex flex-1 flex-col">
        {selectedChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{selectedChannel.name}</span>
              {selectedChannel.description && (
                <span className="text-xs text-muted-foreground ml-2 truncate">
                  {selectedChannel.description}
                </span>
              )}
            </div>

            {/* Messages */}
            {loadingMessages ? (
              <div className="flex flex-1 items-center justify-center">
                <Skeleton className="h-8 w-40" />
              </div>
            ) : (
              <MessageList
                messages={messages ?? []}
                currentUserId={userId}
              />
            )}

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              disabled={sendMessage.isPending}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageSquare className="h-12 w-12 opacity-30" />
            <p className="text-sm">Selecione um canal para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
