"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getHubComments,
  addHubComment,
  type HubCommentRow,
} from "../services/hub-comments";

const COMMENTS_KEY = "hub-comments";
const POSTS_KEY = "hub-posts";

export function useHubComments(postId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: [COMMENTS_KEY, postId],
    queryFn: () => getHubComments(supabase as never, postId!),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

export function useAddHubComment() {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      post_id: string;
      content: string;
      parent_id?: string;
      mentions?: string[];
    }) =>
      addHubComment(supabase as never, {
        ...params,
        tenant_id: tenantId!,
        author_id: user!.id,
      }),
    onMutate: async (params) => {
      const key = [COMMENTS_KEY, params.post_id];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HubCommentRow[]>(key);

      qc.setQueryData<HubCommentRow[]>(key, (old) => {
        if (!old) return old;
        const optimistic: HubCommentRow = {
          id: `temp-${Date.now()}`,
          post_id: params.post_id,
          tenant_id: tenantId!,
          author_id: user!.id,
          content: params.content,
          parent_id: params.parent_id ?? null,
          mentions: params.mentions ?? [],
          created_at: new Date().toISOString(),
          author_full_name:
            (user!.user_metadata?.full_name as string) ?? "Usuario",
          author_avatar_url:
            (user!.user_metadata?.avatar_url as string | null) ?? null,
        };
        return [...old, optimistic];
      });

      return { prev, key };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) {
        qc.setQueryData(ctx.key, ctx.prev);
      }
    },
    onSettled: (_data, _err, params) => {
      qc.invalidateQueries({ queryKey: [COMMENTS_KEY, params.post_id] });
      qc.invalidateQueries({ queryKey: [POSTS_KEY] });
    },
  });
}
