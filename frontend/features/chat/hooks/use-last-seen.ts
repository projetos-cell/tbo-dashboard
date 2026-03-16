"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { getLastSeen, formatLastSeen } from "@/features/chat/services/chat-dnd";

/**
 * Returns last seen info for a list of user IDs.
 * Stale after 2 minutes — presence is real-time via Realtime, this is fallback.
 */
export function useLastSeen(userIds: string[]) {
  const supabase = createClient();
  const sortedIds = [...userIds].sort().join(",");

  return useQuery({
    queryKey: ["last-seen", sortedIds],
    queryFn: () => getLastSeen(supabase, userIds),
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 2,
    select: (data) => {
      const map = new Map<string, string | null>();
      for (const item of data) {
        map.set(item.userId, item.lastSeenAt);
      }
      return map;
    },
  });
}

/**
 * For a single user: returns their presence label.
 * If online → "Online"
 * If offline → formatted last seen (e.g., "há 5 min")
 */
export function useUserPresenceLabel(userId: string): string {
  const isOnline = useChatStore((s) => s.isOnline(userId));
  const { data: lastSeenMap } = useLastSeen([userId]);

  if (isOnline) return "Online";

  const lastSeenAt = lastSeenMap?.get(userId) ?? null;
  return formatLastSeen(lastSeenAt);
}
