"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, MoreHorizontal, Pencil, Trash2, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/use-comments";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Comment = Database["public"]["Tables"]["project_comments"]["Row"] & {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface CommentThreadProps {
  taskId: string;
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

export function CommentThread({ taskId, className }: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(taskId);
  const createComment = useCreateComment();
  const userId = useAuthStore((s) => s.user?.id);

  // Separate top-level and replies
  const topLevel = (comments || []).filter((c) => !c.parent_id);
  const replies = (comments || []).filter((c) => c.parent_id);

  const getReplies = (parentId: string) =>
    replies.filter((r) => r.parent_id === parentId);

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
        taskId={taskId}
        userId={userId}
        onSubmit={(content) =>
          createComment.mutateAsync({
            task_id: taskId,
            content,
            author_id: userId!,
            tenant_id: "", // filled by service via RLS
          } as Database["public"]["Tables"]["project_comments"]["Insert"])
        }
      />

      {topLevel.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum comentario ainda
        </p>
      )}

      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment as Comment}
          taskId={taskId}
          currentUserId={userId}
          replies={getReplies(comment.id) as Comment[]}
        />
      ))}
    </div>
  );
}

function CommentComposer({
  taskId,
  userId,
  onSubmit,
  parentId,
  onCancel,
  autoFocus,
}: {
  taskId: string;
  userId?: string;
  onSubmit: (content: string) => Promise<unknown>;
  parentId?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || !userId) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
      onCancel?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Responder..." : "Escreva um comentario..."}
        className="min-h-[60px] resize-none text-sm"
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape" && onCancel) {
            onCancel();
          }
        }}
      />
      <div className="flex flex-col gap-1">
        <Button
          size="icon"
          className="size-8"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
        >
          <Send className="size-3.5" />
        </Button>
        {onCancel && (
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={onCancel}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  taskId,
  currentUserId,
  replies,
}: {
  comment: Comment;
  taskId: string;
  currentUserId?: string;
  replies: Comment[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReply, setShowReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const createComment = useCreateComment();

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
      taskId,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteComment.mutateAsync({ id: comment.id, taskId });
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-7 shrink-0 mt-0.5">
        <AvatarImage src={comment.author?.avatar_url || undefined} />
        <AvatarFallback className="text-[9px]">
          {getInitials(comment.author?.full_name || null)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.author?.full_name || "Anonimo"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at!), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>

          {isOwner && (
            <div className="relative ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-10 py-1 min-w-[120px]">
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-accent"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-accent text-destructive"
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
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
              <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditContent(comment.content); }}>
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

        {!isEditing && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"
            onClick={() => setShowReply(!showReply)}
          >
            <Reply className="size-3" />
            Responder
          </button>
        )}

        {showReply && (
          <div className="mt-2">
            <CommentComposer
              taskId={taskId}
              userId={currentUserId}
              parentId={comment.id}
              autoFocus
              onCancel={() => setShowReply(false)}
              onSubmit={(content) =>
                createComment.mutateAsync({
                  task_id: taskId,
                  content,
                  author_id: currentUserId!,
                  parent_id: comment.id,
                  tenant_id: "",
                } as Database["public"]["Tables"]["project_comments"]["Insert"])
              }
            />
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-border">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                taskId={taskId}
                currentUserId={currentUserId}
                replies={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
