"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Hash,
  Plus,
  Settings,
  MessageCircle,
  Search,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { ChannelList } from "./channel-list";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { CreateChannelDialog } from "./create-channel-dialog";
import { CreateDMDialog } from "./create-dm-dialog";
import { ChannelSettingsDrawer } from "./channel-settings-drawer";
import { TypingIndicator } from "./typing-indicator";
import { MessageSearch } from "./message-search";
import { OnlineIndicator } from "./online-indicator";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  useChannelsWithMembers,
  useMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useUnreadCounts,
  flattenMessages,
} from "@/features/chat/hooks/use-chat";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useTypingIndicator } from "@/features/chat/hooks/use-typing-indicator";
import { useChatPresence } from "@/features/chat/hooks/use-presence";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import { canPerformChannelAction } from "@/features/chat/utils/chat-permissions";
import { buildProfileMap } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  // Mobile: show conversation panel vs sidebar
  const [showConversation, setShowConversation] = useState(false);

  const { data: channels, isLoading: loadingChannels } =
    useChannelsWithMembers();
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

  // Build profile map for avatars + names
  const profileMap = useMemo(
    () => buildProfileMap(profiles ?? []),
    [profiles],
  );

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

  function handleSelectChannel(id: string) {
    setSelectedChannelId(id);
    setShowConversation(true);
  }

  function handleSend(content: string) {
    if (!selectedChannelId || !tenantId || !userId) return;
    sendMsg.mutate({
      channel_id: selectedChannelId,
      sender_id: userId,
      content,
    });
  }

  function handleEdit(messageId: string, content: string) {
    editMsg.mutate({ messageId, content });
  }

  function handleDelete(messageId: string) {
    deleteMsg.mutate({ messageId });
  }

  const unreadCounts = useChatStore((s) => s.unreadCounts);

  // Resolve conversation header info
  const headerInfo = useMemo(() => {
    if (!selectedChannel) return null;
    if (selectedChannel.type === "direct" && userId) {
      const other = selectedChannel.chat_channel_members?.find(
        (m) => m.user_id !== userId,
      );
      if (other) {
        const p = profileMap[other.user_id];
        return {
          name: p?.name ?? selectedChannel.name ?? "DM",
          avatarUrl: p?.avatarUrl,
          otherUserId: other.user_id,
          icon: null as typeof Hash | null,
        };
      }
    }
    const IconMap: Record<string, typeof Hash> = {
      channel: Hash,
      private: Lock,
      group: null as unknown as typeof Hash,
    };
    return {
      name: selectedChannel.name ?? "",
      avatarUrl: undefined as string | undefined,
      otherUserId: undefined as string | undefined,
      icon: IconMap[selectedChannel.type ?? "channel"] ?? Hash,
    };
  }, [selectedChannel, userId, profileMap]);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "w-80 shrink-0 border-r flex flex-col",
          showConversation && "hidden md:flex",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Mensagens</h3>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCreateDMOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Nova conversa</TooltipContent>
            </Tooltip>
            {canCreateChannel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCreateChannelOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Criar canal</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingChannels ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : !channels || channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-xs">Nenhum canal ainda</p>
            </div>
          ) : (
            <ChannelList
              channels={channels}
              selectedId={selectedChannelId}
              onSelect={handleSelectChannel}
              unreadCounts={unreadCounts}
              currentUserId={userId}
              profileMap={profileMap}
            />
          )}
        </div>
      </div>

      {/* ── Conversation area ───────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex flex-1 flex-col min-w-0",
          !showConversation && "hidden md:flex",
        )}
      >
        {/* Search overlay */}
        <MessageSearch channels={channels ?? []} />
        {selectedChannel && headerInfo ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 border-b px-4 py-2.5">
              {/* Mobile back button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden shrink-0"
                onClick={() => setShowConversation(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {/* Avatar / Icon */}
              {headerInfo.otherUserId ? (
                <span className="relative shrink-0">
                  <Avatar size="sm">
                    {headerInfo.avatarUrl && (
                      <AvatarImage
                        src={headerInfo.avatarUrl}
                        alt={headerInfo.name}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(headerInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator
                    userId={headerInfo.otherUserId}
                    size="sm"
                    className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                  />
                </span>
              ) : headerInfo.icon ? (
                <headerInfo.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : null}

              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-sm truncate">
                  {headerInfo.name}
                </span>
                {selectedChannel.description && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {selectedChannel.description}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={toggleSearch}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Buscar mensagens</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setChannelSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configurações</TooltipContent>
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
                profileMap={profileMap}
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
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-sm">Selecione uma conversa para começar</p>
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
