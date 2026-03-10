"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getActorName } from "@/services/alerts";
import { notifyOnComment } from "@/services/notification-triggers";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/services/comments";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useComments(taskId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(supabase, taskId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!taskId,
  });
}

/**
 * Extracts user IDs from mention patterns in comment content.
 * Supports: @{uuid} or @[Name](uuid)
 */
function extractMentionIds(content: string): string[] {
  const ids: string[] = [];
  // Pattern: @{uuid}
  const uuidPattern = /@\{([0-9a-f-]{36})\}/gi;
  let match;
  while ((match = uuidPattern.exec(content)) !== null) {
    ids.push(match[1]);
  }
  // Pattern: @[Name](uuid)
  const namedPattern = /@\[.+?\]\(([0-9a-f-]{36})\)/gi;
  while ((match = namedPattern.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

export function useCreateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      params: {
        comment: Database["public"]["Tables"]["project_comments"]["Insert"];
        taskTitle?: string;
        mentionedUserIds?: string[];
      }
    ) => createComment(supabase, params.comment),
    onSuccess: async (createdComment, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.comment.task_id],
      });

      // ─── Notification triggers (fire-and-forget) ───
      const userId = useAuthStore.getState().user?.id;
      const tenantId = useAuthStore.getState().tenantId;
      if (!userId || !tenantId || !variables.comment.task_id) return;

      try {
        const actorName = await getActorName(supabase, userId);
        // Extract mentions from content or use provided list
        const mentionedIds =
          variables.mentionedUserIds ??
          extractMentionIds(variables.comment.content ?? "");

        await notifyOnComment(supabase, {
          tenantId,
          actorId: userId,
          actorName,
          taskId: variables.comment.task_id,
          taskTitle: variables.taskTitle ?? "Tarefa",
          commentId: createdComment.id,
          commentContent: createdComment.content ?? "",
          mentionedUserIds: mentionedIds,
        });
      } catch {
        // Notification errors should never block the main flow
      }
    },
  });
}

export function useUpdateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
    }: {
      id: string;
      content: string;
      taskId: string;
    }) => updateComment(supabase, id, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
}

export function useDeleteComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      deleteComment(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
}
