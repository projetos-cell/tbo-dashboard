"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getScenesByProject,
  getScene,
  createScene,
  updateScene,
  deleteScene,
  reorderScenes,
} from "@/features/review/services/review-scenes";
import type { CreateReviewSceneInput, UpdateReviewSceneInput } from "@/features/review/schemas/review-scene.schema";

export function useReviewScenes(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-scenes", projectId],
    queryFn: () => getScenesByProject(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviewScene(sceneId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-scene", sceneId],
    queryFn: () => getScene(supabase, sceneId!),
    enabled: !!sceneId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateScene(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (input: CreateReviewSceneInput) =>
      createScene(supabase, {
        ...input,
        project_id: projectId,
        tenant_id: tenantId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-scenes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["review-project", projectId] });
      toast({ title: "Cena adicionada" });
    },
    onError: () => {
      toast({ title: "Erro ao criar cena", variant: "destructive" });
    },
  });
}

export function useUpdateScene(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateReviewSceneInput }) =>
      updateScene(supabase, id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["review-scenes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["review-scene", data.id] });
      toast({ title: "Cena atualizada" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar cena", variant: "destructive" });
    },
  });
}

export function useDeleteScene(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteScene(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-scenes", projectId] });
      toast({ title: "Cena removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover cena", variant: "destructive" });
    },
  });
}

export function useReorderScenes(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; sort_order: number }>) =>
      reorderScenes(supabase, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-scenes", projectId] });
    },
    onError: () => {
      toast({ title: "Erro ao reordenar cenas", variant: "destructive" });
    },
  });
}
