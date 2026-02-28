"use client";

import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.created_at ?? "").toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex flex-col max-w-[70%] gap-0.5",
        isOwn ? "items-end self-end" : "items-start self-start",
      )}
    >
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <span className="text-[10px] text-muted-foreground px-1">{time}</span>
    </div>
  );
}
