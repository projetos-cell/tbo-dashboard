"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProjectResources,
  createProjectResource,
  deleteProjectResource,
  type CreateResourceParams,
} from "@/features/projects/services/project-resources";

function useSupabase() {
  return createClient();
}

export function useProjectResources(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["project-resources", projectId],
    queryFn: () => getProjectResources(supabase, projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!projectId,
  });
}

export function useCreateProjectResource() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateResourceParams) =>
      createProjectResource(supabase, params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-resources", variables.project_id],
      });
    },
  });
}

export function useDeleteProjectResource(projectId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) =>
      deleteProjectResource(supabase, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-resources", projectId],
      });
    },
  });
}
