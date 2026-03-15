"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconArchive,
  IconStarFilled,
} from "@tabler/icons-react";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { SectionRow } from "@/features/chat/services/chat";
import type { Database } from "@/lib/supabase/types";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { ChannelItem } from "./channel-list-item";
import { DraggableChannelItem } from "./sortable-channel-item";
import { DroppableSection } from "./droppable-section";
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
  // #27 — Favorites
  favoriteIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  // #28 — Mute
  mutedChannelIds?: Set<string>;
  onMuteToggle?: (id: string, muted: boolean) => void;
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
  favoriteIds = new Set(),
  onToggleFavorite,
  mutedChannelIds = new Set(),
  onMuteToggle,
}: ChannelListProps) {
  const collapsedSections = useChatStore((s) => s.collapsedSections);
  const showArchivedChannels = useChatStore((s) => s.showArchivedChannels);
  const setShowArchivedChannels = useChatStore((s) => s.setShowArchivedChannels);
  const isCreateSectionOpen = useChatStore((s) => s.isCreateSectionOpen);
  const setCreateSectionOpen = useChatStore((s) => s.setCreateSectionOpen);

  // #26 — DnD state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const activeChannel = activeDragId ? channels.find((c) => c.id === activeDragId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const channelId = active.id as string;
    const overId = over.id as string;
    const targetSectionId = overId === "__no_section__" ? null : overId;
    onMoveToSection?.(channelId, targetSectionId);
  }

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

  // #27 — Favorite channels across all public types
  const favoriteChannels = useMemo(
    () =>
      [...channels].filter(
        (ch) =>
          favoriteIds.has(ch.id) &&
          (ch.type === "channel" || ch.type === "private" || ch.type === "group" || ch.type === "direct"),
      ),
    [channels, favoriteIds],
  );

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
    onToggleFavorite,
    onMuteToggle,
  };

  const isPublicChannel = (ch: ChannelWithMembers) =>
    ch.type === "channel" || ch.type === "private";

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-1">
        {isCreateSectionOpen && (
          <InlineCreateSection
            onSubmit={(name) => onCreateSection?.(name)}
            onCancel={() => setCreateSectionOpen(false)}
          />
        )}

        {/* #27 — Starred channels section */}
        {favoriteChannels.length > 0 && (
          <div>
            <SectionHeader label="Favoritos" sectionId="__favorites__" count={favoriteChannels.length} icon={<IconStarFilled size={11} className="text-yellow-500" />} />
            {!collapsedSections.has("__favorites__") && (
              <div className="space-y-0.5">
                {favoriteChannels.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    {...sharedItemProps}
                    isFavorite
                    isMuted={mutedChannelIds.has(ch.id)}
                  />
                ))}
              </div>
            )}
          </div>
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
                <DroppableSection sectionId={section.id}>
                  {sectionChannels.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground px-4 py-1 italic">
                      Nenhum canal nesta seção
                    </p>
                  ) : (
                    sectionChannels.map((ch) => (
                      <DraggableChannelItem
                        key={ch.id}
                        channel={ch}
                        {...sharedItemProps}
                        canDrag={canManageChannels && isPublicChannel(ch)}
                        isFavorite={favoriteIds.has(ch.id)}
                        isMuted={mutedChannelIds.has(ch.id)}
                      />
                    ))
                  )}
                </DroppableSection>
              )}
            </div>
          );
        })}

        {unsectionedChannels.length > 0 && (
          <div>
            <SectionHeader label="Canais" sectionId="__channels__" count={unsectionedChannels.length} />
            {!collapsedSections.has("__channels__") && (
              <DroppableSection sectionId="__no_section__">
                {unsectionedChannels.map((ch) => (
                  <DraggableChannelItem
                    key={ch.id}
                    channel={ch}
                    {...sharedItemProps}
                    canDrag={canManageChannels && isPublicChannel(ch)}
                    isFavorite={favoriteIds.has(ch.id)}
                    isMuted={mutedChannelIds.has(ch.id)}
                  />
                ))}
              </DroppableSection>
            )}
          </div>
        )}

        {directChannels.length > 0 && (
          <div>
            <SectionHeader label="Mensagens Diretas" sectionId="__dms__" count={directChannels.length} />
            {!collapsedSections.has("__dms__") && (
              <div className="space-y-0.5">
                {directChannels.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    {...sharedItemProps}
                    isFavorite={favoriteIds.has(ch.id)}
                    isMuted={mutedChannelIds.has(ch.id)}
                  />
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
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    {...sharedItemProps}
                    isFavorite={favoriteIds.has(ch.id)}
                    isMuted={mutedChannelIds.has(ch.id)}
                  />
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

      {/* #26 — DragOverlay: ghost while dragging */}
      <DragOverlay>
        {activeChannel ? (
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm bg-background border shadow-lg opacity-90 cursor-grabbing pointer-events-none">
            <span className="text-muted-foreground">#</span>
            <span className="truncate">{activeChannel.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
