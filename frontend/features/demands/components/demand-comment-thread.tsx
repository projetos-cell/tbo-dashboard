"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useDemandComments,
  useCreateDemandComment,
} from "@/features/demands/hooks/use-demand-comments";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { DemandCommentComposer } from "./demand-comment-composer";
import { DemandCommentItem } from "./demand-comment-item";

interface DemandCommentThreadProps {
  demandId: string;
  className?: string;
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

  const handleSubmit = async (content: string) => {
    if (!userId || !tenantId) return;
    await createComment.mutateAsync({
      demand_id: demandId,
      content,
      author_id: userId,
      tenant_id: tenantId,
      mentions: [],
    } as Database["public"]["Tables"]["demand_comments"]["Insert"]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <DemandCommentComposer onSubmit={handleSubmit} disabled={!userId} />

      {(!comments || comments.length === 0) && (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum comentario ainda
        </p>
      )}

      {(comments ?? []).map((comment) => (
        <DemandCommentItem
          key={comment.id}
          comment={comment}
          demandId={demandId}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}
