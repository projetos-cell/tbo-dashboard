"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  IconHash,
  IconLock,
  IconUsers,
  IconMessage,
  IconChevronDown,
  IconChevronRight,
  IconArchive,
  IconTrash,
  IconPencil,
  IconFolder,
  IconFolderPlus,
  IconArrowBackUp,
  IconDots,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

/* ── Channel Item with Context Menu ────────────────────────────────── */

function ChannelItem({
  channel,
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
  isArchived,
  onUnarchiveChannel,
}: {
  channel: ChannelWithMembers;
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadCounts: Record<string, number>;
  currentUserId?: string;
  profileMap: Record<string, ProfileInfo>;
  sections?: SectionRow[];
  onArchiveChannel?: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
  onMoveToSection?: (channelId: string, sectionId: string | null) => void;
  canManageChannels?: boolean;
  isArchived?: boolean;
  onUnarchiveChannel?: (id: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const unread = unreadCounts[channel.id] ?? 0;
  const isSelected = selectedId === channel.id;
  const isDM = channel.type === "direct";
  const isGroup = channel.type === "group";
  const isPublicType = channel.type === "channel" || channel.type === "private";

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

  const channelButton = (
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

  // No context menu for DMs/groups or non-managers
  if ((!isPublicType && !isArchived) || !canManageChannels) {
    return channelButton;
  }

  const currentSectionId = (channel as unknown as Record<string, unknown>).section_id as string | null;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {channelButton}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          {isArchived ? (
            <>
              <ContextMenuItem
                onClick={() => onUnarchiveChannel?.(channel.id)}
              >
                <IconArrowBackUp size={14} className="mr-2" />
                Desarquivar
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash size={14} className="mr-2" />
                Deletar permanentemente
              </ContextMenuItem>
            </>
          ) : (
            <>
              {/* Move to section */}
              {sections && sections.length > 0 && onMoveToSection && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <IconFolder size={14} className="mr-2" />
                    Mover para seção
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuItem
                      onClick={() => onMoveToSection(channel.id, null)}
                      disabled={!currentSectionId}
                    >
                      Sem seção
                    </ContextMenuItem>
                    {sections.map((s) => (
                      <ContextMenuItem
                        key={s.id}
                        onClick={() => onMoveToSection(channel.id, s.id)}
                        disabled={currentSectionId === s.id}
                      >
                        {s.name}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              <ContextMenuItem
                onClick={() => onArchiveChannel?.(channel.id)}
              >
                <IconArchive size={14} className="mr-2" />
                Arquivar canal
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash size={14} className="mr-2" />
                Deletar permanentemente
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar canal permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as mensagens, arquivos e membros do canal{" "}
              <strong>#{channel.name}</strong> serão removidos. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteChannel?.(channel.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ── Collapsible Section Header with Context Menu ──────────────────── */

function SectionHeader({
  label,
  sectionId,
  count,
  isCustom,
  onRenameSection,
  onDeleteSection,
}: {
  label: string;
  sectionId: string;
  count: number;
  isCustom?: boolean;
  onRenameSection?: (id: string, name: string) => void;
  onDeleteSection?: (id: string) => void;
}) {
  const collapsed = useChatStore((s) => s.collapsedSections.has(sectionId));
  const toggleSection = useChatStore((s) => s.toggleSection);
  const renamingSectionId = useChatStore((s) => s.renamingSectionId);
  const setRenamingSectionId = useChatStore((s) => s.setRenamingSectionId);

  const [renameValue, setRenameValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRenaming = renamingSectionId === sectionId;

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(label);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isRenaming, label]);

  function handleRenameSubmit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) {
      onRenameSection?.(sectionId, trimmed);
    }
    setRenamingSectionId(null);
  }

  if (isRenaming && isCustom) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") setRenamingSectionId(null);
          }}
          className="h-6 text-[10px] font-semibold uppercase tracking-wider px-1"
        />
      </div>
    );
  }

  const headerButton = (
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

  if (!isCustom) return headerButton;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {headerButton}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => toggleSection(sectionId)}>
          {collapsed ? (
            <>
              <IconChevronDown size={14} className="mr-2" />
              Expandir seção
            </>
          ) : (
            <>
              <IconChevronRight size={14} className="mr-2" />
              Recolher seção
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setRenamingSectionId(sectionId)}>
          <IconPencil size={14} className="mr-2" />
          Renomear seção
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDeleteSection?.(sectionId)}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash size={14} className="mr-2" />
          Deletar seção
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ── Inline Create Section ─────────────────────────────────────────── */

function InlineCreateSection({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
    onCancel();
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <IconFolderPlus size={12} className="shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Nome da seção..."
        className="h-6 text-[10px] font-semibold uppercase tracking-wider px-1"
      />
    </div>
  );
}

/* ── Main ChannelList ──────────────────────────────────────────────── */

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

  // Group channels by type and section
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
      {/* Create Section inline */}
      {isCreateSectionOpen && (
        <InlineCreateSection
          onSubmit={(name) => onCreateSection?.(name)}
          onCancel={() => setCreateSectionOpen(false)}
        />
      )}

      {/* Sectioned channels (custom sections from DB) */}
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

      {/* Archived channels */}
      {archivedChannels.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowArchivedChannels(!showArchivedChannels)}
            className="flex w-full items-center gap-1 px-2 py-1 group cursor-pointer"
          >
            {showArchivedChannels ? (
              <IconChevronDown
                size={12}
                className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
              />
            ) : (
              <IconChevronRight
                size={12}
                className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
              />
            )}
            <IconArchive
              size={11}
              className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
            />
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
