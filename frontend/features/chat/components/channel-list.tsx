"use client";

import { useMemo } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconArchive,
} from "@tabler/icons-react";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { SectionRow } from "@/features/chat/services/chat";
import type { Database } from "@/lib/supabase/types";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { ChannelItem } from "./channel-list-item";
import { SectionHeader, InlineCreateSection } from "./channel-list-section-header";

type ChannelRow = Database["public"]["Tables"]["chat_channels"]["Row"];

export interface ChannelWithMembers extends ChannelRow {
  chat_channel_members?: { user_id: string; role: string }[];
}

interface ChannelListProps {
  channels: ChannelWithMembers[];
  archivedChannels?: ChannelWithMembers[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadCounts?: Record<string, number>;
  currentUserId?: string;
  profileMap?: Record<string, ProfileInfo>;
  sections?: SectionRow[];
  onArchiveChannel?: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
  onUnarchiveChannel?: (id: string) => void;
  onMoveToSection?: (channelId: string, sectionId: string | null) => void;
  onCreateSection?: (name: string) => void;
  onRenameSection?: (id: string, name: string) => void;
  onDeleteSection?: (id: string) => void;
  canManageChannels?: boolean;
}

export function ChannelList({
  channels,
  archivedChannels = [],
  selectedId,
  onSelect,
  unreadCounts = {},
  currentUserId,
  profileMap = {},
  sections = [],
  onArchiveChannel,
  onDeleteChannel,
  onUnarchiveChannel,
  onMoveToSection,
  onCreateSection,
  onRenameSection,
  onDeleteSection,
  canManageChannels = false,
}: ChannelListProps) {
  const collapsedSections = useChatStore((s) => s.collapsedSections);
  const showArchivedChannels = useChatStore((s) => s.showArchivedChannels);
  const setShowArchivedChannels = useChatStore((s) => s.setShowArchivedChannels);
  const isCreateSectionOpen = useChatStore((s) => s.isCreateSectionOpen);
  const setCreateSectionOpen = useChatStore((s) => s.setCreateSectionOpen);

  const { sectionedChannels, unsectionedChannels, directChannels, groupChannels } =
    useMemo(() => {
      const publicChannels = channels.filter(
        (ch) => ch.type === "channel" || ch.type === "private",
      );
      const directs = channels.filter((ch) => ch.type === "direct");
      const groups = channels.filter((ch) => ch.type === "group");

      if (sections.length === 0) {
        return {
          sectionedChannels: new Map<string, ChannelWithMembers[]>(),
          unsectionedChannels: publicChannels,
          directChannels: directs,
          groupChannels: groups,
        };
      }

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
    sections,
    onArchiveChannel,
    onDeleteChannel,
    onMoveToSection,
    canManageChannels,
  };

  return (
    <div className="space-y-1">
      {isCreateSectionOpen && (
        <InlineCreateSection
          onSubmit={(name) => onCreateSection?.(name)}
          onCancel={() => setCreateSectionOpen(false)}
        />
      )}

      {sections.map((section) => {
        const sectionChannels = sectionedChannels.get(section.id) ?? [];
        const isCollapsed = collapsedSections.has(section.id);
        return (
          <div key={section.id}>
            <SectionHeader
              label={section.name}
              sectionId={section.id}
              count={sectionChannels.length}
              isCustom
              onRenameSection={onRenameSection}
              onDeleteSection={onDeleteSection}
            />
            {!isCollapsed && (
              <div className="space-y-0.5">
                {sectionChannels.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground px-4 py-1 italic">
                    Nenhum canal nesta seção
                  </p>
                ) : (
                  sectionChannels.map((ch) => (
                    <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {unsectionedChannels.length > 0 && (
        <div>
          <SectionHeader label="Canais" sectionId="__channels__" count={unsectionedChannels.length} />
          {!collapsedSections.has("__channels__") && (
            <div className="space-y-0.5">
              {unsectionedChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}

      {directChannels.length > 0 && (
        <div>
          <SectionHeader label="Mensagens Diretas" sectionId="__dms__" count={directChannels.length} />
          {!collapsedSections.has("__dms__") && (
            <div className="space-y-0.5">
              {directChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}

      {groupChannels.length > 0 && (
        <div>
          <SectionHeader label="Grupos" sectionId="__groups__" count={groupChannels.length} />
          {!collapsedSections.has("__groups__") && (
            <div className="space-y-0.5">
              {groupChannels.map((ch) => (
                <ChannelItem key={ch.id} channel={ch} {...sharedItemProps} />
              ))}
            </div>
          )}
        </div>
      )}

      {archivedChannels.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowArchivedChannels(!showArchivedChannels)}
            className="flex w-full items-center gap-1 px-2 py-1 group cursor-pointer"
          >
            {showArchivedChannels ? (
              <IconChevronDown size={12} className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <IconChevronRight size={12} className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <IconArchive size={11} className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
              Arquivados
            </span>
            <span className="text-[9px] text-muted-foreground ml-auto">
              {archivedChannels.length}
            </span>
          </button>
          {showArchivedChannels && (
            <div className="space-y-0.5 opacity-60">
              {archivedChannels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  unreadCounts={unreadCounts}
                  currentUserId={currentUserId}
                  profileMap={profileMap}
                  canManageChannels={canManageChannels}
                  isArchived
                  onUnarchiveChannel={onUnarchiveChannel}
                  onDeleteChannel={onDeleteChannel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
