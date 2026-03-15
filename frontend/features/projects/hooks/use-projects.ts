"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProjects,
  getProjectById,
  getProjectDemands,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
  generateProjectCode,
} from "@/features/projects/services/projects";
import { logAuditTrail } from "@/lib/audit-trail";
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
    queryFn: () => getProjects(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useProject(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(supabase, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function useProjectDemands(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-demands", projectId],
    queryFn: () => getProjectDemands(supabase, projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!projectId,
  });
}

export function useCreateProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

  return useMutation({
    mutationFn: async (project: Database["public"]["Tables"]["projects"]["Insert"]) => {
      if (!project.code) {
        const code = await generateProjectCode(supabase);
        project = { ...project, code };
      }
      return createProject(supabase, project);
    },

    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueriesData<ProjectRow[]>({ queryKey: ["projects"] });
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueriesData<ProjectRow[]>(
        { queryKey: ["projects"] },
        (old) =>
          old
            ? [
                ...old,
                {
                  ...newProject,
                  id: tempId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as unknown as ProjectRow,
              ]
            : old
      );
      return { previousProjects };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousProjects) {
        for (const [queryKey, data] of context.previousProjects) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["projects"]["Update"];
    }) => updateProject(supabase, id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      await queryClient.cancelQueries({ queryKey: ["project", id] });

      const previousProjects = queryClient.getQueriesData<ProjectRow[]>({ queryKey: ["projects"] });
      const previousProject = queryClient.getQueryData<ProjectRow>(["project", id]);

      queryClient.setQueriesData<ProjectRow[]>(
        { queryKey: ["projects"] },
        (old) =>
          old?.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      if (previousProject) {
        queryClient.setQueryData<ProjectRow>(["project", id], {
          ...previousProject,
          ...updates,
        });
      }

      return { previousProjects, previousProject };
    },

    onError: (_err, variables, context) => {
      if (context?.previousProjects) {
        for (const [queryKey, data] of context.previousProjects) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousProject) {
        queryClient.setQueryData(["project", variables.id], context.previousProject);
      }
    },

    onSuccess: (_data, variables) => {
      const action = variables.updates.status ? "status_change" : "update";
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action,
        table: "projects",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useProjectStats(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: () => getProjectStats(supabase, projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!projectId,
  });
}

export function useDeleteProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

  return useMutation({
    mutationFn: (id: string) => deleteProject(supabase, id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueriesData<ProjectRow[]>({ queryKey: ["projects"] });
      queryClient.setQueriesData<ProjectRow[]>(
        { queryKey: ["projects"] },
        (old) => old?.filter((p) => p.id !== id)
      );
      return { previousProjects };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousProjects) {
        for (const [queryKey, data] of context.previousProjects) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSuccess: (_data, id) => {
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "projects",
        recordId: id,
        before: { id },
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
