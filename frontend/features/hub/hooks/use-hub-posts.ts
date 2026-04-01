"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getHubPosts,
  createHubPost,
  deleteHubPost,
  type GetHubPostsParams,
  type HubPostRow,
} from "../services/hub-posts";

const POSTS_KEY = "hub-posts";

export function useHubPosts(params: GetHubPostsParams = {}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: [POSTS_KEY, tenantId, params.channel, params.search, params.offset],
    queryFn: () => getHubPosts(supabase as never, params),
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useCreateHubPost() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (post: {
      title?: string;
      body: string;
      channel: HubPostRow["channel"];
      cover_url?: string;
    }) =>
      createHubPost(supabase as never, {
        ...post,
        tenant_id: tenantId!,
        author_id: user!.id,
      }),
    onMutate: async (newPost) => {
      await qc.cancelQueries({ queryKey: [POSTS_KEY] });
      const prev = qc.getQueriesData({ queryKey: [POSTS_KEY] });

      // Optimistic: prepend a fake row
      qc.setQueriesData<HubPostRow[]>({ queryKey: [POSTS_KEY] }, (old) => {
        if (!old) return old;
        const optimistic: HubPostRow = {
          id: `temp-${Date.now()}`,
          tenant_id: tenantId!,
          author_id: user!.id,
          title: newPost.title ?? null,
          body: newPost.body,
          channel: newPost.channel,
          cover_url: newPost.cover_url ?? null,
          is_pinned: false,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_full_name:
            (user!.user_metadata?.full_name as string) ?? "Usuario",
          author_avatar_url:
            (user!.user_metadata?.avatar_url as string | null) ?? null,
          author_role: (user!.user_metadata?.role as string | null) ?? null,
        };
        return [optimistic, ...old];
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [POSTS_KEY] });
    },
  });
}

export function useDeleteHubPost() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHubPost(supabase as never, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [POSTS_KEY] });
      const prev = qc.getQueriesData({ queryKey: [POSTS_KEY] });

      qc.setQueriesData<HubPostRow[]>({ queryKey: [POSTS_KEY] }, (old) =>
        old ? old.filter((p) => p.id !== id) : old
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [POSTS_KEY] });
    },
  });
}
