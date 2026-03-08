"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Green/gray dot showing whether a user is online.
 * Reads presence state from chatStore.
 */
export function OnlineIndicator({
  userId,
  className,
  size = "sm",
}: OnlineIndicatorProps) {
  const online = useChatStore((s) => s.isOnline(userId));

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
        online ? "bg-emerald-500" : "bg-gray-100-foreground/40",
        className,
      )}
      title={online ? "Online" : "Offline"}
    />
  );
}
