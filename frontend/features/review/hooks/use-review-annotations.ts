"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getAnnotationsByVersion,
  createAnnotation,
  createReply,
  toggleResolved,
  deleteAnnotation,
} from "@/features/review/services/review-annotations";

export function useReviewAnnotations(versionId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-annotations", versionId],
    queryFn: () => getAnnotationsByVersion(supabase, versionId!),
    enabled: !!versionId && !!tenantId,
    staleTime: 30 * 1000,
  });
}

export function useCreateAnnotation(versionId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: { content: string; x_pct?: number | null; y_pct?: number | null }) =>
      createAnnotation(supabase, {
        ...input,
        version_id: versionId,
        tenant_id: tenantId!,
        author_id: user?.id ?? "",
        author_name: user?.user_metadata?.full_name ?? user?.email ?? "",
        author_avatar_url: user?.user_metadata?.avatar_url ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-annotations", versionId] });
      toast({ title: "Comentário adicionado" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar comentário", variant: "destructive" });
    },
  });
}

export function useCreateReply(versionId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: { parent_id: string; content: string }) =>
      createReply(supabase, {
        ...input,
        version_id: versionId,
        tenant_id: tenantId!,
        author_id: user?.id ?? "",
        author_name: user?.user_metadata?.full_name ?? user?.email ?? "",
        author_avatar_url: user?.user_metadata?.avatar_url ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-annotations", versionId] });
    },
    onError: () => {
      toast({ title: "Erro ao responder comentário", variant: "destructive" });
    },
  });
}

export function useToggleResolved(versionId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      toggleResolved(supabase, id, resolved, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-annotations", versionId] });
    },
  });
}

export function useDeleteAnnotation(versionId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAnnotation(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-annotations", versionId] });
      toast({ title: "Comentário removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover comentário", variant: "destructive" });
    },
  });
}
