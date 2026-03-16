"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconHash,
  IconSearch,
  IconSettings,
  IconArrowLeft,
  IconLock,
  IconBookmark,
  IconSpeakerphone,
  IconPencil,
  IconCheck,
  IconX,
  IconPhoto,
  IconBriefcase,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { OnlineIndicator } from "./online-indicator";
import { JumpToDatePicker } from "./jump-to-date-picker";
import { getInitials, type ProfileInfo } from "@/features/chat/utils/profile-utils";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { Badge } from "@/components/ui/badge";

export interface ConversationHeaderInfo {
  name: string;
  avatarUrl?: string;
  otherUserId?: string;
  icon: typeof IconHash | null;
  description?: string | null;
  isReadOnly?: boolean;
  whoCanPost?: "everyone" | "admins";
}

interface ConversationHeaderProps {
  headerInfo: ConversationHeaderInfo;
  channelId?: string | null;
  profileMap?: Record<string, ProfileInfo>;
  onBack: () => void;
  onOpenBookmarks?: () => void;
  onJumpToMessage?: (messageId: string) => void;
  // #31 — Topic editing
  canEditTopic?: boolean;
  onUpdateTopic?: (channelId: string, description: string) => void;
  // #38 — Media gallery
  onOpenMediaGallery?: () => void;
  // #44 — Project-linked channel
  projectName?: string | null;
  // #45 — AI summary
  onOpenSummary?: () => void;
}

export function ConversationHeader({
  headerInfo,
  channelId,
  profileMap,
  onBack,
  onOpenBookmarks,
  onJumpToMessage,
  canEditTopic = false,
  onUpdateTopic,
  onOpenMediaGallery,
  projectName,
  onOpenSummary,
}: ConversationHeaderProps) {
  const toggleSearch = useChatStore((s) => s.toggleSearch);
  const setChannelSettingsOpen = useChatStore((s) => s.setChannelSettingsOpen);

  // #31 — Topic inline editing state
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicValue, setTopicValue] = useState(headerInfo.description ?? "");
  const topicInputRef = useRef<HTMLInputElement>(null);

  // Reset topic when channel changes
  useEffect(() => {
    setIsEditingTopic(false);
    setTopicValue(headerInfo.description ?? "");
  }, [channelId, headerInfo.description]);

  useEffect(() => {
    if (isEditingTopic) topicInputRef.current?.focus();
  }, [isEditingTopic]);

  function handleSaveTopic() {
    if (channelId && onUpdateTopic) {
      onUpdateTopic(channelId, topicValue.trim());
    }
    setIsEditingTopic(false);
  }

  function handleCancelTopic() {
    setTopicValue(headerInfo.description ?? "");
    setIsEditingTopic(false);
  }

  function handleTopicKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSaveTopic();
    if (e.key === "Escape") handleCancelTopic();
  }

  const showDescription = !headerInfo.otherUserId; // only for channels, not DMs

  return (
    <div className="flex items-center gap-3 border-b px-4 py-2.5 min-h-[48px]">
      {/* Mobile back */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:hidden shrink-0"
        onClick={onBack}
      >
        <IconArrowLeft size={16} />
      </Button>

      {/* Avatar / Icon */}
      {headerInfo.otherUserId ? (
        <span className="relative shrink-0">
          <Avatar size="sm">
            {headerInfo.avatarUrl && (
              <AvatarImage src={headerInfo.avatarUrl} alt={headerInfo.name} />
            )}
            <AvatarFallback>{getInitials(headerInfo.name)}</AvatarFallback>
          </Avatar>
          <OnlineIndicator
            userId={headerInfo.otherUserId}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
          />
        </span>
      ) : headerInfo.icon ? (
        <headerInfo.icon size={16} className="text-muted-foreground shrink-0" />
      ) : null}

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{headerInfo.name}</span>
          {headerInfo.isReadOnly && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-[10px] h-4 px-1.5 py-0">
              <IconSpeakerphone size={9} />
              Anúncios
            </Badge>
          )}
          {!headerInfo.isReadOnly && headerInfo.whoCanPost === "admins" && (
            <Badge variant="outline" className="shrink-0 gap-1 text-[10px] h-4 px-1.5 py-0">
              <IconLock size={9} />
              Só admins
            </Badge>
          )}
          {/* #44 — Project badge */}
          {projectName && (
            <Badge variant="outline" className="shrink-0 gap-1 text-[10px] h-4 px-1.5 py-0 text-muted-foreground">
              <IconBriefcase size={9} />
              {projectName}
            </Badge>
          )}
        </div>

        {/* #31 — Topic / description row */}
        {showDescription && (
          <div className="flex items-center gap-1 group/topic">
            {isEditingTopic ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  ref={topicInputRef}
                  value={topicValue}
                  onChange={(e) => setTopicValue(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  placeholder="Adicionar tópico do canal..."
                  className="h-5 text-[11px] px-1.5 py-0 border-primary/50 focus-visible:ring-0 focus-visible:border-primary"
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={handleSaveTopic}
                  className="text-green-500 hover:text-green-600 shrink-0"
                  aria-label="Salvar tópico"
                >
                  <IconCheck size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelTopic}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Cancelar edição"
                >
                  <IconX size={12} />
                </button>
              </div>
            ) : (
              <>
                <span
                  className="text-[11px] text-muted-foreground truncate"
                  title={headerInfo.description ?? undefined}
                >
                  {headerInfo.description || (canEditTopic ? (
                    <span className="italic opacity-0 group-hover/topic:opacity-60 transition-opacity">
                      Adicionar tópico...
                    </span>
                  ) : null)}
                </span>
                {canEditTopic && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTopic(true)}
                    className="opacity-0 group-hover/topic:opacity-60 hover:!opacity-100 transition-opacity shrink-0 text-muted-foreground"
                    aria-label="Editar tópico"
                  >
                    <IconPencil size={11} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSearch}>
              <IconSearch size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Buscar mensagens</TooltipContent>
        </Tooltip>

        {/* #21 — Jump to date */}
        {channelId && profileMap && onJumpToMessage && (
          <JumpToDatePicker
            channelId={channelId}
            profileMap={profileMap}
            onJumpToMessage={onJumpToMessage}
          />
        )}

        {onOpenBookmarks && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenBookmarks}>
                <IconBookmark size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mensagens salvas</TooltipContent>
          </Tooltip>
        )}

        {/* #38 — Media gallery */}
        {onOpenMediaGallery && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenMediaGallery}>
                <IconPhoto size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Arquivos & Mídia</TooltipContent>
          </Tooltip>
        )}
        {/* #45 — AI summary */}
        {onOpenSummary && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSummary}>
                <IconSparkles size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>O que perdi? (resumo IA)</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setChannelSettingsOpen(true)}
            >
              <IconSettings size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Configurações</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// Re-export icon types needed for building headerInfo externally
export { IconHash, IconLock };
