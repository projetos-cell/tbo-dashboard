"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime for portal-relevant tables:
 * - os_tasks (project tasks)
 * - project_files (files)
 * - portal_comments (comments)
 *
 * Invalidates the corresponding React Query caches on change.
 */
export function usePortalRealtime(projectId: string, tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId || !projectId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`portal-sync-${projectId}`)
      // Tasks changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "os_tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["portal-tasks", projectId],
          });
        }
      )
      // Project files changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_files",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["portal-files", tenantId, projectId],
          });
          queryClient.invalidateQueries({
            queryKey: ["portal-project-files", projectId],
          });
        }
      )
      // Portal comments changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portal_comments",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["portal-comments", tenantId, projectId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, tenantId, queryClient]);
}
