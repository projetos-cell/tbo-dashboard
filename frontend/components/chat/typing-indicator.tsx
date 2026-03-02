"use client";

import { useChatStore } from "@/stores/chat-store";

interface TypingIndicatorProps {
  channelId: string | null;
}

export function TypingIndicator({ channelId }: TypingIndicatorProps) {
  const typingUsers = useChatStore(
    (s) => (channelId ? s.typingUsers[channelId] : undefined) ?? [],
  );

  if (typingUsers.length === 0) return null;

  const names =
    typingUsers.length === 1
      ? typingUsers[0].name
      : typingUsers.length === 2
        ? `${typingUsers[0].name} e ${typingUsers[1].name}`
        : `${typingUsers[0].name} e mais ${typingUsers.length - 1}`;

  const verb = typingUsers.length === 1 ? "está" : "estão";

  return (
    <div className="flex items-center gap-1.5 px-4 py-1 text-xs text-muted-foreground">
      <span className="inline-flex gap-0.5">
        <span className="animate-bounce [animation-delay:0ms] h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="animate-bounce [animation-delay:150ms] h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="animate-bounce [animation-delay:300ms] h-1 w-1 rounded-full bg-muted-foreground" />
      </span>
      <span>
        {names} {verb} digitando...
      </span>
    </div>
  );
}
