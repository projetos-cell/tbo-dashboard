"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getReviewProjects,
  getReviewProject,
  getReviewProjectsByProject,
  createReviewProject,
  updateReviewProject,
  deleteReviewProject,
} from "@/features/review/services/review-projects";
import type { CreateReviewProjectInput, UpdateReviewProjectInput } from "@/features/review/schemas/review-project.schema";

export function useReviewProjects() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-projects", tenantId],
    queryFn: () => getReviewProjects(supabase),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviewProject(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-project", projectId],
    queryFn: () => getReviewProject(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviewProjectsByProject(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-projects-by-project", projectId, tenantId],
    queryFn: () => getReviewProjectsByProject(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateReviewProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateReviewProjectInput) =>
      createReviewProject(supabase, {
        ...input,
        tenant_id: tenantId!,
        created_by: userId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-projects", tenantId] });
      toast({ title: "Projeto de review criado" });
    },
    onError: () => {
      toast({ title: "Erro ao criar projeto", variant: "destructive" });
    },
  });
}

export function useUpdateReviewProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateReviewProjectInput }) =>
      updateReviewProject(supabase, id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["review-projects", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["review-project", data.id] });
      toast({ title: "Projeto atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar projeto", variant: "destructive" });
    },
  });
}

export function useDeleteReviewProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => deleteReviewProject(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-projects", tenantId] });
      toast({ title: "Projeto removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover projeto", variant: "destructive" });
    },
  });
}
