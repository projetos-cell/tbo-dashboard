"use client";

import { useRef, useEffect, useLayoutEffect, useMemo, useState, useCallback } from "react";
import { IconLoader2, IconArrowDown } from "@tabler/icons-react";
import { MessageBubble } from "./message-bubble";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import {
  useMessageAttachments,
  buildAttachmentMap,
  useReactionsForMessages,
  buildReactionMap,
  useThreadReplyCount,
} from "@/features/chat/hooks/use-chat";

interface MessageListProps {
  messages: MessageRow[];
  currentUserId: string | undefined;
  profileMap: Record<string, ProfileInfo>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  channelId?: string | null;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onTogglePin?: (messageId: string, pinned: boolean) => void;
  onReact?: (messageId: string, emoji: string, remove: boolean) => void;
  onOpenThread?: (message: MessageRow) => void;
  onForwardMessage?: (message: MessageRow) => void;
  canDeleteOthers?: boolean;
  /** Number of unread messages when this channel was first opened */
  initialUnreadCount?: number;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDateKey(msg: MessageRow): string {
  return new Date(msg.created_at ?? "").toDateString();
}

export function MessageList({
  messages,
  currentUserId,
  profileMap,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  channelId,
  onEditMessage,
  onDeleteMessage,
  onTogglePin,
  onReact,
  onOpenThread,
  onForwardMessage,
  canDeleteOthers,
  initialUnreadCount = 0,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialRef = useRef(true);

  // #4 — Scroll to bottom FAB state
  const [showFab, setShowFab] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const prevMessagesLengthRef = useRef(messages.length);

  // #5 — Unread separator: index of first unread message
  const unreadSeparatorIndex = useMemo(() => {
    if (initialUnreadCount <= 0 || messages.length === 0) return -1;
    return Math.max(0, messages.length - initialUnreadCount);
  }, [messages.length, initialUnreadCount]);

  // Fetch attachments for all visible messages (only file/image types)
  const fileMessageIds = useMemo(
    () => messages.filter((m) => m.message_type === "file").map((m) => m.id),
    [messages],
  );
  const { data: attachmentsData } = useMessageAttachments(fileMessageIds);
  const attachmentMap = useMemo(
    () => buildAttachmentMap(attachmentsData),
    [attachmentsData],
  );

  // Fetch reactions for all visible messages
  const allMessageIds = useMemo(() => messages.map((m) => m.id), [messages]);
  const { data: reactionsData } = useReactionsForMessages(allMessageIds, channelId ?? null);
  const reactionMap = useMemo(
    () => buildReactionMap(reactionsData, currentUserId),
    [reactionsData, currentUserId],
  );

  // Fetch thread reply counts for all visible messages
  const { data: threadCountMap = {} } = useThreadReplyCount(allMessageIds);

  // #4 — Track scroll position to show/hide FAB
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom > 200) {
      setShowFab(true);
    } else {
      setShowFab(false);
      setNewMsgCount(0);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // #4 — Count new messages that arrive while scrolled up
  useEffect(() => {
    if (isInitialRef.current) return;
    const added = messages.length - prevMessagesLengthRef.current;
    if (added > 0 && showFab) {
      setNewMsgCount((c) => c + added);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, showFab]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowFab(false);
    setNewMsgCount(0);
  }, []);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (isInitialRef.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      isInitialRef.current = false;
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  // Auto-scroll when a new message arrives and user is near bottom
  useEffect(() => {
    if (isInitialRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Preserve scroll position after loading older messages
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0 && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop =
        container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  });

  // IntersectionObserver to load older messages on scroll to top
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          prevScrollHeightRef.current = container.scrollHeight;
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset initial flag when channel changes
  useEffect(() => {
    if (messages.length === 0) {
      isInitialRef.current = true;
      setShowFab(false);
      setNewMsgCount(0);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Nenhuma mensagem ainda. Comece a conversa!
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <div
        ref={containerRef}
        className="flex flex-1 flex-col overflow-y-auto py-3"
      >
        {/* Top sentinel for infinite scroll */}
        <div ref={topSentinelRef} className="shrink-0 h-1" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === currentUserId;
          const prevMsg = idx > 0 ? messages[idx - 1] : null;

          // Date separator
          const showDateSeparator =
            !prevMsg || getDateKey(msg) !== getDateKey(prevMsg);

          // #5 — Unread separator: show before the first unread message
          const showUnreadSeparator =
            unreadSeparatorIndex > 0 && idx === unreadSeparatorIndex;

          // Message grouping: show avatar if first message or different sender or different day
          const showAvatar =
            !prevMsg ||
            prevMsg.sender_id !== msg.sender_id ||
            showDateSeparator ||
            showUnreadSeparator;

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center gap-3 py-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                    {formatDateSeparator(msg.created_at ?? "")}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* #5 — Unread separator */}
              {showUnreadSeparator && (
                <div className="flex items-center gap-3 py-2 my-1">
                  <div className="h-px flex-1 bg-primary/40" />
                  <span className="text-[11px] font-semibold text-primary shrink-0 px-2 py-0.5 rounded-full bg-primary/10">
                    {initialUnreadCount} nova{initialUnreadCount !== 1 ? "s" : ""} mensagem{initialUnreadCount !== 1 ? "s" : ""}
                  </span>
                  <div className="h-px flex-1 bg-primary/40" />
                </div>
              )}

              <div className={showAvatar ? "mt-3" : "mt-0.5"}>
                <MessageBubble
                  message={msg}
                  isOwn={isOwn}
                  senderProfile={
                    msg.sender_id ? profileMap[msg.sender_id] : undefined
                  }
                  showAvatar={showAvatar}
                  canDelete={canDeleteOthers}
                  attachments={attachmentMap[msg.id]}
                  profileMap={profileMap}
                  reactions={reactionMap[msg.id]}
                  threadCount={threadCountMap[msg.id] ?? 0}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onTogglePin={onTogglePin}
                  onReact={onReact}
                  onOpenThread={onOpenThread}
                  onForward={onForwardMessage}
                />
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* #4 — Scroll to bottom FAB */}
      {showFab && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
          aria-label="Ir para o final"
        >
          {newMsgCount > 0 && (
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold">
              +{newMsgCount}
            </span>
          )}
          <IconArrowDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
