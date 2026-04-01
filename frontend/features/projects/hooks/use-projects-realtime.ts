"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Subscribes to Supabase Realtime changes on the projects table.
 * Invalidates the projects query cache when any insert/update/delete occurs.
 */
export function useProjectsRealtime() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          // Invalidate list queries
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          queryClient.invalidateQueries({ queryKey: ["projects-paginated"] });

          // If update/delete, also invalidate specific project cache
          if (payload.eventType !== "INSERT" && payload.old) {
            const id = (payload.old as { id?: string }).id;
            if (id) {
              queryClient.invalidateQueries({ queryKey: ["project", id] });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}
