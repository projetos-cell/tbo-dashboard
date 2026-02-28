"use client";

import { Hash, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type ChannelRow = Database["public"]["Tables"]["chat_channels"]["Row"];

interface ChannelListProps {
  channels: ChannelRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const typeIcons: Record<string, typeof Hash> = {
  channel: Hash,
  direct: Users,
  group: Lock,
};

export function ChannelList({
  channels,
  selectedId,
  onSelect,
}: ChannelListProps) {
  return (
    <div className="space-y-0.5">
      {channels.map((ch) => {
        const Icon = typeIcons[ch.type] ?? Hash;
        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelect(ch.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              selectedId === ch.id
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ch.name}</span>
          </button>
        );
      })}
    </div>
  );
}
