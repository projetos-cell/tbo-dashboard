"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getProjectRules,
  createProjectRule,
  updateProjectRule,
  deleteProjectRule,
} from "@/features/projects/services/project-rules";
import type { ProjectRuleInsert, ProjectRuleUpdate } from "@/features/projects/services/project-rules";

export function useProjectRules(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["project-rules", projectId],
    queryFn: () => getProjectRules(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProjectRule() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (rule: ProjectRuleInsert) => createProjectRule(supabase, rule),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-rules", variables.project_id] });
      toast({ title: "Regra criada" });
    },
    onError: () => {
      toast({ title: "Erro ao criar regra", variant: "destructive" });
    },
  });
}

export function useUpdateProjectRule(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectRuleUpdate }) =>
      updateProjectRule(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-rules", projectId] });
      toast({ title: "Regra atualizada" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar regra", variant: "destructive" });
    },
  });
}

export function useDeleteProjectRule(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteProjectRule(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-rules", projectId] });
      toast({ title: "Regra excluída" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir regra", variant: "destructive" });
    },
  });
}
