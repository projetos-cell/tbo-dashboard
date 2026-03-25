"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconCornerDownRight,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/shared/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[80px] animate-pulse rounded-md bg-muted" /> }
);
import { useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/use-comments";
import { LikeButton } from "@/features/tasks/components/like-button";
import { CommentReactions } from "@/features/tasks/components/comment-reactions";
import type { Database } from "@/lib/supabase/types";
import { CommentComposer, type Comment, getInitials } from "./comment-thread-parts";

export function CommentItem({
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
    await updateComment.mutateAsync({ id: comment.id, content: trimmed, taskId });
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
            {formatDistanceToNow(new Date(comment.created_at!), { addSuffix: true, locale: ptBR })}
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
                <IconDots className="size-3.5" />
              </Button>
              {showMenu && (
                <div className="absolute top-full right-0 z-10 mt-1 min-w-[120px] rounded-md border bg-white py-1 shadow-md">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  >
                    <IconPencil className="size-3.5" /> Editar
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-gray-100"
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                  >
                    <IconTrash className="size-3.5" /> Excluir
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
              onSubmit={(html) => { setEditContent(html); handleSaveEdit(); }}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditContent(comment.content); }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
            </div>
          </div>
        ) : (
          <div
            className="mt-0.5 text-sm text-gray-500 prose prose-sm dark:prose-invert max-w-none [&_p]:my-0.5"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        )}

        {!isEditing && (
          <div className="mt-1.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                onClick={() => setShowReply(!showReply)}
              >
                <IconCornerDownRight className="size-3" /> Responder
              </button>
              <LikeButton targetType="comment" targetId={comment.id} size="xs" />
            </div>
            <CommentReactions commentId={comment.id} />
          </div>
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
