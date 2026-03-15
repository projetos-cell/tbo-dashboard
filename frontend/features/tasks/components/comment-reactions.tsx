"use client";

import { useState } from "react";
import { IconMoodSmile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCommentReactions,
  useToggleReaction,
} from "@/features/tasks/hooks/use-comment-reactions";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = [
  { emoji: "\u{1F44D}", label: "Legal" },
  { emoji: "\u{2764}\u{FE0F}", label: "Amei" },
  { emoji: "\u{1F389}", label: "Parabens" },
  { emoji: "\u{1F440}", label: "Visto" },
  { emoji: "\u{1F4AF}", label: "100%" },
  { emoji: "\u{1F680}", label: "Foguete" },
  { emoji: "\u{1F525}", label: "Fogo" },
  { emoji: "\u{1F914}", label: "Pensando" },
];

interface CommentReactionsProps {
  commentId: string;
}

export function CommentReactions({ commentId }: CommentReactionsProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: reactions = [] } = useCommentReactions(commentId);
  const toggle = useToggleReaction();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleReact = (emoji: string) => {
    toggle.mutate({ commentId, emoji });
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Existing reactions */}
      {reactions.map((group) => {
        const isMine = userId ? group.user_ids.includes(userId) : false;
        return (
          <Tooltip key={group.emoji}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleReact(group.emoji)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors",
                  isMine
                    ? "border-primary/40 bg-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-accent/50",
                )}
              >
                <span>{group.emoji}</span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {group.count}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isMine ? "Remover reacao" : "Reagir com"} {group.emoji}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Add reaction button */}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent/50"
          >
            <IconMoodSmile className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start" side="top">
          <div className="grid grid-cols-4 gap-1">
            {QUICK_EMOJIS.map(({ emoji, label }) => (
              <Tooltip key={emoji}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleReact(emoji)}
                    className="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
                  >
                    {emoji}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
