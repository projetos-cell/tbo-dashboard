"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getFavoriteChannelIds,
  addFavoriteChannel,
  removeFavoriteChannel,
} from "../services/chat-channel-favorites";
import { toast } from "sonner";

export function useChannelFavorites() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  const qk = ["chat-channel-favorites", userId] as const;

  const query = useQuery({
    queryKey: qk,
    queryFn: () => getFavoriteChannelIds(supabase, userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const favoriteIds = new Set(query.data ?? []);

  const addMut = useMutation({
    mutationFn: (channelId: string) =>
      addFavoriteChannel(supabase, userId!, channelId),
    onMutate: async (channelId) => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<string[]>(qk);
      qc.setQueryData(qk, (old: string[] = []) => [...old, channelId]);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk, ctx.prev);
      toast.error("Erro ao favoritar canal");
    },
  });

  const removeMut = useMutation({
    mutationFn: (channelId: string) =>
      removeFavoriteChannel(supabase, userId!, channelId),
    onMutate: async (channelId) => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<string[]>(qk);
      qc.setQueryData(qk, (old: string[] = []) =>
        old.filter((id) => id !== channelId),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk, ctx.prev);
      toast.error("Erro ao remover favorito");
    },
  });

  return {
    favoriteIds,
    isFavorite: (channelId: string) => favoriteIds.has(channelId),
    toggleFavorite: (channelId: string) => {
      if (favoriteIds.has(channelId)) {
        removeMut.mutate(channelId);
      } else {
        addMut.mutate(channelId);
      }
    },
  };
}
