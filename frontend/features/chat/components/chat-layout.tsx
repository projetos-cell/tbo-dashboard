"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconMessageCircle2 } from "@tabler/icons-react";
import { PinnedBanner } from "./pinned-banner";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { CreateChannelDialog } from "./create-channel-dialog";
import { CreateDMDialog } from "./create-dm-dialog";
import { ChannelSettingsDrawer } from "./channel-settings-drawer";
import { TypingIndicator } from "./typing-indicator";
import { MessageSearch } from "./message-search";
import { ChatSidebar } from "./chat-sidebar";
import { ConversationHeader, IconHash, IconLock } from "./conversation-header";
import type { ConversationHeaderInfo } from "./conversation-header";
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
  useAddReaction,
  useRemoveReaction,
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
import { usePushNotifications } from "@/features/chat/hooks/use-push-notifications";
import { useAllNotificationPrefs } from "@/features/chat/hooks/use-notification-prefs";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import { canPerformChannelAction } from "@/features/chat/utils/chat-permissions";
import { buildProfileMap } from "@/features/chat/utils/profile-utils";
import type { MentionOption } from "./mention-popup";
import { SPECIAL_MENTION_OPTIONS } from "./mention-popup";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatLayout() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.role) as RoleSlug | null;

  const selectedChannelId = useChatStore((s) => s.selectedChannelId);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);
  const toggleSearch = useChatStore((s) => s.toggleSearch);
  const isSearchOpen = useChatStore((s) => s.isSearchOpen);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);

  const [showConversation, setShowConversation] = useState(false);
  // #5 — Capture unread count snapshot when channel opens (before markAsRead clears it)
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);

  // Keyboard shortcut: Ctrl/Cmd+F → search, Escape → close
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

  // Data
  const { data: channels, isLoading: loadingChannels } = useChannelsWithMembers();
  const { data: sections } = useSections();
  const { data: archivedChannels } = useArchivedChannels();
  const { data: profiles } = useProfiles();
  const messagesQuery = useMessages(selectedChannelId);
  const { data: unreadData } = useUnreadCounts();

  useEffect(() => {
    if (unreadData) setUnreadCounts(unreadData);
  }, [unreadData, setUnreadCounts]);

  // Sync unread + presence
  const { sendTyping } = useTypingIndicator(selectedChannelId);
  useChatPresence();

  // Push notifications (#7) — channel names map (senderNames built after profileMap)
  const channelNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ch of channels ?? []) {
      if (ch.name) map[ch.id] = ch.name;
    }
    return map;
  }, [channels]);

  const { data: notifPrefsData } = useAllNotificationPrefs();

  // Mutations
  const sendMsg = useSendMessage();
  const editMsg = useEditMessage();
  const deleteMsg = useDeleteMessage();
  const togglePin = useTogglePin();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const markAsRead = useMarkAsRead();
  const archiveChannelMut = useArchiveChannel();
  const unarchiveChannelMut = useUnarchiveChannel();
  const deleteChannelMut = useDeleteChannelPermanently();
  const updateChannelMut = useUpdateChannel();
  const createSectionMut = useCreateSection();
  const updateSectionMut = useUpdateSection();
  const deleteSectionMut = useDeleteSection();

  // Auto mark-as-read
  useEffect(() => {
    if (!selectedChannelId || !userId) return;
    const timer = setTimeout(() => {
      markAsRead.mutate({ channelId: selectedChannelId, userId });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId, userId]);

  const messages = flattenMessages(messagesQuery.data);
  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);
  const canDeleteOthers = hasPermission(userRole, "chat.delete_messages");
  const canCreateChannel = hasPermission(userRole, "chat.create_channel");
  const canManageChannels = hasPermission(userRole, "chat.create_channel");

  const myMemberRole = useMemo(() => {
    if (!selectedChannel || !userId) return null;
    return selectedChannel.chat_channel_members?.find((m) => m.user_id === userId)?.role ?? null;
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

  const canPin = canPerformChannelAction("pin_message", {
    userRole,
    channelMemberRole: myMemberRole,
    channelSettings: null,
    isCreator: selectedChannel?.created_by === userId,
  });

  const profileMap = useMemo(() => buildProfileMap(profiles ?? []), [profiles]);

  // Push notifications: build sender names from profileMap
  const senderNames = useMemo(
    () => Object.fromEntries(Object.entries(profileMap).map(([id, p]) => [id, p.name])),
    [profileMap],
  );
  usePushNotifications({ channelNames, senderNames, notifPrefs: notifPrefsData ?? {} });

  const mentionOptions: MentionOption[] = useMemo(() => {
    if (!selectedChannel?.chat_channel_members || !userId) return [];
    const members = selectedChannel.chat_channel_members
      .filter((m) => m.user_id !== userId)
      .map((m) => {
        const p = profileMap[m.user_id];
        return { id: m.user_id, name: p?.name ?? "Usuário", avatarUrl: p?.avatarUrl };
      })
      .filter((o) => o.name !== "Usuário");
    // Prepend broadcast mentions for public channels (not DMs)
    const isPublic = selectedChannel.type === "channel" || selectedChannel.type === "private";
    return isPublic ? [...SPECIAL_MENTION_OPTIONS, ...members] : members;
  }, [selectedChannel, userId, profileMap]);

  const headerInfo = useMemo((): ConversationHeaderInfo | null => {
    if (!selectedChannel) return null;
    if (selectedChannel.type === "direct" && userId) {
      const other = selectedChannel.chat_channel_members?.find((m) => m.user_id !== userId);
      if (other) {
        const p = profileMap[other.user_id];
        return { name: p?.name ?? selectedChannel.name ?? "DM", avatarUrl: p?.avatarUrl, otherUserId: other.user_id, icon: null, description: selectedChannel.description };
      }
    }
    const IconMap: Record<string, typeof IconHash> = { channel: IconHash, private: IconLock, group: null as unknown as typeof IconHash };
    return { name: selectedChannel.name ?? "", icon: IconMap[selectedChannel.type ?? "channel"] ?? IconHash, description: selectedChannel.description };
  }, [selectedChannel, userId, profileMap]);

  // Handlers
  function handleSelectChannel(id: string) {
    const currentUnread = useChatStore.getState().unreadCounts[id] ?? 0;
    setInitialUnreadCount(currentUnread);
    setSelectedChannelId(id);
    setShowConversation(true);
  }
  function handleArchiveChannel(id: string) { archiveChannelMut.mutate(id); if (selectedChannelId === id) setSelectedChannelId(null); }
  function handleDeleteChannel(id: string) { deleteChannelMut.mutate(id); if (selectedChannelId === id) setSelectedChannelId(null); }
  function handleUnarchiveChannel(id: string) { unarchiveChannelMut.mutate(id); }
  function handleMoveToSection(channelId: string, sectionId: string | null) { updateChannelMut.mutate({ id: channelId, updates: { section_id: sectionId } }); }
  function handleCreateSection(name: string) { createSectionMut.mutate({ name }); }
  function handleRenameSection(id: string, name: string) { updateSectionMut.mutate({ id, updates: { name } }); }
  function handleDeleteSection(id: string) { deleteSectionMut.mutate(id); }
  function handleEdit(messageId: string, content: string) { editMsg.mutate({ messageId, content }); }
  function handleDelete(messageId: string) { deleteMsg.mutate({ messageId }); }
  function handleTogglePin(messageId: string, pinned: boolean) { togglePin.mutate({ messageId, pinned }); }

  function handleReact(messageId: string, emoji: string, remove: boolean) {
    if (!userId) return;
    if (remove) {
      removeReaction.mutate({ messageId, userId, emoji });
    } else {
      addReaction.mutate({ message_id: messageId, user_id: userId, emoji });
    }
  }

  const handleScrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("bg-primary/10"); setTimeout(() => el.classList.remove("bg-primary/10"), 2000); }
  }, []);

  async function handleSend(content: string, files?: File[]) {
    if (!selectedChannelId || !tenantId || !userId) return;
    const message = await sendMsg.mutateAsync({ channel_id: selectedChannelId, sender_id: userId, content, message_type: files?.length ? "file" : "text" });
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const mentionedIds = extractMentionIds(content);
    if (mentionedIds.length > 0) {
      const senderName = profileMap[userId]?.name ?? "Alguém";
      const channelName = selectedChannel?.name ?? "chat";
      notifyOnChatMention(supabase, { tenantId, senderId: userId, senderName, channelId: selectedChannelId, channelName, messageContent: content, mentionedUserIds: mentionedIds }).catch(() => {});
    }
    if (files?.length && message?.id) {
      const toastId = toast.loading(`Enviando ${files.length} arquivo${files.length > 1 ? "s" : ""}...`);
      let successCount = 0; let failCount = 0;
      for (const file of files) {
        try { const { url } = await uploadChatFile(supabase, tenantId, selectedChannelId, file); await createAttachmentRecord(supabase, message.id, file, url); successCount++; }
        catch { failCount++; }
      }
      if (failCount === 0) { toast.success(`${successCount} arquivo${successCount > 1 ? "s" : ""} enviado${successCount > 1 ? "s" : ""}`, { id: toastId }); }
      else { toast.error(`${failCount} arquivo${failCount > 1 ? "s" : ""} falhou. ${successCount} enviado${successCount > 1 ? "s" : ""}.`, { id: toastId }); }
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden">
      <ChatSidebar
        channels={channels}
        archivedChannels={archivedChannels ?? []}
        sections={sections ?? []}
        selectedChannelId={selectedChannelId}
        unreadCounts={unreadCounts}
        currentUserId={userId}
        profileMap={profileMap}
        isLoading={loadingChannels}
        canCreateChannel={canCreateChannel}
        canManageChannels={canManageChannels}
        showConversation={showConversation}
        onSelectChannel={handleSelectChannel}
        onArchiveChannel={handleArchiveChannel}
        onDeleteChannel={handleDeleteChannel}
        onUnarchiveChannel={handleUnarchiveChannel}
        onMoveToSection={handleMoveToSection}
        onCreateSection={handleCreateSection}
        onRenameSection={handleRenameSection}
        onDeleteSection={handleDeleteSection}
      />

      {/* Conversation area */}
      <div className={cn("relative flex flex-1 flex-col min-w-0", !showConversation && "hidden md:flex")}>
        <MessageSearch channels={channels ?? []} />
        {selectedChannel && headerInfo ? (
          <>
            <ConversationHeader headerInfo={headerInfo} onBack={() => setShowConversation(false)} />
            <PinnedBanner channelId={selectedChannelId} profileMap={profileMap} onClickMessage={handleScrollToMessage} />
            {messagesQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center"><Skeleton className="h-8 w-40" /></div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={userId}
                profileMap={profileMap}
                hasNextPage={!!messagesQuery.hasNextPage}
                isFetchingNextPage={messagesQuery.isFetchingNextPage}
                fetchNextPage={messagesQuery.fetchNextPage}
                channelId={selectedChannelId}
                onEditMessage={handleEdit}
                onDeleteMessage={handleDelete}
                onTogglePin={canPin ? handleTogglePin : undefined}
                onReact={handleReact}
                canDeleteOthers={canDeleteOthers}
                initialUnreadCount={initialUnreadCount}
              />
            )}
            <TypingIndicator channelId={selectedChannelId} />
            <MessageInput onSend={handleSend} disabled={sendMsg.isPending || !canSendMessage} onTyping={sendTyping} mentionOptions={mentionOptions} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
            <IconMessageCircle2 size={48} className="opacity-20" />
            <p className="text-sm">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>

      <CreateChannelDialog />
      <CreateDMDialog />
      {selectedChannel && <ChannelSettingsDrawer channel={selectedChannel} />}
    </div>
  );
}
