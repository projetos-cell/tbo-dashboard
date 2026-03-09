"use client";

import { useState, type KeyboardEvent } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
  senderProfile?: ProfileInfo;
  showAvatar?: boolean;
  canDelete?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  senderProfile,
  showAvatar = true,
  canDelete,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content ?? "");

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
      className={cn(
        "group flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        !showAvatar && !isOwn && "pl-10",
        !showAvatar && isOwn && "pr-10",
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          {senderProfile?.avatarUrl && (
            <AvatarImage src={senderProfile.avatarUrl} alt={senderName} />
          )}
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-6 shrink-0" />}

      {/* Bubble content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%] gap-0.5",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Sender name (first message in group, others only) */}
        {showAvatar && !isOwn && (
          <span className="text-[11px] font-medium text-muted-foreground px-1 mb-0.5">
            {senderName}
          </span>
        )}

        <div className="flex items-start gap-1">
          {/* Menu (left side for own) */}
          {isOwn && showMenu && (
            <MessageMenu
              isOwn={isOwn}
              canEdit={isOwn}
              canDelete={isOwn || !!canDelete}
              onEdit={() => {
                setEditContent(message.content ?? "");
                setIsEditing(true);
              }}
              onDelete={() => onDelete?.(message.id)}
            />
          )}

          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm",
              isOptimistic && "opacity-60",
            )}
          >
            {isEditing ? (
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-7 text-sm bg-background text-foreground"
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
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>

          {/* Menu (right side for others) */}
          {!isOwn && showMenu && (
            <MessageMenu
              isOwn={isOwn}
              canEdit={false}
              canDelete={!!canDelete}
              onEdit={() => {}}
              onDelete={() => onDelete?.(message.id)}
            />
          )}
        </div>

        {/* Timestamp + edited */}
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isEdited && (
            <span className="text-[10px] text-muted-foreground italic">
              (editado)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────

function MessageMenu({
  isOwn,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  isOwn: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"}>
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Editar
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
