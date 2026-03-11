"use client";

import { IconPin, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { usePinnedMessages } from "@/features/chat/hooks/use-chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";

interface PinnedBannerProps {
  channelId: string | null;
  profileMap: Record<string, ProfileInfo>;
  onClickMessage: (messageId: string) => void;
}

export function PinnedBanner({
  channelId,
  profileMap,
  onClickMessage,
}: PinnedBannerProps) {
  const { data: pinned } = usePinnedMessages(channelId);

  // Show only the most recent pinned message
  const latest = pinned?.[0];
  if (!latest) return null;

  const senderName = profileMap[latest.sender_id ?? ""]?.name ?? "Alguém";
  const preview =
    (latest.content?.length ?? 0) > 80
      ? latest.content!.slice(0, 80) + "..."
      : (latest.content ?? "");

  return (
    <button
      type="button"
      onClick={() => onClickMessage(latest.id)}
      className="flex items-center gap-2 border-b bg-muted/40 px-4 py-1.5 text-left hover:bg-muted/60 transition-colors w-full"
    >
      <IconPin size={14} className="text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-primary mr-1.5">
          {senderName}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {preview.replace(/<@[a-f0-9-]+>/g, "@menção")}
        </span>
      </div>
    </button>
  );
}
