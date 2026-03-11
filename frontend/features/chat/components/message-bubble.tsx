"use client";

import { useState, type KeyboardEvent } from "react";
import {
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconPin,
  IconPinnedOff,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { parseMentions } from "./mention-popup";

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
  senderProfile?: ProfileInfo;
  showAvatar?: boolean;
  canDelete?: boolean;
  attachments?: ChatAttachmentRow[];
  profileMap?: Record<string, ProfileInfo>;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onTogglePin?: (messageId: string, pinned: boolean) => void;
}

export function MessageBubble({
  message,
  isOwn,
  senderProfile,
  showAvatar = true,
  canDelete,
  attachments = [],
  profileMap = {},
  onEdit,
  onDelete,
  onTogglePin,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const time = new Date(message.created_at ?? "").toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEdited = !!message.edited_at;
  const isOptimistic = message.id.startsWith("optimistic-");
  const showMenu = (isOwn || canDelete) && !isOptimistic;
  const senderName = senderProfile?.name ?? "Usuário";

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
        {/* Sender name + time (first message in group) */}
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className={cn(
                "text-sm font-semibold",
                getUserColor(message.sender_id ?? ""),
              )}
            >
              {senderName}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
            {isEdited && (
              <span className="text-[10px] text-muted-foreground italic">
                (editado)
              </span>
            )}
          </div>
        )}

        {/* Message body */}
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
            <div className="flex items-start gap-1">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                <MessageContent content={message.content ?? ""} profileMap={profileMap} />
              </p>
              {/* Inline time for non-first messages */}
              {!showAvatar && (
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {time}
                  {isEdited && " (editado)"}
                </span>
              )}
            </div>
            {attachments.length > 0 && (
              <MessageAttachments attachments={attachments} />
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
            isPinned={!!message.is_pinned}
            onEdit={() => {
              setEditContent(message.content ?? "");
              setIsEditing(true);
            }}
            onDelete={() => setShowDeleteConfirm(true)}
            onTogglePin={() => onTogglePin?.(message.id, !message.is_pinned)}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A mensagem será removida para todos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => onDelete?.(message.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Message Content (with mention rendering) ─────────────────────────

function MessageContent({
  content,
  profileMap,
}: {
  content: string;
  profileMap: Record<string, ProfileInfo>;
}) {
  // Check if content has mentions pattern
  if (!content.includes("<@")) {
    return <>{content}</>;
  }

  const segments = parseMentions(content, profileMap);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center rounded bg-primary/10 px-1 py-0.5 text-xs font-medium text-primary cursor-default"
          >
            @{seg.name}
          </span>
        ),
      )}
    </>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────

function MessageMenu({
  canEdit,
  canDelete,
  canPin,
  isPinned,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  if (!canEdit && !canDelete && !canPin) return null;

  return (
    <div className="flex gap-0.5 rounded-md border bg-background p-0.5 shadow-sm">
      {canPin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onTogglePin}
          title={isPinned ? "Desafixar" : "Fixar"}
        >
          {isPinned ? <IconPinnedOff size={14} /> : <IconPin size={14} />}
        </Button>
      )}
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <IconPencil size={14} />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <IconTrash size={14} />
        </Button>
      )}
    </div>
  );
}
