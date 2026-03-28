"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconMessageCircle,
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconPencil,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useTaskComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "../hooks/use-task-advanced";
import type { TaskComment } from "../hooks/use-task-advanced";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface CommentItemProps {
  comment: TaskComment;
  currentUserId: string | undefined;
  onReply: (id: string, content: string) => void;
  taskId: string;
}

function CommentItem({ comment, currentUserId, onReply, taskId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const isAuthor = comment.author_id === currentUserId;

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    updateComment.mutate(
      { id: comment.id, content: editContent.trim() },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent.trim());
    setReplyContent("");
    setShowReply(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.author?.avatar_url ?? undefined} />
        <AvatarFallback className="text-[10px]">
          {getInitials(comment.author?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">
            {comment.author?.full_name ?? "Usuário"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
          {comment.is_edited && (
            <span className="text-[10px] text-muted-foreground italic">(editado)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1.5 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] text-xs"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSaveEdit}
                disabled={updateComment.isPending}
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconCornerDownRight size={11} />
              Responder
            </button>
          </div>
        )}

        {showReply && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escrever resposta..."
              className="min-h-[60px] text-xs"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleReply}>
                Responder
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowReply(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {isAuthor && !isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="self-start mt-0.5 text-muted-foreground hover:text-foreground transition-colors">
              <IconDots size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => setIsEditing(true)}
              className="text-xs gap-2"
            >
              <IconEdit size={12} />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteComment.mutate(comment.id)}
              className="text-xs gap-2 text-destructive focus:text-destructive"
            >
              <IconTrash size={12} />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface TaskCommentsSectionProps {
  taskId: string;
}

export function TaskCommentsSection({ taskId }: TaskCommentsSectionProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: comments, isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment(taskId);
  const [newContent, setNewContent] = useState("");

  const topLevelComments = (comments ?? []).filter((c) => !c.parent_id);
  const replies = (comments ?? []).filter((c) => c.parent_id);
  const getReplies = (parentId: string) => replies.filter((r) => r.parent_id === parentId);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    createComment.mutate(
      { content: newContent.trim() },
      { onSuccess: () => setNewContent("") },
    );
  };

  const handleReply = (parentId: string, content: string) => {
    createComment.mutate({ content, parent_id: parentId });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconMessageCircle size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Comentários</h3>
        {comments && comments.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{comments.length}</span>
        )}
      </div>

      {/* Comment input */}
      <div className="space-y-2">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Adicionar comentário... (use @nome para mencionar)"
          className="min-h-[80px] text-xs resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">⌘+Enter para enviar</span>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSubmit}
            disabled={!newContent.trim() || createComment.isPending || !userId}
          >
            <IconPencil size={12} className="mr-1.5" />
            Comentar
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {topLevelComments.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            {topLevelComments.map((comment: TaskComment) => (
              <div key={comment.id} className="space-y-3">
                <CommentItem
                  comment={comment}
                  currentUserId={userId}
                  onReply={handleReply}
                  taskId={taskId}
                />
                {getReplies(comment.id).map((reply: TaskComment) => (
                  <div key={reply.id} className="ml-10">
                    <CommentItem
                      comment={reply}
                      currentUserId={userId}
                      onReply={handleReply}
                      taskId={taskId}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {comments?.length === 0 && (
        <div className="rounded-md border border-dashed py-6 text-center">
          <IconMessageCircle size={20} className="mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-xs text-muted-foreground">Nenhum comentário ainda</p>
        </div>
      )}
    </div>
  );
}
