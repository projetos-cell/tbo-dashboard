"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { NotificationFilters } from "@/services/alerts";
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
    queryFn: () => listNotifications(supabase, userId!, tenantId!, filters),
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
      if (uniqueIds.length === 0) return new Map<string, { name: string; avatar: string | null }>();
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

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: () => markAllAsRead(supabase, userId!, tenantId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
