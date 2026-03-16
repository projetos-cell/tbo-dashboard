"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { IconUsers, IconUserCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";

export interface MentionOption {
  id: string;
  name: string;
  avatarUrl?: string;
  /** true for @channel / @here broadcast mentions */
  isSpecial?: boolean;
  description?: string;
}

/** Broadcast mention options — always shown at top of mention popup */
export const SPECIAL_MENTION_OPTIONS: MentionOption[] = [
  { id: "channel", name: "channel", isSpecial: true, description: "Notifica todos os membros do canal" },
  { id: "here", name: "here", isSpecial: true, description: "Notifica membros online agora" },
];

interface MentionPopupProps {
  options: MentionOption[];
  query: string;
  onSelect: (option: MentionOption) => void;
  onClose: () => void;
  /** Anchor position relative to parent (bottom-left of the @ cursor) */
  position?: { top: number; left: number };
  /** Externally controlled active index (from parent keyboard handling) */
  externalActiveIndex?: number;
  /** Callback when active index changes (mouse hover) */
  onChangeActive?: (index: number) => void;
}

export function MentionPopup({
  options,
  query,
  onSelect,
  onClose,
  position,
  externalActiveIndex,
  onChangeActive,
}: MentionPopupProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const activeIndex = externalActiveIndex ?? internalActiveIndex;
  const setActiveIndex = onChangeActive ?? setInternalActiveIndex;
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, setActiveIndex]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((activeIndex + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((activeIndex - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (filtered[activeIndex]) {
        onSelect(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className="absolute z-50 w-64 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-md"
      style={position ? { bottom: position.top, left: position.left } : { bottom: "100%", left: 0 }}
      ref={listRef}
      onKeyDown={handleKeyDown}
    >
      {filtered.map((option, idx) => (
        <button
          key={option.id}
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
            idx === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted",
          )}
          onClick={() => onSelect(option)}
          onMouseEnter={() => setActiveIndex(idx)}
        >
          {option.isSpecial ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {option.id === "channel" ? <IconUsers size={13} /> : <IconUserCheck size={13} />}
            </span>
          ) : (
            <Avatar size="sm">
              {option.avatarUrl && (
                <AvatarImage src={option.avatarUrl} alt={option.name} />
              )}
              <AvatarFallback>{getInitials(option.name)}</AvatarFallback>
            </Avatar>
          )}
          <span className="flex-1 min-w-0">
            <span className="block truncate font-medium">@{option.name}</span>
            {option.description && (
              <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Mention parser utilities ──────────────────────────────────────────

const MENTION_REGEX = /<@(channel|here|[a-f0-9-]+)>/g;

/**
 * Parse message content and split into text and mention segments.
 */
export function parseMentions(
  content: string,
  profileMap: Record<string, ProfileInfo>,
): Array<{ type: "text"; value: string } | { type: "mention"; userId: string; name: string; isSpecial?: boolean }> {
  const segments: Array<
    { type: "text"; value: string } | { type: "mention"; userId: string; name: string; isSpecial?: boolean }
  > = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex
  MENTION_REGEX.lastIndex = 0;

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    // Text before this mention
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    const userId = match[1];
    const isSpecial = userId === "channel" || userId === "here";
    const profile = profileMap[userId];
    segments.push({
      type: "mention",
      userId,
      name: isSpecial ? userId : (profile?.name ?? "Usuário"),
      isSpecial,
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last mention
  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
}
