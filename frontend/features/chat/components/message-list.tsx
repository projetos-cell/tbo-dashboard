"use client";

import { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { MessageBubble } from "./message-bubble";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import {
  useMessageAttachments,
  buildAttachmentMap,
  useReactionsForMessages,
  buildReactionMap,
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
  canDeleteOthers?: boolean;
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
  canDeleteOthers,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialRef = useRef(true);

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

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (isInitialRef.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      isInitialRef.current = false;
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

        // Message grouping: show avatar if first message or different sender or different day
        const showAvatar =
          !prevMsg ||
          prevMsg.sender_id !== msg.sender_id ||
          showDateSeparator;

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
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onTogglePin={onTogglePin}
                onReact={onReact}
              />
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
