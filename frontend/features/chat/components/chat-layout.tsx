"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ThreadPanel } from "./thread-panel";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { ScheduledMessagesPanel } from "./scheduled-messages-panel";
import { BookmarksPanel } from "./bookmarks-panel";
import { MediaGalleryPanel } from "./media-gallery-panel";
import { ChannelSwitcher } from "./channel-switcher";
import { BrowseChannelsDialog } from "./browse-channels-dialog";
import { CreateTaskFromMessageDialog } from "./create-task-from-message-dialog";
import { ChannelSummaryPanel } from "./channel-summary-panel";
import type { ConversationHeaderInfo } from "./conversation-header";
import type { MessageRow } from "@/features/chat/services/chat";

import { useChatData } from "@/features/chat/hooks/use-chat-data";
import { useChatHandlers } from "@/features/chat/hooks/use-chat-handlers";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Keyboard shortcuts hook ─────────────────────────────────────────

function useChatKeyboardShortcuts({
  isSearchOpen,
  toggleSearch,
  setSearchQuery,
  channelSwitcherOpen,
  setChannelSwitcherOpen,
  threadMessage,
  setThreadMessage,
  bookmarksPanelOpen,
  setBookmarksPanelOpen,
  mediaGalleryOpen,
  setMediaGalleryOpen,
  summaryPanelOpen,
  setSummaryPanelOpen,
  scheduledPanelOpen,
  setScheduledPanelOpen,
}: {
  isSearchOpen: boolean;
  toggleSearch: () => void;
  setSearchQuery: (q: string) => void;
  channelSwitcherOpen: boolean;
  setChannelSwitcherOpen: (v: boolean) => void;
  threadMessage: MessageRow | null;
  setThreadMessage: (v: MessageRow | null) => void;
  bookmarksPanelOpen: boolean;
  setBookmarksPanelOpen: (v: boolean) => void;
  mediaGalleryOpen: boolean;
  setMediaGalleryOpen: (v: boolean) => void;
  summaryPanelOpen: boolean;
  setSummaryPanelOpen: (v: boolean) => void;
  scheduledPanelOpen: boolean;
  setScheduledPanelOpen: (v: boolean) => void;
}) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setChannelSwitcherOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (!isSearchOpen) toggleSearch();
        return;
      }
      if (e.key === "Escape") {
        if (isSearchOpen) { toggleSearch(); setSearchQuery(""); return; }
        if (channelSwitcherOpen) { setChannelSwitcherOpen(false); return; }
        if (threadMessage) { setThreadMessage(null); return; }
        if (bookmarksPanelOpen) { setBookmarksPanelOpen(false); return; }
        if (mediaGalleryOpen) { setMediaGalleryOpen(false); return; }
        if (summaryPanelOpen) { setSummaryPanelOpen(false); return; }
        if (scheduledPanelOpen) { setScheduledPanelOpen(false); return; }
      }
    },
    [
      isSearchOpen, toggleSearch, setSearchQuery, channelSwitcherOpen,
      setChannelSwitcherOpen, threadMessage, setThreadMessage, bookmarksPanelOpen,
      setBookmarksPanelOpen, mediaGalleryOpen, setMediaGalleryOpen,
      summaryPanelOpen, setSummaryPanelOpen, scheduledPanelOpen, setScheduledPanelOpen,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}

// ── Sidebar resize hook ─────────────────────────────────────────────

function useSidebarResize() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-sidebar-width");
      return saved ? parseInt(saved, 10) : 320;
    }
    return 320;
  });
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      function onMove(ev: MouseEvent) {
        if (!isDraggingRef.current) return;
        const next = Math.max(200, Math.min(480, startWidth + ev.clientX - startX));
        setSidebarWidth(next);
      }
      function onUp() {
        isDraggingRef.current = false;
        setSidebarWidth((w) => {
          localStorage.setItem("chat-sidebar-width", String(w));
          return w;
        });
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [sidebarWidth],
  );

  return { sidebarWidth, handleMouseDown };
}

// ── Main ChatLayout ─────────────────────────────────────────────────

