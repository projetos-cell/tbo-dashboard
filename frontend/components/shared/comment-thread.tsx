"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { CommentComposer } from "./comment-thread-parts";
import { CommentItem } from "./comment-item";

interface CommentThreadProps {
  taskId: string;
  className?: string;
}

export function CommentThread({ taskId, className }: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(taskId);
  const createComment = useCreateComment();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

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
              tenant_id: tenantId!,
            } as Database["public"]["Tables"]["project_comments"]["Insert"],
          })
        }
      />

      {topLevel.length === 0 && <p className="py-4 text-center text-sm text-gray-500">Nenhum comentario ainda</p>}

      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment as Parameters<typeof CommentItem>[0]["comment"]}
          taskId={taskId}
          currentUserId={userId}
          replies={getReplies(comment.id) as Parameters<typeof CommentItem>[0]["replies"]}
        />
      ))}
    </div>
  );
}
