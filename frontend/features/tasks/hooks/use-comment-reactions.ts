"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCommentReactions,
  toggleReaction,
  type ReactionGroup,
} from "@/features/tasks/services/comment-reactions";

export function useCommentReactions(commentId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["comment-reactions", commentId],
    queryFn: () => getCommentReactions(supabase, commentId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!commentId,
  });
}

export function useToggleReaction() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => {
      if (!userId || !tenantId) throw new Error("Not authenticated");
      return toggleReaction(supabase, commentId, userId, emoji, tenantId);
    },

    onMutate: async ({ commentId, emoji }) => {
      await queryClient.cancelQueries({
        queryKey: ["comment-reactions", commentId],
      });

      const previous = queryClient.getQueryData<ReactionGroup[]>([
        "comment-reactions",
        commentId,
      ]);

      // Optimistic update
      queryClient.setQueryData<ReactionGroup[]>(
        ["comment-reactions", commentId],
        (old) => {
          if (!old || !userId) return old;
          const existing = old.find((g) => g.emoji === emoji);

          if (existing?.user_ids.includes(userId)) {
            // Remove
            const newUserIds = existing.user_ids.filter((id) => id !== userId);
            if (newUserIds.length === 0) {
              return old.filter((g) => g.emoji !== emoji);
            }
            return old.map((g) =>
              g.emoji === emoji
                ? { ...g, count: newUserIds.length, user_ids: newUserIds }
                : g,
            );
          }

          // Add
          if (existing) {
            return old.map((g) =>
              g.emoji === emoji
                ? {
                    ...g,
                    count: g.count + 1,
                    user_ids: [...g.user_ids, userId],
                  }
                : g,
            );
          }
          return [...old, { emoji, count: 1, user_ids: [userId] }];
        },
      );

      return { previous, commentId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["comment-reactions", context.commentId],
          context.previous,
        );
      }
    },

    onSettled: (_data, _err, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comment-reactions", commentId],
      });
    },
  });
}