export function ChatLayout() {
  const data = useChatData();
  const {
    tenantId, userId, channels, sections, archivedChannels, loadingChannels,
    messagesQuery, messages, selectedChannel, selectedChannelId,
    setSelectedChannelId, profileMap, unreadCounts, scheduledMessages,
    loadingScheduled, canDeleteOthers, canCreateChannel, canManageChannels,
    canSendMessage, canPin, soundEnabled, handleToggleSound, mentionOptions,
    lastOwnMessage, mutedChannelIds, handleMuteToggle, favoriteIds, toggleFavorite,
    bookmarkedMessageIds, handleBookmark, sendTyping, channelSettings,
  } = data;

  const handlers = useChatHandlers({
    tenantId,
    userId,
    selectedChannelId,
    selectedChannel: selectedChannel as never,
    profileMap,
    channels: channels as never,
  });

  const toggleSearch = useChatStore((s) => s.toggleSearch);
  const isSearchOpen = useChatStore((s) => s.isSearchOpen);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);
  const setChannelSettingsOpen = useChatStore((s) => s.setChannelSettingsOpen);

  // Panel state
  const [showConversation, setShowConversation] = useState(false);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);
  const [threadMessage, setThreadMessage] = useState<MessageRow | null>(null);
  const [forwardMessage, setForwardMessage] = useState<MessageRow | null>(null);
  const [taskSourceMessage, setTaskSourceMessage] = useState<MessageRow | null>(null);
  const [summaryPanelOpen, setSummaryPanelOpen] = useState(false);
  const [scheduledPanelOpen, setScheduledPanelOpen] = useState(false);
  const [bookmarksPanelOpen, setBookmarksPanelOpen] = useState(false);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [channelSwitcherOpen, setChannelSwitcherOpen] = useState(false);

  const { sidebarWidth, handleMouseDown: handleSidebarMouseDown } = useSidebarResize();

  useChatKeyboardShortcuts({
    isSearchOpen, toggleSearch, setSearchQuery, channelSwitcherOpen,
    setChannelSwitcherOpen, threadMessage, setThreadMessage, bookmarksPanelOpen,
    setBookmarksPanelOpen, mediaGalleryOpen, setMediaGalleryOpen,
    summaryPanelOpen, setSummaryPanelOpen, scheduledPanelOpen, setScheduledPanelOpen,
  });

  // Auto mark-as-read on channel change
  useEffect(() => {
    if (!selectedChannelId || !userId) return;
    const timer = setTimeout(() => {
      handlers.markAsRead.mutate({ channelId: selectedChannelId, userId });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId, userId]);

  // Re-mark-as-read when new messages arrive
  const latestPageLen = messagesQuery.data?.pages?.[0]?.length ?? 0;
  useEffect(() => {
    if (!selectedChannelId || !userId || latestPageLen === 0) return;
    const timer = setTimeout(() => {
      handlers.markAsRead.mutate({ channelId: selectedChannelId, userId });
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestPageLen]);

  function handleSelectChannel(id: string) {
    const currentUnread = useChatStore.getState().unreadCounts[id] ?? 0;
    setInitialUnreadCount(currentUnread);
    setSelectedChannelId(id);
    setShowConversation(true);
  }

  const headerInfo = useMemo((): ConversationHeaderInfo | null => {
    if (!selectedChannel) return null;
    const settings = channelSettings;
    if (selectedChannel.type === "direct" && userId) {
      const other = selectedChannel.chat_channel_members?.find((m) => m.user_id !== userId);
      if (other) {
        const p = profileMap[other.user_id];
        return { name: p?.name ?? selectedChannel.name ?? "DM", avatarUrl: p?.avatarUrl, otherUserId: other.user_id, icon: null, description: selectedChannel.description };
      }
    }
    const IconMap: Record<string, typeof IconHash> = { channel: IconHash, private: IconLock, group: null as unknown as typeof IconHash };
    return {
      name: selectedChannel.name ?? "",
      icon: IconMap[selectedChannel.type ?? "channel"] ?? IconHash,
      description: selectedChannel.description,
      isReadOnly: settings?.is_read_only ?? false,
      whoCanPost: settings?.who_can_post ?? "everyone",
    };
  }, [selectedChannel, userId, profileMap, channelSettings]);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden">
      {/* Resizable sidebar */}
      <div style={{ width: sidebarWidth, flexShrink: 0 }} className={cn(showConversation ? "hidden md:block" : "block")}>
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
          onArchiveChannel={handlers.handleArchiveChannel}
          onDeleteChannel={handlers.handleDeleteChannel}
          onUnarchiveChannel={handlers.handleUnarchiveChannel}
          onMoveToSection={handlers.handleMoveToSection}
          onCreateSection={handlers.handleCreateSection}
          onRenameSection={handlers.handleRenameSection}
          onDeleteSection={handlers.handleDeleteSection}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          mutedChannelIds={mutedChannelIds}
          onMuteToggle={handleMuteToggle}
          onMarkAsRead={handlers.handleMarkAsRead}
          onOpenSettings={(channelId) => {
            handleSelectChannel(channelId);
            setTimeout(() => setChannelSettingsOpen(true), 100);
          }}
        />
      </div>
      {/* Drag handle */}
      <div
        onMouseDown={handleSidebarMouseDown}
        className={cn(
          "w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors shrink-0 hidden md:block",
          showConversation ? "hidden" : "",
        )}
        title="Arrastar para redimensionar"
      />

      {/* Conversation area + panels */}
      <div className={cn("relative flex flex-1 min-w-0 overflow-hidden", !showConversation && "hidden md:flex")}>
        <MessageSearch channels={channels ?? []} currentChannelId={selectedChannelId} />

        <div className="flex flex-1 flex-col min-w-0">
          {selectedChannel && headerInfo ? (
            <>
              <ConversationHeader
                headerInfo={headerInfo}
                channelId={selectedChannelId}
                profileMap={profileMap}
                onBack={() => setShowConversation(false)}
                onOpenBookmarks={() => setBookmarksPanelOpen(true)}
                onJumpToMessage={handlers.handleScrollToMessage}
                canEditTopic={canManageChannels || selectedChannel?.created_by === userId}
                onUpdateTopic={handlers.handleUpdateTopic}
                onOpenMediaGallery={() => setMediaGalleryOpen((v) => !v)}
                onOpenSummary={() => setSummaryPanelOpen((v) => !v)}
              />
              <PinnedBanner channelId={selectedChannelId} profileMap={profileMap} onClickMessage={handlers.handleScrollToMessage} />
              {messagesQuery.isLoading ? (
                <MessageListSkeleton />
              ) : (
                <MessageList
                  messages={messages}
                  currentUserId={userId}
                  profileMap={profileMap}
                  hasNextPage={!!messagesQuery.hasNextPage}
                  isFetchingNextPage={messagesQuery.isFetchingNextPage}
                  fetchNextPage={messagesQuery.fetchNextPage}
                  channelId={selectedChannelId}
                  onEditMessage={handlers.handleEdit}
                  onDeleteMessage={handlers.handleDelete}
                  onTogglePin={canPin ? handlers.handleTogglePin : undefined}
                  onReact={handlers.handleReact}
                  onOpenThread={setThreadMessage}
                  onForwardMessage={setForwardMessage}
                  onBookmark={handleBookmark}
                  bookmarkedMessageIds={bookmarkedMessageIds}
                  canDeleteOthers={canDeleteOthers}
                  onCreateTask={setTaskSourceMessage}
                  initialUnreadCount={initialUnreadCount}
                  onMentionClick={handlers.handleMentionClick}
                />
              )}
              <TypingIndicator channelId={selectedChannelId} />
              <MessageInput
                onSend={handlers.handleSend}
                disabled={handlers.sendMsg.isPending || !canSendMessage}
                onTyping={sendTyping}
                mentionOptions={mentionOptions}
                scheduledCount={scheduledMessages?.length ?? 0}
                onShowScheduled={() => setScheduledPanelOpen(true)}
                lastOwnMessage={lastOwnMessage ?? undefined}
                onEditLastMessage={(id, content) => handlers.handleEdit(id, content)}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
              <IconMessageCircle2 size={48} className="opacity-20" />
              <p className="text-sm">Selecione uma conversa para começar</p>
            </div>
          )}
        </div>

        {threadMessage && selectedChannelId && (
          <ThreadPanel
            parentMessage={threadMessage}
            channelId={selectedChannelId}
            profileMap={profileMap}
            currentUserId={userId}
            onClose={() => setThreadMessage(null)}
          />
        )}

        {summaryPanelOpen && selectedChannelId && (
          <ChannelSummaryPanel
            channelId={selectedChannelId}
            channelName={selectedChannel?.name ?? undefined}
            onClose={() => setSummaryPanelOpen(false)}
          />
        )}

        {mediaGalleryOpen && selectedChannelId && (
          <MediaGalleryPanel
            channelId={selectedChannelId}
            channelName={selectedChannel?.name ?? undefined}
            onClose={() => setMediaGalleryOpen(false)}
          />
        )}
      </div>

      <CreateChannelDialog />
      <CreateDMDialog />
      {selectedChannel && (
        <ChannelSettingsDrawer
          channel={selectedChannel as never}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      <ScheduledMessagesPanel
        open={scheduledPanelOpen}
        onOpenChange={setScheduledPanelOpen}
        messages={scheduledMessages ?? []}
        isLoading={loadingScheduled}
        onCancel={(messageId) => {
          if (selectedChannelId) {
            handlers.cancelScheduledMsg.mutate({ messageId, channelId: selectedChannelId });
          }
        }}
      />

      <BookmarksPanel
        open={bookmarksPanelOpen}
        onOpenChange={setBookmarksPanelOpen}
        profileMap={profileMap}
        onJumpToMessage={handlers.handleScrollToMessage}
      />

      <CreateTaskFromMessageDialog
        message={taskSourceMessage}
        open={!!taskSourceMessage}
        onOpenChange={(open) => { if (!open) setTaskSourceMessage(null); }}
      />

      <ForwardMessageDialog
        message={forwardMessage}
        senderName={forwardMessage?.sender_id ? (profileMap[forwardMessage.sender_id]?.name ?? "Usuário") : "Usuário"}
        open={!!forwardMessage}
        onOpenChange={(open) => { if (!open) setForwardMessage(null); }}
        currentUserId={userId}
        profileMap={profileMap}
      />

      <BrowseChannelsDialog onSelectChannel={handleSelectChannel} />

      <ChannelSwitcher
        open={channelSwitcherOpen}
        onOpenChange={setChannelSwitcherOpen}
        channels={(channels ?? []).map((ch) => ({
          id: ch.id,
          name: ch.name,
          type: ch.type,
          unreadCount: unreadCounts[ch.id] ?? 0,
        }))}
        selectedChannelId={selectedChannelId}
        currentUserId={userId}
        profileMap={profileMap}
        onSelectChannel={handleSelectChannel}
      />
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────

const SKELETON_ROWS = [
  { avatar: true, lines: [{ w: "w-24" }, { w: "w-64" }, { w: "w-48" }] },
  { avatar: false, lines: [{ w: "w-80" }] },
  { avatar: false, lines: [{ w: "w-56" }, { w: "w-72" }] },
  { avatar: true, lines: [{ w: "w-20" }, { w: "w-96" }, { w: "w-44" }, { w: "w-60" }] },
  { avatar: false, lines: [{ w: "w-64" }] },
  { avatar: true, lines: [{ w: "w-28" }, { w: "w-52" }] },
  { avatar: false, lines: [{ w: "w-80" }, { w: "w-40" }] },
];

function MessageListSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden py-3 px-4 gap-2">
      {SKELETON_ROWS.map((row, i) => (
        <div
          key={i}
          className={cn("flex items-start gap-3", row.avatar ? "mt-3" : "mt-0.5 pl-11")}
        >
          {row.avatar && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <div className="flex flex-col gap-1.5 flex-1">
            {row.avatar && <Skeleton className="h-3 w-24" />}
            {row.lines.map((line, j) => (
              <Skeleton key={j} className={cn("h-4", line.w)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
