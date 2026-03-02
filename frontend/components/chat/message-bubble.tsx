"use client";

import { useState, type KeyboardEvent } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnlineIndicator } from "./online-indicator";
import type { MessageRow } from "@/services/chat";

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
  senderName?: string;
  canDelete?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
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
        "group flex flex-col max-w-[70%] gap-0.5",
        isOwn ? "items-end self-end" : "items-start self-start",
      )}
    >
      {/* Sender name + online dot (only for others' messages) */}
      {!isOwn && senderName && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground px-1 mb-0.5">
          <OnlineIndicator userId={message.sender_id ?? ""} size="sm" />
          {senderName}
        </span>
      )}

      <div className="flex items-start gap-1">
        {/* Menu trigger (left side for own messages) */}
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
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
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
              <div className="flex gap-1.5 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    setEditContent(message.content ?? "");
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={handleSaveEdit}
                >
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Menu trigger (right side for others' messages) */}
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

      {/* Timestamp + edited badge */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-muted-foreground">{time}</span>
        {isEdited && (
          <span className="text-[10px] text-muted-foreground italic">(editado)</span>
        )}
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
          <MoreVertical className="h-3.5 w-3.5" />
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
