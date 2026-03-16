"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useUserPresenceLabel } from "@/features/chat/hooks/use-last-seen";

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Show tooltip with last seen info (#37) */
  showTooltip?: boolean;
}

/**
 * Green dot (online) / gray dot (offline).
 * Tooltip shows "Online" or "Visto há X min" via last_seen_at (#37).
 */
export function OnlineIndicator({
  userId,
  className,
  size = "sm",
  showTooltip = true,
}: OnlineIndicatorProps) {
  const online = useChatStore((s) => s.isOnline(userId));
  const label = useUserPresenceLabel(userId);

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
        online ? "bg-emerald-500" : "bg-muted-foreground/40",
        className,
      )}
      title={showTooltip ? label : undefined}
      aria-label={label}
    />
  );
}

interface LastSeenLabelProps {
  userId: string;
  className?: string;
}

/** Texto inline: "Online" ou "Visto há 5 min" (#37) */
export function LastSeenLabel({ userId, className }: LastSeenLabelProps) {
  const label = useUserPresenceLabel(userId);
  const online = useChatStore((s) => s.isOnline(userId));

  return (
    <span
      className={cn(
        "text-xs",
        online ? "text-emerald-600" : "text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
