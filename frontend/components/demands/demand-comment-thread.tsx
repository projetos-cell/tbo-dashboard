"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDemandComments,
  useCreateDemandComment,
  useUpdateDemandComment,
  useDeleteDemandComment,
} from "@/hooks/use-demand-comments";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type DemandComment =
  Database["public"]["Tables"]["demand_comments"]["Row"];

interface DemandCommentThreadProps {
  demandId: string;
  className?: string;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DemandCommentThread({
  demandId,
  className,
}: DemandCommentThreadProps) {
  const { data: comments, isLoading } = useDemandComments(demandId);
  const createComment = useCreateDemandComment();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <CommentComposer
        onSubmit={async (content) => {
          if (!userId || !tenantId) return;
          await createComment.mutateAsync({
            demand_id: demandId,
            content,
            author_id: userId,
            tenant_id: tenantId,
            mentions: [],
          } as Database["public"]["Tables"]["demand_comments"]["Insert"]);
        }}
        disabled={!userId}
      />

      {(!comments || comments.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum comentario ainda
        </p>
      )}

      {(comments || []).map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          demandId={demandId}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}

function CommentComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva um comentario..."
        className="min-h-[60px] resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button
        size="icon"
        className="size-8 shrink-0"
        onClick={handleSubmit}
        disabled={!content.trim() || submitting || disabled}
        aria-label="Enviar comentario"
      >
        <Send className="size-3.5" />
      </Button>
    </div>
  );
}

function CommentItem({
  comment,
  demandId,
  currentUserId,
}: {
  comment: DemandComment;
  demandId: string;
  currentUserId?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateComment = useUpdateDemandComment();
  const deleteComment = useDeleteDemandComment();

  const isOwner = currentUserId === comment.author_id;

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }
    await updateComment.mutateAsync({
      id: comment.id,
      content: trimmed,
      demandId,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteComment.mutateAsync({ id: comment.id, demandId });
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-7 shrink-0 mt-0.5">
        <AvatarFallback className="text-[9px]">
          {getInitials(comment.author_id?.slice(0, 4) || null)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.author_id?.slice(0, 8) || "Anonimo"}
          </span>
          <span className="text-xs text-muted-foreground">
            {comment.created_at &&
              formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
          </span>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 ml-auto"
                  aria-label="Acoes"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
