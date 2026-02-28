"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getProjectActivity, getTaskActivity } from "@/services/activity";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useProjectActivity(projectId: string, limit = 50) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-activity", projectId, limit],
    queryFn: () => getProjectActivity(supabase, projectId, tenantId!, limit),
    enabled: !!tenantId && !!projectId,
  });
}

export function useTaskActivity(taskId: string, limit = 30) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["task-activity", taskId, limit],
    queryFn: () => getTaskActivity(supabase, taskId, tenantId!, limit),
    enabled: !!tenantId && !!taskId,
  });
}
