"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { taskKeys } from "@/lib/query/task-keys";
import { getLikes, toggleLike } from "@/features/tasks/services/task-likes";
import type { LikeTarget, Like } from "@/schemas/like";

// ─── Query ─────────────────────────────────────────────

export function useLike(targetType: LikeTarget, targetId: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id ?? "");
  const queryClient = useQueryClient();
  const queryKey = taskKeys.likes(targetType, targetId);

  const { data: likes = [] } = useQuery({
    queryKey,
    queryFn: () => getLikes(supabase, targetType, targetId),
    staleTime: 1000 * 60 * 2,
    enabled: !!targetId,
  });

  const isLiked = likes.some((l) => l.user_id === userId);
  const count = likes.length;

  // ─── Toggle mutation ──────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: () => toggleLike(supabase, userId, targetType, targetId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Like[]>(queryKey);

      // Optimistic toggle
      queryClient.setQueryData<Like[]>(queryKey, (old = []) => {
        const alreadyLiked = old.some((l) => l.user_id === userId);
        if (alreadyLiked) {
          return old.filter((l) => l.user_id !== userId);
        }
        const optimistic: Like = {
          id: `optimistic-${Date.now()}`,
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          created_at: new Date().toISOString(),
        };
        return [...old, optimistic];
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    likes,
    isLiked,
    count,
    toggle: toggleMutation.mutate,
    isPending: toggleMutation.isPending,
  };
}
