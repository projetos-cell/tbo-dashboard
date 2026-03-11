"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconMessageCircle2,
  IconHash,
  IconPlus,
  IconSettings,
  IconMessage,
  IconSearch,
  IconArrowLeft,
  IconLock,
  IconFolderPlus,
} from "@tabler/icons-react";
import { PinnedBanner } from "./pinned-banner";
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
  useSections,
  useTogglePin,
  useArchivedChannels,
  useArchiveChannel,
  useUnarchiveChannel,
  useDeleteChannelPermanently,
  useUpdateChannel,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  flattenMessages,
} from "@/features/chat/hooks/use-chat";
import {
  uploadChatFile,
  createAttachmentRecord,
} from "@/features/chat/services/chat-attachments";
import {
  extractMentionIds,
  notifyOnChatMention,
} from "@/services/notification-triggers";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useTypingIndicator } from "@/features/chat/hooks/use-typing-indicator";
import { useChatPresence } from "@/features/chat/hooks/use-presence";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import { canPerformChannelAction } from "@/features/chat/utils/chat-permissions";
import { buildProfileMap, getInitials } from "@/features/chat/utils/profile-utils";
import type { MentionOption } from "./mention-popup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const isSearchOpen = useChatStore((s) => s.isSearchOpen);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);

  // Ctrl/Cmd+F opens search, Escape closes it
  const handleSearchKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (!isSearchOpen) toggleSearch();
      }
      if (e.key === "Escape" && isSearchOpen) {
        toggleSearch();
        setSearchQuery("");
      }
    },
    [isSearchOpen, toggleSearch, setSearchQuery],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleSearchKeyboard);
    return () => document.removeEventListener("keydown", handleSearchKeyboard);
  }, [handleSearchKeyboard]);

  // Mobile: show conversation panel vs sidebar
  const [showConversation, setShowConversation] = useState(false);

  const setCreateSectionOpen = useChatStore((s) => s.setCreateSectionOpen);

  const { data: channels, isLoading: loadingChannels } =
    useChannelsWithMembers();
  const { data: sections } = useSections();
  const { data: archivedChannels } = useArchivedChannels();
  const { data: profiles } = useProfiles();
  const messagesQuery = useMessages(selectedChannelId);
  const { data: unreadData } = useUnreadCounts();

  const { sendTyping } = useTypingIndicator(selectedChannelId);
  useChatPresence();
  const sendMsg = useSendMessage();
  const editMsg = useEditMessage();
  const deleteMsg = useDeleteMessage();
  const togglePin = useTogglePin();
  const markAsRead = useMarkAsRead();
  const archiveChannelMut = useArchiveChannel();
  const unarchiveChannelMut = useUnarchiveChannel();
  const deleteChannelMut = useDeleteChannelPermanently();
  const updateChannelMut = useUpdateChannel();
  const createSectionMut = useCreateSection();
  const updateSectionMut = useUpdateSection();
  const deleteSectionMut = useDeleteSection();

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

  const channelPermCtx = useMemo(
    () => ({
      userRole,
      channelMemberRole: myMemberRole,
      channelSettings: null as null,
      isCreator: selectedChannel?.created_by === userId,
    }),
    [userRole, myMemberRole, selectedChannel, userId],
  );
  const canPin = canPerformChannelAction("pin_message", channelPermCtx);

  // Scroll to a specific message by ID (used by pinned banner)
  const handleScrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-primary/10");
      setTimeout(() => el.classList.remove("bg-primary/10"), 2000);
    }
  }, []);

  // Build profile map for avatars + names
  const profileMap = useMemo(
    () => buildProfileMap(profiles ?? []),
    [profiles],
  );

  // Build mention options from channel members (excluding self)
  const mentionOptions: MentionOption[] = useMemo(() => {
    if (!selectedChannel?.chat_channel_members || !userId) return [];
    return selectedChannel.chat_channel_members
      .filter((m) => m.user_id !== userId)
      .map((m) => {
        const p = profileMap[m.user_id];
        return {
          id: m.user_id,
          name: p?.name ?? "Usuário",
          avatarUrl: p?.avatarUrl,
        };
      })
      .filter((o) => o.name !== "Usuário");
  }, [selectedChannel, userId, profileMap]);

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

  const canManageChannels = hasPermission(userRole, "chat.create_channel");

  function handleArchiveChannel(id: string) {
    archiveChannelMut.mutate(id);
    if (selectedChannelId === id) setSelectedChannelId(null);
  }

  function handleDeleteChannel(id: string) {
    deleteChannelMut.mutate(id);
    if (selectedChannelId === id) setSelectedChannelId(null);
  }

  function handleUnarchiveChannel(id: string) {
    unarchiveChannelMut.mutate(id);
  }

  function handleMoveToSection(channelId: string, sectionId: string | null) {
    updateChannelMut.mutate({ id: channelId, updates: { section_id: sectionId } });
  }

  function handleCreateSection(name: string) {
    createSectionMut.mutate({ name });
  }

  function handleRenameSection(id: string, name: string) {
    updateSectionMut.mutate({ id, updates: { name } });
  }

  function handleDeleteSection(id: string) {
    deleteSectionMut.mutate(id);
  }

  function handleSelectChannel(id: string) {
    setSelectedChannelId(id);
    setShowConversation(true);
  }

  async function handleSend(content: string, files?: File[]) {
    if (!selectedChannelId || !tenantId || !userId) return;

    // Send the message first
    const message = await sendMsg.mutateAsync({
      channel_id: selectedChannelId,
      sender_id: userId,
      content,
      message_type: files?.length ? "file" : "text",
    });

    const supabase = (await import("@/lib/supabase/client")).createClient();

    // A.8: Notify mentioned users (fire-and-forget)
    const mentionedIds = extractMentionIds(content);
    if (mentionedIds.length > 0) {
      const senderName = profileMap[userId]?.name ?? "Alguém";
      const channelName = selectedChannel?.name ?? "chat";
      notifyOnChatMention(supabase, {
        tenantId,
        senderId: userId,
        senderName,
        channelId: selectedChannelId,
        channelName,
        messageContent: content,
        mentionedUserIds: mentionedIds,
      }).catch(() => {});
    }

    // Upload files and create attachment records
    if (files?.length && message?.id) {
      const toastId = toast.loading(
        `Enviando ${files.length} arquivo${files.length > 1 ? "s" : ""}...`,
      );
      let successCount = 0;
      let failCount = 0;

      for (const file of files) {
        try {
          const { url } = await uploadChatFile(supabase, tenantId, selectedChannelId, file);
          await createAttachmentRecord(supabase, message.id, file, url);
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (failCount === 0) {
        toast.success(
          `${successCount} arquivo${successCount > 1 ? "s" : ""} enviado${successCount > 1 ? "s" : ""}`,
          { id: toastId },
        );
      } else {
        toast.error(
          `${failCount} arquivo${failCount > 1 ? "s" : ""} falhou. ${successCount} enviado${successCount > 1 ? "s" : ""}.`,
          { id: toastId },
        );
      }
    }
  }

  function handleEdit(messageId: string, content: string) {
    editMsg.mutate({ messageId, content });
  }

  function handleDelete(messageId: string) {
    deleteMsg.mutate({ messageId });
  }

  function handleTogglePin(messageId: string, pinned: boolean) {
    togglePin.mutate({ messageId, pinned });
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
          icon: null as typeof IconHash | null,
        };
      }
    }
    const IconMap: Record<string, typeof IconHash> = {
      channel: IconHash,
      private: IconLock,
      group: null as unknown as typeof IconHash,
    };
    return {
      name: selectedChannel.name ?? "",
      avatarUrl: undefined as string | undefined,
      otherUserId: undefined as string | undefined,
      icon: IconMap[selectedChannel.type ?? "channel"] ?? IconHash,
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
                  <IconMessage size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Nova conversa</TooltipContent>
            </Tooltip>
            {canCreateChannel && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCreateSectionOpen(true)}
                    >
                      <IconFolderPlus size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Criar seção</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCreateChannelOpen(true)}
                    >
                      <IconPlus size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Criar canal</TooltipContent>
                </Tooltip>
              </>
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
              <IconMessageCircle2 size={32} className="opacity-30 mb-2" />
              <p className="text-xs">Nenhum canal ainda</p>
            </div>
          ) : (
            <ChannelList
              channels={channels}
              archivedChannels={archivedChannels ?? []}
              selectedId={selectedChannelId}
              onSelect={handleSelectChannel}
              unreadCounts={unreadCounts}
              currentUserId={userId}
              profileMap={profileMap}
              sections={sections ?? []}
              onArchiveChannel={handleArchiveChannel}
              onDeleteChannel={handleDeleteChannel}
              onUnarchiveChannel={handleUnarchiveChannel}
              onMoveToSection={handleMoveToSection}
              onCreateSection={handleCreateSection}
              onRenameSection={handleRenameSection}
              onDeleteSection={handleDeleteSection}
              canManageChannels={canManageChannels}
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
                <IconArrowLeft size={16} />
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
                <headerInfo.icon size={16} className="text-muted-foreground shrink-0" />
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
                      <IconSearch size={16} />
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
                      <IconSettings size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configurações</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Pinned message banner */}
            <PinnedBanner
              channelId={selectedChannelId}
              profileMap={profileMap}
              onClickMessage={handleScrollToMessage}
            />

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
                onTogglePin={canPin ? handleTogglePin : undefined}
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
              mentionOptions={mentionOptions}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
            <IconMessageCircle2 size={48} className="opacity-20" />
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
