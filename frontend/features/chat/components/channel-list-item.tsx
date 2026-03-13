"use client";

import { useState } from "react";
import {
  IconHash,
  IconLock,
  IconUsers,
  IconMessage,
  IconArchive,
  IconTrash,
  IconFolder,
  IconArrowBackUp,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OnlineIndicator } from "./online-indicator";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import type { SectionRow } from "@/features/chat/services/chat";
import type { ChannelWithMembers } from "./channel-list";

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

interface ChannelItemProps {
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
}

export function ChannelItem({
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
}: ChannelItemProps) {
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
              <ContextMenuItem onClick={() => onUnarchiveChannel?.(channel.id)}>
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
              <ContextMenuItem onClick={() => onArchiveChannel?.(channel.id)}>
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
