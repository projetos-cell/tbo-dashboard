"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getShareLinks,
  createShareLink,
  toggleShareLink,
} from "@/features/review/services/review-share";
import type { SharePermission } from "@/features/review/types";

export function useShareLinks(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-share-links", projectId],
    queryFn: () => getShareLinks(supabase, projectId!),
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateShareLink(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: {
      reviewer_name?: string;
      reviewer_email?: string;
      permissions: SharePermission;
      expires_at?: string | null;
    }) =>
      createShareLink(supabase, {
        ...input,
        project_id: projectId,
        tenant_id: tenantId!,
        created_by: userId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-share-links", projectId] });
      toast({ title: "Link de compartilhamento criado" });
    },
    onError: () => {
      toast({ title: "Erro ao criar link", variant: "destructive" });
    },
  });
}

export function useToggleShareLink(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleShareLink(supabase, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-share-links", projectId] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar link", variant: "destructive" });
    },
  });
}
