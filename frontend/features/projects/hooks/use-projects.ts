"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProjects,
  getProjectById,
  getProjectDemands,
  getProjectStats,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  createProject,
  updateProject,
  deleteProject,
  generateProjectCode,
  formatProjectName,
} from "@/features/projects/services/projects";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import { createProjectDriveFolder } from "@/features/projects/services/google-drive";
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
      // Auto-format name: CONSTRUTORA_EMPREENDIMENTO
      if (project.name) {
        project = {
          ...project,
          name: formatProjectName(project.name, project.construtora),
        };
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

    onSuccess: (data) => {
      // Auto-create Google Drive folder structure after project creation
      if (data?.id && data?.name) {
        createProjectDriveFolder(data.id, data.name).catch(() => {
          // Non-blocking — folder creation failure shouldn't break project creation
        });
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

  const mutation = useMutation({
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

    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        for (const [queryKey, data] of context.previousProjects) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousProject) {
        queryClient.setQueryData(["project", variables.id], context.previousProject);
      }
      toast.error(`Erro ao atualizar projeto: ${err.message}`, {
        action: {
          label: "Tentar novamente",
          onClick: () => mutation.mutate(variables),
        },
      });
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
  return mutation;
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

// ── Project Members ──────────────────────────────────────────────────────────

export function useProjectMembers(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembers(supabase, projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!projectId,
  });
}

export function useAddProjectMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { projectId: string; userId: string; tenantId: string; grantedBy: string }) =>
      addProjectMember(supabase, params),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
    },
  });
}

export function useRemoveProjectMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipId, projectId }: { membershipId: string; projectId: string }) =>
      removeProjectMember(supabase, membershipId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
    },
  });
}

export function useDeleteProject() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

  const mutation = useMutation({
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

    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        for (const [queryKey, data] of context.previousProjects) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(`Erro ao deletar projeto: ${err.message}`, {
        action: {
          label: "Tentar novamente",
          onClick: () => mutation.mutate(variables),
        },
      });
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
  return mutation;
}
