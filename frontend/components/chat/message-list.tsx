"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./message-bubble";
import type { Database } from "@/lib/supabase/types";

type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

interface MessageListProps {
  messages: MessageRow[];
  currentUserId: string | undefined;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Nenhuma mensagem ainda. Comece a conversa!
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.sender_id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
