"use client";

import { Hash, Lock, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnlineIndicator } from "./online-indicator";
import type { Database } from "@/lib/supabase/types";

type ChannelRow = Database["public"]["Tables"]["chat_channels"]["Row"];

export interface ChannelWithMembers extends ChannelRow {
  chat_channel_members?: { user_id: string; role: string }[];
}

interface ChannelListProps {
  channels: ChannelWithMembers[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadCounts?: Record<string, number>;
  currentUserId?: string;
  /** Profile lookup map: userId → display name */
  profileNames?: Record<string, string>;
}

const typeIcons: Record<string, typeof Hash> = {
  channel: Hash,
  private: Lock,
  direct: MessageCircle,
  group: Users,
};

function resolveDMName(
  channel: ChannelWithMembers,
  currentUserId: string | undefined,
  profileNames: Record<string, string>,
): string {
  if (!currentUserId) return channel.name ?? "DM";
  const members = channel.chat_channel_members ?? [];
  const other = members.find((m) => m.user_id !== currentUserId);
  if (other) return profileNames[other.user_id] ?? channel.name ?? "DM";
  return channel.name ?? "DM";
}

export function ChannelList({
  channels,
  selectedId,
  onSelect,
  unreadCounts = {},
  currentUserId,
  profileNames = {},
}: ChannelListProps) {
  const publicChannels = channels.filter(
    (ch) => ch.type === "channel" || ch.type === "private",
  );
  const directChannels = channels.filter((ch) => ch.type === "direct");
  const groupChannels = channels.filter((ch) => ch.type === "group");

  return (
    <div className="space-y-4">
      {/* Public & Private Channels */}
      {publicChannels.length > 0 && (
        <ChannelSection
          channels={publicChannels}
          selectedId={selectedId}
          onSelect={onSelect}
          unreadCounts={unreadCounts}
        />
      )}

      {/* Direct Messages */}
      {directChannels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
            Mensagens Diretas
          </h4>
          <ChannelSection
            channels={directChannels}
            selectedId={selectedId}
            onSelect={onSelect}
            unreadCounts={unreadCounts}
            currentUserId={currentUserId}
            profileNames={profileNames}
            resolveNames
          />
        </div>
      )}

      {/* Groups */}
      {groupChannels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
            Grupos
          </h4>
          <ChannelSection
            channels={groupChannels}
            selectedId={selectedId}
            onSelect={onSelect}
            unreadCounts={unreadCounts}
          />
        </div>
      )}
    </div>
  );
}

// ── Section renderer ─────────────────────────────────────────────────

function ChannelSection({
  channels,
  selectedId,
  onSelect,
  unreadCounts,
  currentUserId,
  profileNames = {},
  resolveNames = false,
}: {
  channels: ChannelWithMembers[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadCounts: Record<string, number>;
  currentUserId?: string;
  profileNames?: Record<string, string>;
  resolveNames?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {channels.map((ch) => {
        const Icon = typeIcons[ch.type ?? "channel"] ?? Hash;
        const unread = unreadCounts[ch.id] ?? 0;
        const isSelected = selectedId === ch.id;

        const displayName =
          resolveNames && ch.type === "direct"
            ? resolveDMName(ch, currentUserId, profileNames)
            : (ch.name ?? "");

        // For DMs, find the other user for online indicator
        const otherUserId =
          ch.type === "direct" && currentUserId
            ? ch.chat_channel_members?.find((m) => m.user_id !== currentUserId)
                ?.user_id
            : undefined;

        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelect(ch.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isSelected
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
              unread > 0 && !isSelected && "font-semibold text-gray-900",
            )}
          >
            {otherUserId ? (
              <span className="relative shrink-0">
                <Icon className="h-3.5 w-3.5" />
                <OnlineIndicator
                  userId={otherUserId}
                  size="sm"
                  className="absolute -bottom-0.5 -right-0.5"
                />
              </span>
            ) : (
              <Icon className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate flex-1 text-left">{displayName}</span>
            {unread > 0 && !isSelected && (
              <span className="ml-auto shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
