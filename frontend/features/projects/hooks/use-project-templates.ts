"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  applyProjectTemplate,
  saveProjectAsTemplate,
  getSavedTemplates,
  updateSavedTemplate,
  deleteSavedTemplate,
  PROJECT_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  type TemplateSection,
} from "@/features/projects/services/project-templates";

export { PROJECT_TEMPLATES, DEFAULT_TEMPLATE_ID };

export function useApplyProjectTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      tenantId,
      templateId = DEFAULT_TEMPLATE_ID,
    }: {
      projectId: string;
      tenantId: string;
      templateId?: string;
    }) => applyProjectTemplate(projectId, tenantId, templateId),

    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast({ title: "Template aplicado com sucesso!" });
    },

    onError: () => {
      toast({
        title: "Erro ao aplicar template",
        description: "As seções e tarefas não foram criadas.",
        variant: "destructive",
      });
    },
  });
}

export function useSavedTemplates() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["saved-templates", tenantId],
    queryFn: () => getSavedTemplates(tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSaveProjectAsTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      tenantId,
      name,
      description,
    }: {
      projectId: string;
      tenantId: string;
      name: string;
      description?: string;
    }) => saveProjectAsTemplate(projectId, tenantId, name, description),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-templates"] });
      toast({ title: "Projeto salvo como template" });
    },

    onError: () => {
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar a estrutura do projeto.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSavedTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; description?: string | null; sections_json?: TemplateSection[] };
    }) => updateSavedTemplate(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-templates"] });
      toast({ title: "Template atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar template", variant: "destructive" });
    },
  });
}

export function useDeleteSavedTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteSavedTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-templates"] });
      toast({ title: "Template excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir template", variant: "destructive" });
    },
  });
}
