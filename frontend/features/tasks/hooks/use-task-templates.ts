"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getTaskTemplates,
  createTaskTemplate,
  deleteTaskTemplate,
  type TaskTemplate,
} from "@/features/tasks/services/task-templates";

export function useTaskTemplates() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<TaskTemplate[]>({
    queryKey: ["task-templates", tenantId],
    queryFn: () => getTaskTemplates(tenantId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

export function useSaveTaskAsTemplate() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      title: string;
      description?: string | null;
      subtasks?: { title: string; priority?: string }[];
      priority?: string | null;
      estimated_hours?: number | null;
    }) =>
      createTaskTemplate({
        tenant_id: tenantId!,
        title: params.title,
        description: params.description,
        subtasks_json: params.subtasks ?? [],
        priority: params.priority,
        estimated_hours: params.estimated_hours,
        created_by: userId,
      }),
    onSuccess: (template) => {
      toast({ title: `Template salvo — "${template.title}"` });
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar template",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: () => {
      toast({ title: "Template excluído" });
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir template",
        variant: "destructive",
      });
    },
  });
}
