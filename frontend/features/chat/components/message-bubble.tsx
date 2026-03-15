"use client";

import { useState, type KeyboardEvent } from "react";
import { IconCheck, IconX, IconCornerUpRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ChatAttachmentRow } from "@/features/chat/services/chat-attachments";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { getUserColor } from "@/features/chat/utils/chat-colors";
import { MessageAttachments } from "./message-attachments";
import { MessageContent, MessageMenu, MessageDeleteDialog } from "./message-bubble-parts";
import { MessageReactions } from "./message-reactions";
import { VoiceMessagePlayer } from "./voice-message-player";
import { LinkPreviewCard, extractFirstUrl } from "./link-preview-card";
import { MessageEditHistoryDialog } from "./message-edit-history-dialog";
import type { ReactionGroup } from "@/features/chat/hooks/use-chat";
import type { Json } from "@/lib/supabase/types";

function isForwardedMeta(meta: Json | null): boolean {
  return (
    !!meta &&
    typeof meta === "object" &&
    !Array.isArray(meta) &&
    "forwarded_from" in meta
  );
}

function getForwardedFrom(meta: Json | null) {
  if (!isForwardedMeta(meta)) return null;
  const obj = meta as Record<string, Json | undefined>;
  const fw = obj.forwarded_from;
  if (!fw || typeof fw !== "object" || Array.isArray(fw)) return null;
  const fwObj = fw as Record<string, Json | undefined>;
  return {
    message_id: typeof fwObj.message_id === "string" ? fwObj.message_id : undefined,
    sender_name: typeof fwObj.sender_name === "string" ? fwObj.sender_name : undefined,
    content: typeof fwObj.content === "string" ? fwObj.content : undefined,
    original_created_at: typeof fwObj.original_created_at === "string" ? fwObj.original_created_at : undefined,
  };
}

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
  senderProfile?: ProfileInfo;
  showAvatar?: boolean;
  canDelete?: boolean;
  attachments?: ChatAttachmentRow[];
  profileMap?: Record<string, ProfileInfo>;
  reactions?: ReactionGroup[];
  threadCount?: number;
  bookmarkedMessageIds?: Set<string>;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onTogglePin?: (messageId: string, pinned: boolean) => void;
  onReact?: (messageId: string, emoji: string, remove: boolean) => void;
  onOpenThread?: (message: MessageRow) => void;
  onForward?: (message: MessageRow) => void;
  onBookmark?: (messageId: string, remove: boolean) => void;
}

