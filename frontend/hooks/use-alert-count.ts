"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Returns the count of unread notifications for the current user.
 * Used by the sidebar Alertas badge. Polls every 60s.
 */
export function useAlertCount(): number {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data } = useQuery({
    queryKey: ["notifications-unread-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("tenant_id", tenantId!)
        .eq("read", false);

      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    enabled: !!userId && !!tenantId,
  });

  return data ?? 0;
}
