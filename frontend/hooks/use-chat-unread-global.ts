"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { getUnreadCounts } from "@/features/chat/services/chat";

/**
 * Global hook that polls chat unread counts every 30s.
 * Runs in the auth layout so the sidebar badge works on ANY page.
 * Syncs data into Zustand so `useChatStore.totalUnread()` is always fresh.
 */
export function useChatUnreadGlobal() {
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);

  const { data } = useQuery({
    queryKey: ["chat-unread-counts", userId, tenantId],
    queryFn: async () => {
      if (!userId || !tenantId) return {};
      const supabase = createClient();
      return getUnreadCounts(supabase, userId, tenantId);
    },
    enabled: !!userId && !!tenantId,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (data) {
      setUnreadCounts(data);
    }
  }, [data, setUnreadCounts]);
}
