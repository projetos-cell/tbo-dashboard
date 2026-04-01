"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toggleHubPostLike, checkUserLikes } from "../services/hub-posts";
import type { HubPostRow } from "../services/hub-posts";

const POSTS_KEY = "hub-posts";
const LIKES_KEY = "hub-user-likes";

export function useUserLikes(postIds: string[]) {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: [LIKES_KEY, userId, ...postIds.sort()],
    queryFn: () => checkUserLikes(supabase as never, postIds, userId!),
    enabled: !!userId && postIds.length > 0,
    staleTime: 30_000,
  });
}

export function useToggleHubLike() {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      isLiked,
    }: {
      postId: string;
      isLiked: boolean;
    }) => toggleHubPostLike(supabase as never, postId, user!.id, tenantId!, isLiked),
    onMutate: async ({ postId, isLiked }) => {
      await qc.cancelQueries({ queryKey: [POSTS_KEY] });
      await qc.cancelQueries({ queryKey: [LIKES_KEY] });

      // Optimistic: update likes_count
      qc.setQueriesData<HubPostRow[]>({ queryKey: [POSTS_KEY] }, (old) =>
        old
          ? old.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likes_count: p.likes_count + (isLiked ? -1 : 1),
                  }
                : p
            )
          : old
      );

      // Optimistic: update user likes set
      qc.setQueriesData<Set<string>>({ queryKey: [LIKES_KEY] }, (old) => {
        if (!old) return old;
        const next = new Set(old);
        if (isLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [POSTS_KEY] });
      qc.invalidateQueries({ queryKey: [LIKES_KEY] });
    },
  });
}
