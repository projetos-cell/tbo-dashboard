"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProjectStatusUpdates,
  createProjectStatusUpdate,
  deleteProjectStatusUpdate,
} from "@/features/projects/services/project-status-updates";

function useSupabase() {
  return createClient();
}

export function useProjectStatusUpdates(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["project-status-updates", projectId],
    queryFn: () => getProjectStatusUpdates(supabase, projectId),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && !!projectId,
  });
}

export function useCreateProjectStatusUpdate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      project_id: string;
      tenant_id: string;
      author_id: string;
      author_name: string;
      health: string;
      content: string;
    }) => createProjectStatusUpdate(supabase, params),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["project-status-updates", vars.project_id] });
    },
  });
}

export function useDeleteProjectStatusUpdate(projectId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProjectStatusUpdate(supabase, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-status-updates", projectId] });
    },
  });
}