export function MessageBubble({
  message,
  isOwn,
  senderProfile,
  showAvatar = true,
  canDelete,
  attachments = [],
  profileMap = {},
  reactions = [],
  threadCount = 0,
  bookmarkedMessageIds,
  onEdit,
  onDelete,
  onTogglePin,
  onReact,
  onOpenThread,
  onForward,
  onBookmark,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // #18 — edit history dialog
  const [showEditHistory, setShowEditHistory] = useState(false);

  const time = new Date(message.created_at ?? "").toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEdited = !!message.edited_at;
  const isOptimistic = message.id.startsWith("optimistic-");
  const showMenu = !isOptimistic;
  const senderName = senderProfile?.name ?? "Usuário";

  // Detect forwarded message
  const forwardedFrom = getForwardedFrom(message.metadata);
  const isForwarded = !!forwardedFrom;

  // Detect voice message
  const isVoice = message.message_type === "voice";
  const voiceAttachment = isVoice
    ? attachments.find((a) => a.file_type?.startsWith("audio/") || a.file_name?.includes("voice-message"))
    : undefined;

  // #15 — Extract URL for link preview (plain text messages only, no attachments)
  const linkPreviewUrl =
    !isVoice && !isForwarded && attachments.length === 0 && !message.id.startsWith("optimistic-")
      ? extractFirstUrl(message.content ?? "")
      : null;

  // Non-audio/non-voice attachments shown in MessageAttachments
  const visibleAttachments = isVoice
    ? attachments.filter((a) => !(a.file_type?.startsWith("audio/") || a.file_name?.includes("voice-message")))
    : attachments;

  function handleSaveEdit() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed);
    setIsEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditContent(message.content ?? "");
      setIsEditing(false);
    }
  }

  return (
    <div
      id={`msg-${message.id}`}
      className="group relative flex items-start gap-3 px-4 py-1 hover:bg-muted/50 transition-colors"
    >
      {/* Avatar */}
      {showAvatar ? (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          {senderProfile?.avatarUrl && (
            <AvatarImage src={senderProfile.avatarUrl} alt={senderName} />
          )}
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={cn("text-sm font-semibold", getUserColor(message.sender_id ?? ""))}>
              {senderName}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
            {isEdited && (
              <button
                type="button"
                onClick={() => setShowEditHistory(true)}
                className="text-[10px] text-muted-foreground italic hover:text-primary transition-colors"
                title="Ver histórico de edições"
              >
                (editado)
              </button>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-1.5 max-w-md">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-sm"
            />
            <div className="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setEditContent(message.content ?? "");
                  setIsEditing(false);
                }}
              >
                <IconX size={14} />
              </Button>
              <Button size="icon" className="h-6 w-6" onClick={handleSaveEdit}>
                <IconCheck size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Forwarded badge */}
            {isForwarded && forwardedFrom && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                <IconCornerUpRight size={11} />
                <span>Encaminhado de <strong>{forwardedFrom.sender_name}</strong></span>
              </div>
            )}

            <div className="flex items-start gap-1">
              {isVoice && voiceAttachment ? (
                <VoiceMessagePlayer url={voiceAttachment.file_url} />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  <MessageContent content={message.content ?? ""} profileMap={profileMap} />
                </p>
              )}
              {!showAvatar && (
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {time}
                  {isEdited && " (editado)"}
                </span>
              )}
            </div>

            {/* #15 — Link preview */}
            {linkPreviewUrl && <LinkPreviewCard url={linkPreviewUrl} />}

            {visibleAttachments.length > 0 && (
              <MessageAttachments attachments={visibleAttachments} />
            )}

            {reactions.length > 0 && (
              <MessageReactions
                reactions={reactions}
                profileMap={profileMap}
                onToggle={(emoji, remove) => onReact?.(message.id, emoji, remove)}
              />
            )}

            {/* Thread reply count */}
            {threadCount > 0 && (
              <button
                type="button"
                onClick={() => onOpenThread?.(message)}
                className="flex items-center gap-1 text-xs text-primary hover:underline w-fit mt-0.5"
              >
                <IconCornerUpRight size={12} />
                {threadCount} {threadCount === 1 ? "resposta" : "respostas"} na thread
              </button>
            )}
          </div>
        )}
      </div>

      {/* Context menu — appears on hover */}
      {showMenu && (
        <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <MessageMenu
            canEdit={isOwn}
            canDelete={isOwn || !!canDelete}
            canPin={!!onTogglePin}
            isPinned={!!(message as Record<string, unknown>).is_pinned}
            onEdit={() => {
              setEditContent(message.content ?? "");
              setIsEditing(true);
            }}
            onDelete={() => setShowDeleteConfirm(true)}
            onTogglePin={() =>
              onTogglePin?.(message.id, !(message as Record<string, unknown>).is_pinned)
            }
            onQuickReact={onReact ? (emoji) => onReact(message.id, emoji, false) : undefined}
            onReplyInThread={onOpenThread ? () => onOpenThread(message) : undefined}
            onForward={onForward ? () => onForward(message) : undefined}
            onBookmark={
              onBookmark
                ? () => onBookmark(message.id, bookmarkedMessageIds?.has(message.id) ?? false)
                : undefined
            }
            isBookmarked={bookmarkedMessageIds?.has(message.id)}
          />
        </div>
      )}

      <MessageDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => onDelete?.(message.id)}
      />

      {/* #18 — Edit history dialog */}
      {isEdited && (
        <MessageEditHistoryDialog
          messageId={message.id}
          currentContent={message.content ?? ""}
          open={showEditHistory}
          onOpenChange={setShowEditHistory}
          profileMap={profileMap}
        />
      )}
    </div>
  );
}
