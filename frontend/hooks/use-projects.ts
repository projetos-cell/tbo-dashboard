"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProjects,
  getProjectById,
  getProjectDemands,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projects";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useProjects() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["projects", tenantId],
    queryFn: () => getProjects(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useProject(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(supabase, id, tenantId!),
    enabled: !!tenantId && !!id,
  });
}

export function useProjectDemands(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-demands", projectId],
    queryFn: () => getProjectDemands(supabase, projectId, tenantId!),
    enabled: !!tenantId && !!projectId,
  });
}

export function useCreateProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Database["public"]["Tables"]["projects"]["Insert"]) =>
      createProject(supabase, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["projects"]["Update"];
    }) => updateProject(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useDeleteProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
