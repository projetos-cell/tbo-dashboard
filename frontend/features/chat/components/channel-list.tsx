"use client";

import { Hash, Lock, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { OnlineIndicator } from "./online-indicator";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
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
  profileMap?: Record<string, ProfileInfo>;
}

const typeIcons: Record<string, typeof Hash> = {
  channel: Hash,
  private: Lock,
  direct: MessageCircle,
  group: Users,
};

function resolveDMInfo(
  channel: ChannelWithMembers,
  currentUserId: string | undefined,
  profileMap: Record<string, ProfileInfo>,
): ProfileInfo | undefined {
  if (!currentUserId) return undefined;
  const members = channel.chat_channel_members ?? [];
  const other = members.find((m) => m.user_id !== currentUserId);
  if (other) return profileMap[other.user_id];
  return undefined;
}

export function ChannelList({
  channels,
  selectedId,
  onSelect,
  unreadCounts = {},
  currentUserId,
  profileMap = {},
}: ChannelListProps) {
  const publicChannels = channels.filter(
    (ch) => ch.type === "channel" || ch.type === "private",
  );
  const directChannels = channels.filter((ch) => ch.type === "direct");
  const groupChannels = channels.filter((ch) => ch.type === "group");

  return (
    <div className="space-y-5">
      {/* Public & Private Channels */}
      {publicChannels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Canais
          </h4>
          <div className="space-y-0.5">
            {publicChannels.map((ch) => {
              const Icon = typeIcons[ch.type ?? "channel"] ?? Hash;
              const unread = unreadCounts[ch.id] ?? 0;
              const isSelected = selectedId === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelect(ch.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    unread > 0 && !isSelected && "font-semibold text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">
                    {ch.name ?? ""}
                  </span>
                  {unread > 0 && !isSelected && (
                    <span className="ml-auto shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Messages */}
      {directChannels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Mensagens Diretas
          </h4>
          <div className="space-y-0.5">
            {directChannels.map((ch) => {
              const unread = unreadCounts[ch.id] ?? 0;
              const isSelected = selectedId === ch.id;
              const dmProfile = resolveDMInfo(ch, currentUserId, profileMap);
              const displayName = dmProfile?.name ?? ch.name ?? "DM";
              const otherUserId = currentUserId
                ? ch.chat_channel_members?.find(
                    (m) => m.user_id !== currentUserId,
                  )?.user_id
                : undefined;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelect(ch.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    unread > 0 && !isSelected && "font-semibold text-foreground",
                  )}
                >
                  <span className="relative shrink-0">
                    <Avatar size="sm">
                      {dmProfile?.avatarUrl && (
                        <AvatarImage
                          src={dmProfile.avatarUrl}
                          alt={displayName}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    {otherUserId && (
                      <OnlineIndicator
                        userId={otherUserId}
                        size="sm"
                        className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                      />
                    )}
                  </span>
                  <span className="truncate flex-1 text-left">
                    {displayName}
                  </span>
                  {unread > 0 && !isSelected && (
                    <span className="ml-auto shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups */}
      {groupChannels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Grupos
          </h4>
          <div className="space-y-0.5">
            {groupChannels.map((ch) => {
              const unread = unreadCounts[ch.id] ?? 0;
              const isSelected = selectedId === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelect(ch.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    unread > 0 && !isSelected && "font-semibold text-foreground",
                  )}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">
                    {ch.name ?? ""}
                  </span>
                  {unread > 0 && !isSelected && (
                    <span className="ml-auto shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
