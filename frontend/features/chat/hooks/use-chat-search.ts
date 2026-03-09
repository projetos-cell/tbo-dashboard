"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { searchMessages } from "@/features/chat/services/chat";

/**
 * Search messages across all channels the user has access to.
 * Only fires when `query` has >= 2 characters.
 */
export function useChatSearch(query: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["chat-search", tenantId, trimmed],
    queryFn: async () => {
      if (!tenantId || !userId) return [];
      const supabase = createClient();
      return searchMessages(supabase, tenantId, userId, trimmed, {
        limit: 30,
      });
    },
    enabled: !!tenantId && !!userId && trimmed.length >= 2,
    staleTime: 30_000,
  });
}
