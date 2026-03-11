"use client";

import { useMemo } from "react";
import {
  IconHash,
  IconLock,
  IconUsers,
  IconMessage,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { OnlineIndicator } from "./online-indicator";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { SectionRow } from "@/features/chat/services/chat";
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
  sections?: SectionRow[];
}

const typeIcons: Record<string, typeof IconHash> = {
  channel: IconHash,
  private: IconLock,
  direct: IconMessage,
  group: IconUsers,
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

/* ── Reusable channel item ─────────────────────────────────────────── */

function ChannelItem({
  channel,
  selectedId,
  onSelect,
  unreadCounts,
  currentUserId,
  profileMap,
}: {
  channel: ChannelWithMembers;
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadCounts: Record<string, number>;
  currentUserId?: string;
  profileMap: Record<string, ProfileInfo>;
}) {
  const unread = unreadCounts[channel.id] ?? 0;
  const isSelected = selectedId === channel.id;
  const isDM = channel.type === "direct";
  const isGroup = channel.type === "group";

  // DM-specific display
  const dmProfile = isDM
    ? resolveDMInfo(channel, currentUserId, profileMap)
    : undefined;
  const displayName = isDM
    ? dmProfile?.name ?? channel.name ?? "DM"
    : channel.name ?? "";
  const otherUserId =
    isDM && currentUserId
      ? channel.chat_channel_members?.find(
          (m) => m.user_id !== currentUserId,
        )?.user_id
      : undefined;

  const Icon = typeIcons[channel.type ?? "channel"] ?? IconHash;

  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        unread > 0 && !isSelected && "font-semibold text-foreground",
      )}
    >
      {isDM && otherUserId ? (
        <span className="relative shrink-0">
          <Avatar size="sm">
            {dmProfile?.avatarUrl && (
              <AvatarImage src={dmProfile.avatarUrl} alt={displayName} />
            )}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <OnlineIndicator
            userId={otherUserId}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
          />
        </span>
      ) : isGroup ? (
        <IconUsers size={16} className="shrink-0" />
      ) : (
        <Icon size={16} className="shrink-0" />
      )}
      <span className="truncate flex-1 text-left">{displayName}</span>
      {unread > 0 && !isSelected && (
        <span className="ml-auto shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

/* ── Collapsible Section Header ────────────────────────────────────── */

function SectionHeader({
  label,
  sectionId,
  count,
}: {
  label: string;
  sectionId: string;
  count: number;
}) {
  const collapsed = useChatStore((s) => s.collapsedSections.has(sectionId));
  const toggleSection = useChatStore((s) => s.toggleSection);

  return (
    <button
      type="button"
      onClick={() => toggleSection(sectionId)}
      className="flex w-full items-center gap-1 px-2 py-1 group cursor-pointer"
    >
      {collapsed ? (
        <IconChevronRight
          size={12}
          className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
        />
      ) : (
        <IconChevronDown
          size={12}
          className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
        />
      )}
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
        {label}
      </span>
      {count > 0 && collapsed && (
        <span className="text-[9px] text-muted-foreground ml-auto">
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Main ChannelList ──────────────────────────────────────────────── */

export function ChannelList({
  channels,
  selectedId,
  onSelect,
  unreadCounts = {},
  currentUserId,
  profileMap = {},
  sections = [],
}: ChannelListProps) {
  const collapsedSections = useChatStore((s) => s.collapsedSections);

  // Group channels by type and section
  const { sectionedChannels, unsectionedChannels, directChannels, groupChannels } =
    useMemo(() => {
      const publicChannels = channels.filter(
        (ch) => ch.type === "channel" || ch.type === "private",
      );
      const directs = channels.filter((ch) => ch.type === "direct");
      const groups = channels.filter((ch) => ch.type === "group");

      // If no custom sections, return all public channels as unsectioned
      if (sections.length === 0) {
        return {
          sectionedChannels: new Map<string, ChannelWithMembers[]>(),
          unsectionedChannels: publicChannels,
          directChannels: directs,
          groupChannels: groups,
        };
      }

      // Group public channels by section_id
      const bySection = new Map<string, ChannelWithMembers[]>();
      const noSection: ChannelWithMembers[] = [];

      for (const ch of publicChannels) {
        const sid = (ch as unknown as Record<string, unknown>).section_id as string | null;
        if (sid && sections.some((s) => s.id === sid)) {
          const list = bySection.get(sid) ?? [];
          list.push(ch);
          bySection.set(sid, list);
        } else {
          noSection.push(ch);
        }
      }

      return {
        sectionedChannels: bySection,
        unsectionedChannels: noSection,
        directChannels: directs,
        groupChannels: groups,
      };
    }, [channels, sections]);

  const sharedItemProps = {
    selectedId,
    onSelect,
    unreadCounts,
    currentUserId,
    profileMap,
  };

  return (
    <div className="space-y-1">
      {/* Sectioned channels (custom sections from DB) */}
      {sections.map((section) => {
        const sectionChannels = sectionedChannels.get(section.id) ?? [];
        if (sectionChannels.length === 0) return null;
        const isCollapsed = collapsedSections.has(section.id);

        return (
          <div key={section.id}>
            <SectionHeader
              label={section.name}
              sectionId={section.id}
              count={sectionChannels.length}
            />
            {!isCollapsed && (
              <div className="space-y-0.5">
                {sectionChannels.map((ch) => (
                  <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Unsectioned public/private channels */}
      {unsectionedChannels.length > 0 && (
        <div>
          <SectionHeader
            label="Canais"
            sectionId="__channels__"
            count={unsectionedChannels.length}
          />
          {!collapsedSections.has("__channels__") && (
            <div className="space-y-0.5">
              {unsectionedChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Messages */}
      {directChannels.length > 0 && (
        <div>
          <SectionHeader
            label="Mensagens Diretas"
            sectionId="__dms__"
            count={directChannels.length}
          />
          {!collapsedSections.has("__dms__") && (
            <div className="space-y-0.5">
              {directChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups */}
      {groupChannels.length > 0 && (
        <div>
          <SectionHeader
            label="Grupos"
            sectionId="__groups__"
            count={groupChannels.length}
          />
          {!collapsedSections.has("__groups__") && (
            <div className="space-y-0.5">
              {groupChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
