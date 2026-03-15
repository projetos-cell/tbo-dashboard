"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  searchMessages,
  searchMessagesWithFilters,
  type SearchFilters,
} from "@/features/chat/services/chat";

export type { SearchFilters };

/**
 * Basic search across all channels (uses RPC for full-text).
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
      return searchMessages(supabase, tenantId, userId, trimmed, { limit: 30 });
    },
    enabled: !!tenantId && !!userId && trimmed.length >= 2,
    staleTime: 30_000,
  });
}

/**
 * Advanced search with filters: channel scope, author, date range, type.
 * Fires when either query >= 2 chars OR a filter is active.
 */
export function useChatSearchAdvanced(query: string, filters: SearchFilters) {
  const userId = useAuthStore((s) => s.user?.id);
  const trimmed = query.trim();

  const hasFilter =
    !!filters.channelId ||
    !!filters.authorId ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.type;

  const enabled = !!userId && (trimmed.length >= 2 || hasFilter);

  return useQuery({
    queryKey: ["chat-search-advanced", trimmed, filters],
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      return searchMessagesWithFilters(supabase, trimmed, filters, { limit: 50 });
    },
    enabled,
    staleTime: 30_000,
  });
}
