"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { NotificationFilters, NotificationRow } from "@/services/alerts";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/alerts";

export function useNotifications(filters?: NotificationFilters) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["notifications", userId, filters],
    queryFn: () => listNotifications(supabase, userId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && !!tenantId,
  });
}

export function useActorNames(actorIds: string[]) {
  const supabase = createClient();
  const uniqueIds = [...new Set(actorIds.filter(Boolean))];

  return useQuery({
    queryKey: ["actor-names", uniqueIds.sort().join(",")],
    queryFn: async () => {
      if (uniqueIds.length === 0)
        return new Map<string, { name: string; avatar: string | null }>();
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", uniqueIds);
      const map = new Map<string, { name: string; avatar: string | null }>();
      for (const p of data ?? []) {
        map.set(p.id, { name: p.full_name, avatar: p.avatar_url });
      }
      return map;
    },
    staleTime: 1000 * 60 * 30,
    enabled: uniqueIds.length > 0,
  });
}

// ─── Mutations with optimistic updates ───

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(supabase, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousData = queryClient.getQueriesData<NotificationRow[]>({
        queryKey: ["notifications"],
      });

      queryClient.setQueriesData<NotificationRow[]>(
        { queryKey: ["notifications"] },
        (old) =>
          old?.map((n) =>
            n.id === id
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n
          )
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      for (const [queryKey, data] of context?.previousData ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: () => markAllAsRead(supabase, userId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousData = queryClient.getQueriesData<NotificationRow[]>({
        queryKey: ["notifications"],
      });

      const now = new Date().toISOString();
      queryClient.setQueriesData<NotificationRow[]>(
        { queryKey: ["notifications"] },
        (old) => old?.map((n) => ({ ...n, read: true, read_at: now }))
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      for (const [queryKey, data] of context?.previousData ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(supabase, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousData = queryClient.getQueriesData<NotificationRow[]>({
        queryKey: ["notifications"],
      });

      queryClient.setQueriesData<NotificationRow[]>(
        { queryKey: ["notifications"] },
        (old) => old?.filter((n) => n.id !== id)
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      for (const [queryKey, data] of context?.previousData ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
