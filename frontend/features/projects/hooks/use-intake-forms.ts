"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getIntakeForm,
  createIntakeForm,
  updateIntakeForm,
  deleteIntakeForm,
} from "@/features/projects/services/intake-forms";
import type { IntakeFormRow } from "@/features/projects/services/intake-forms";

type IntakeFormInsert = Partial<IntakeFormRow> & { project_id: string; tenant_id: string; title: string; token: string };
type IntakeFormUpdate = Partial<IntakeFormRow>;

export function useIntakeForm(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["intake-form", projectId],
    queryFn: () => getIntakeForm(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateIntakeForm() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (form: IntakeFormInsert) => createIntakeForm(supabase, form),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["intake-form", variables.project_id] });
      toast({ title: "Formulário de intake criado" });
    },
    onError: () => {
      toast({ title: "Erro ao criar formulário", variant: "destructive" });
    },
  });
}

export function useUpdateIntakeForm() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeFormUpdate }) =>
      updateIntakeForm(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intake-form"] });
      toast({ title: "Formulário atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar formulário", variant: "destructive" });
    },
  });
}

export function useDeleteIntakeForm() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteIntakeForm(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intake-form"] });
      toast({ title: "Formulário excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir formulário", variant: "destructive" });
    },
  });
}
