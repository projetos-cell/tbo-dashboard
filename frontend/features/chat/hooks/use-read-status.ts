"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { updateLastRead, getUnreadCounts } from "@/features/chat/services/chat";

export function useMarkAsRead() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      userId,
    }: {
      channelId: string;
      userId: string;
    }) => updateLastRead(supabase, channelId, userId),
    onMutate: ({ channelId }) => {
      useChatStore.getState().clearUnread(channelId);

      qc.setQueriesData<Record<string, number>>(
        { queryKey: ["chat-unread-counts"] },
        (old) => {
          if (!old) return old;
          return { ...old, [channelId]: 0 };
        },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-unread-counts"] });
    },
  });
}

export function useUnreadCounts() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-unread-counts", userId, tenantId],
    queryFn: () => getUnreadCounts(supabase, userId!, tenantId!),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    enabled: !!userId && !!tenantId,
  });
}
