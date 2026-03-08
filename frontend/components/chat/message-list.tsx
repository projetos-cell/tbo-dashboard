"use client";

import { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import type { MessageRow } from "@/services/chat";

interface MessageListProps {
  messages: MessageRow[];
  currentUserId: string | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  canDeleteOthers?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onEditMessage,
  onDeleteMessage,
  canDeleteOthers,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialRef = useRef(true);

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
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Preserve scroll position after loading older messages
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0 && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
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

  // Reset initial flag when channel changes (messages go empty then refill)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialRef.current = true;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 text-sm">
        Nenhuma mensagem ainda. Comece a conversa!
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
    >
      {/* Top sentinel for infinite scroll */}
      <div ref={topSentinelRef} className="shrink-0 h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.sender_id === currentUserId}
          canDelete={canDeleteOthers}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
