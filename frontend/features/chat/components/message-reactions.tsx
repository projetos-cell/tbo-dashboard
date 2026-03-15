"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactionGroup } from "@/features/chat/hooks/use-chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";

interface MessageReactionsProps {
  reactions: ReactionGroup[];
  profileMap: Record<string, ProfileInfo>;
  /** remove=true means current user already reacted and wants to remove */
  onToggle: (emoji: string, remove: boolean) => void;
}

export function MessageReactions({
  reactions,
  profileMap,
  onToggle,
}: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-wrap gap-1 mt-1">
        {reactions.map((group) => (
          <Tooltip key={group.emoji}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onToggle(group.emoji, group.hasCurrentUser)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                  group.hasCurrentUser
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                <span>{group.emoji}</span>
                <span className="font-medium">{group.count}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {group.userIds
                .map((uid) => profileMap[uid]?.name ?? "Usuário")
                .join(", ")}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
