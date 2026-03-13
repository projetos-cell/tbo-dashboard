"use client";

import {
  IconMessageCircle2,
  IconMessage,
  IconPlus,
  IconFolderPlus,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChannelList } from "./channel-list";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { ChannelWithMembers } from "./channel-list";
import type { SectionRow } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";

interface ChatSidebarProps {
  channels: ChannelWithMembers[] | undefined;
  archivedChannels: ChannelWithMembers[];
  sections: SectionRow[];
  selectedChannelId: string | null;
  unreadCounts: Record<string, number>;
  currentUserId: string | undefined;
  profileMap: Record<string, ProfileInfo>;
  isLoading: boolean;
  canCreateChannel: boolean;
  canManageChannels: boolean;
  showConversation: boolean;
  onSelectChannel: (id: string) => void;
  onArchiveChannel: (id: string) => void;
  onDeleteChannel: (id: string) => void;
  onUnarchiveChannel: (id: string) => void;
  onMoveToSection: (channelId: string, sectionId: string | null) => void;
  onCreateSection: (name: string) => void;
  onRenameSection: (id: string, name: string) => void;
  onDeleteSection: (id: string) => void;
}

export function ChatSidebar({
  channels,
  archivedChannels,
  sections,
  selectedChannelId,
  unreadCounts,
  currentUserId,
  profileMap,
  isLoading,
  canCreateChannel,
  canManageChannels,
  showConversation,
  onSelectChannel,
  onArchiveChannel,
  onDeleteChannel,
  onUnarchiveChannel,
  onMoveToSection,
  onCreateSection,
  onRenameSection,
  onDeleteSection,
}: ChatSidebarProps) {
  const setCreateDMOpen = useChatStore((s) => s.setCreateDMOpen);
  const setCreateSectionOpen = useChatStore((s) => s.setCreateSectionOpen);
  const setCreateChannelOpen = useChatStore((s) => s.setCreateChannelOpen);

  return (
    <div
      className={cn(
        "w-80 shrink-0 border-r flex flex-col",
        showConversation && "hidden md:flex",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Mensagens</h3>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCreateDMOpen(true)}
              >
                <IconMessage size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Nova conversa</TooltipContent>
          </Tooltip>
          {canCreateChannel && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCreateSectionOpen(true)}
                  >
                    <IconFolderPlus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Criar seção</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCreateChannelOpen(true)}
                  >
                    <IconPlus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Criar canal</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : !channels || channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <IconMessageCircle2 size={32} className="opacity-30 mb-2" />
            <p className="text-xs">Nenhum canal ainda</p>
          </div>
        ) : (
          <ChannelList
            channels={channels}
            archivedChannels={archivedChannels}
            selectedId={selectedChannelId}
            onSelect={onSelectChannel}
            unreadCounts={unreadCounts}
            currentUserId={currentUserId}
            profileMap={profileMap}
            sections={sections}
            onArchiveChannel={onArchiveChannel}
            onDeleteChannel={onDeleteChannel}
            onUnarchiveChannel={onUnarchiveChannel}
            onMoveToSection={onMoveToSection}
            onCreateSection={onCreateSection}
            onRenameSection={onRenameSection}
            onDeleteSection={onDeleteSection}
            canManageChannels={canManageChannels}
          />
        )}
      </div>
    </div>
  );
}
