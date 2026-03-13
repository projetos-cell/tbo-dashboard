"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, MoreHorizontal, Pencil, Trash2, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { useMentionProvider } from "@/features/tasks/hooks/use-mention-provider";
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/use-comments";
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

  const getReplies = (parentId: string) => replies.filter((r) => r.parent_id === parentId);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
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
            comment: {
              task_id: taskId,
              content,
              author_id: userId!,
              tenant_id: "",
            } as Database["public"]["Tables"]["project_comments"]["Insert"],
          })
        }
      />

      {topLevel.length === 0 && <p className="py-4 text-center text-sm text-gray-500">Nenhum comentario ainda</p>}

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
  taskId: _taskId, // eslint-disable-line @typescript-eslint/no-unused-vars
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
  const mentionProvider = useMentionProvider();

  const handleSubmit = async (html?: string) => {
    const value = html || content;
    const clean = value === "<p></p>" ? "" : value.trim();
    if (!clean || !userId) return;
    setSubmitting(true);
    try {
      await onSubmit(clean);
      setContent("");
      onCancel?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder={parentId ? "Responder..." : "Escreva um comentario..."}
          minimal
          toolbar={false}
          mentionProvider={mentionProvider}
          autoFocus={autoFocus}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="icon"
          className="size-8"
          onClick={() => handleSubmit()}
          disabled={(!content.trim() || content === "<p></p>") || submitting}
          aria-label="Enviar comentario"
        >
          <Send className="size-3.5" />
        </Button>
        {onCancel && (
          <Button size="icon" variant="ghost" className="size-8" onClick={onCancel} aria-label="Cancelar">
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
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarImage src={comment.author?.avatar_url || undefined} />
        <AvatarFallback className="text-[9px]">{getInitials(comment.author?.full_name || null)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.author?.full_name || "Anonimo"}</span>
          <span className="text-xs text-gray-500">
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
                aria-label="Acoes"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
              {showMenu && (
                <div className="absolute top-full right-0 z-10 mt-1 min-w-[120px] rounded-md border bg-white py-1 shadow-md">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-gray-100"
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
            <RichTextEditor
              content={editContent}
              onChange={setEditContent}
              minimal
              toolbar={false}
              autoFocus
              onSubmit={(html) => {
                setEditContent(html);
                handleSaveEdit();
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
          <div
            className="mt-0.5 text-sm text-gray-500 prose prose-sm dark:prose-invert max-w-none [&_p]:my-0.5"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        )}

        {!isEditing && (
          <button
            className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
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
                  comment: {
                    task_id: taskId,
                    content,
                    author_id: currentUserId!,
                    parent_id: comment.id,
                    tenant_id: "",
                  } as Database["public"]["Tables"]["project_comments"]["Insert"],
                })
              }
            />
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-gray-200 pl-2">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} taskId={taskId} currentUserId={currentUserId} replies={[]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
