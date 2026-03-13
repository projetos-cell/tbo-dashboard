"use client";

import {
  IconHash,
  IconSearch,
  IconSettings,
  IconArrowLeft,
  IconLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import { getInitials } from "@/features/chat/utils/profile-utils";
import { useChatStore } from "@/features/chat/stores/chat-store";

export interface ConversationHeaderInfo {
  name: string;
  avatarUrl?: string;
  otherUserId?: string;
  icon: typeof IconHash | null;
  description?: string | null;
}

interface ConversationHeaderProps {
  headerInfo: ConversationHeaderInfo;
  onBack: () => void;
}

export function ConversationHeader({ headerInfo, onBack }: ConversationHeaderProps) {
  const toggleSearch = useChatStore((s) => s.toggleSearch);
  const setChannelSettingsOpen = useChatStore((s) => s.setChannelSettingsOpen);

  return (
    <div className="flex items-center gap-3 border-b px-4 py-2.5">
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
        <span className="font-medium text-sm truncate">{headerInfo.name}</span>
        {headerInfo.description && (
          <span className="text-[11px] text-muted-foreground truncate">
            {headerInfo.description}
          </span>
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
