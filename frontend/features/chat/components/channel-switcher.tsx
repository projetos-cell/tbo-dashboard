"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  IconHash,
  IconLock,
  IconUser,
  IconSearch,
  IconKeyboard,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";

interface ChannelItem {
  id: string;
  name: string | null;
  type?: string | null;
  unreadCount?: number;
}

interface ChannelSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: ChannelItem[];
  selectedChannelId?: string | null;
  currentUserId?: string;
  profileMap?: Record<string, ProfileInfo>;
  onSelectChannel: (id: string) => void;
}

function getChannelIcon(type: string | null | undefined) {
  if (type === "private") return IconLock;
  if (type === "direct") return IconUser;
  return IconHash;
}

export function ChannelSwitcher({
  open,
  onOpenChange,
  channels,
  selectedChannelId,
  currentUserId,
  profileMap = {},
  onSelectChannel,
}: ChannelSwitcherProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return channels.filter((ch) => {
      const name = ch.type === "direct" && currentUserId
        ? (profileMap[ch.id]?.name ?? ch.name ?? "")
        : (ch.name ?? "");
      return !q || name.toLowerCase().includes(q);
    });
  }, [channels, query, currentUserId, profileMap]);

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleSelect(id: string) {
    onSelectChannel(id);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ch = filtered[activeIndex];
      if (ch) handleSelect(ch.id);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }

  function getDisplayName(ch: ChannelItem): string {
    if (ch.type === "direct" && currentUserId) {
      return profileMap[ch.id]?.name ?? ch.name ?? "DM";
    }
    return ch.name ?? ch.id.slice(0, 8);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <IconKeyboard size={14} />
            Trocar de canal
            <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 border-b">
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar canal ou pessoa..."
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="max-h-72">
          <div className="p-2">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">
                Nenhum canal encontrado.
              </p>
            ) : (
              filtered.map((ch, idx) => {
                const Icon = getChannelIcon(ch.type);
                const name = getDisplayName(ch);
                const isActive = ch.id === selectedChannelId;
                const isHighlighted = idx === activeIndex;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelect(ch.id)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                      isActive && "font-medium",
                    )}
                  >
                    <Icon size={14} className="shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{name}</span>
                    {(ch.unreadCount ?? 0) > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {ch.unreadCount}
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] text-muted-foreground">atual</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono bg-muted px-1 rounded">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> selecionar</span>
          <span><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
