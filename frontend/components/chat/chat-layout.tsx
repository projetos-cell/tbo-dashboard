"use client";

import { useEffect, useMemo } from "react";
import { MessageSquare, Hash, Plus, Settings, MessageCircle, Search } from "lucide-react";
import { ChannelList } from "./channel-list";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { CreateChannelDialog } from "./create-channel-dialog";
import { CreateDMDialog } from "./create-dm-dialog";
import { ChannelSettingsDrawer } from "./channel-settings-drawer";
import { TypingIndicator } from "./typing-indicator";
import { MessageSearch } from "./message-search";
import {
  useChannelsWithMembers,
  useMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useUnreadCounts,
  flattenMessages,
} from "@/hooks/use-chat";
import { useProfiles } from "@/hooks/use-people";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useChatPresence } from "@/hooks/use-presence";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import { canPerformChannelAction } from "@/lib/chat-permissions";
import { Skeleton } from "@/components/tbo-ui/skeleton";
import { Button } from "@/components/tbo-ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tbo-ui/tooltip";

export function ChatLayout() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.role) as RoleSlug | null;

  const selectedChannelId = useChatStore((s) => s.selectedChannelId);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);
  const setCreateChannelOpen = useChatStore((s) => s.setCreateChannelOpen);
  const setCreateDMOpen = useChatStore((s) => s.setCreateDMOpen);
  const setChannelSettingsOpen = useChatStore((s) => s.setChannelSettingsOpen);
  const toggleSearch = useChatStore((s) => s.toggleSearch);

  const { data: channels, isLoading: loadingChannels } = useChannelsWithMembers();
  const { data: profiles } = useProfiles();
  const messagesQuery = useMessages(selectedChannelId);
  const { data: unreadData } = useUnreadCounts();

  const { sendTyping } = useTypingIndicator(selectedChannelId);
  useChatPresence();
  const sendMsg = useSendMessage();
  const editMsg = useEditMessage();
  const deleteMsg = useDeleteMessage();
  const markAsRead = useMarkAsRead();

  const messages = flattenMessages(messagesQuery.data);
  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);
  const canDeleteOthers = hasPermission(userRole, "chat.delete_messages");
  const canCreateChannel = hasPermission(userRole, "chat.create_channel");

  // Channel-level permission context
  const myMemberRole = useMemo(() => {
    if (!selectedChannel || !userId) return null;
    const member = selectedChannel.chat_channel_members?.find(
      (m) => m.user_id === userId,
    );
    return member?.role ?? null;
  }, [selectedChannel, userId]);

  const canSendMessage = canPerformChannelAction("send_message", {
    userRole,
    channelMemberRole: myMemberRole,
    channelSettings: (selectedChannel as Record<string, unknown>)?.settings as
      | { who_can_post?: "everyone" | "admins"; is_read_only?: boolean }
      | null
      | undefined,
    isCreator: selectedChannel?.created_by === userId,
  });

  // Build profile name lookup for DM resolution
  const profileNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profiles ?? []) {
      if (p.full_name) map[p.id] = p.full_name;
    }
    return map;
  }, [profiles]);

  // Sync unread counts to store
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);
  useEffect(() => {
    if (unreadData) setUnreadCounts(unreadData);
  }, [unreadData, setUnreadCounts]);

  // Auto mark-as-read with debounce when selecting a channel
  useEffect(() => {
    if (!selectedChannelId || !userId) return;
    const timer = setTimeout(() => {
      markAsRead.mutate({ channelId: selectedChannelId, userId });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId, userId]);

  function handleSend(content: string) {
    if (!selectedChannelId || !tenantId || !userId) return;
    sendMsg.mutate({
      channel_id: selectedChannelId,
      sender_id: userId,
      content,
      tenant_id: tenantId,
    } as never);
  }

  function handleEdit(messageId: string, content: string) {
    editMsg.mutate({ messageId, content });
  }

  function handleDelete(messageId: string) {
    deleteMsg.mutate({ messageId });
  }

  const unreadCounts = useChatStore((s) => s.unreadCounts);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border overflow-hidden">
      {/* Sidebar — channels */}
      <div className="w-60 shrink-0 border-r bg-gray-100/30 p-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Canais
          </h3>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCreateDMOpen(true)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Nova conversa</TooltipContent>
            </Tooltip>
            {canCreateChannel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setCreateChannelOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Criar canal</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {loadingChannels ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        ) : !channels || channels.length === 0 ? (
          <p className="text-xs text-gray-500">Nenhum canal.</p>
        ) : (
          <ChannelList
            channels={channels}
            selectedId={selectedChannelId}
            onSelect={setSelectedChannelId}
            unreadCounts={unreadCounts}
            currentUserId={userId}
            profileNames={profileNames}
          />
        )}
      </div>

      {/* Main area — messages */}
      <div className="relative flex flex-1 flex-col">
        {/* Search overlay */}
        <MessageSearch channels={channels ?? []} />
        {selectedChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">{selectedChannel.name}</span>
              {selectedChannel.description && (
                <span className="text-xs text-gray-500 ml-2 truncate flex-1">
                  {selectedChannel.description}
                </span>
              )}
              <div className="flex items-center gap-0.5 ml-auto shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleSearch}
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Buscar mensagens</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setChannelSettingsOpen(true)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configurações do canal</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Messages */}
            {messagesQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Skeleton className="h-8 w-40" />
              </div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={userId}
                hasNextPage={!!messagesQuery.hasNextPage}
                isFetchingNextPage={messagesQuery.isFetchingNextPage}
                fetchNextPage={messagesQuery.fetchNextPage}
                onEditMessage={handleEdit}
                onDeleteMessage={handleDelete}
                canDeleteOthers={canDeleteOthers}
              />
            )}

            {/* Typing indicator */}
            <TypingIndicator channelId={selectedChannelId} />

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              disabled={sendMsg.isPending || !canSendMessage}
              onTyping={sendTyping}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-500 gap-3">
            <MessageSquare className="h-12 w-12 opacity-30" />
            <p className="text-sm">Selecione um canal para começar</p>
          </div>
        )}
      </div>

      {/* Dialogs & Drawers */}
      <CreateChannelDialog />
      <CreateDMDialog />
      {selectedChannel && (
        <ChannelSettingsDrawer channel={selectedChannel} />
      )}
    </div>
  );
}
