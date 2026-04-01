"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getFileAnnotations,
  createFileAnnotation,
  toggleAnnotationResolved,
  deleteFileAnnotation,
} from "@/features/projects/services/file-annotations";
import type { FileAnnotationInsert } from "@/features/projects/services/file-annotations";

export function useFileAnnotations(fileId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["file-annotations", fileId],
    queryFn: () => getFileAnnotations(supabase, fileId!),
    enabled: !!fileId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateFileAnnotation(fileId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (annotation: FileAnnotationInsert) =>
      createFileAnnotation(supabase, annotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-annotations", fileId] });
      toast({ title: "Comentário adicionado" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar comentário", variant: "destructive" });
    },
  });
}

export function useToggleAnnotationResolved(fileId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      toggleAnnotationResolved(supabase, id, resolved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-annotations", fileId] });
    },
  });
}

export function useDeleteFileAnnotation(fileId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteFileAnnotation(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-annotations", fileId] });
      toast({ title: "Comentário removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover comentário", variant: "destructive" });
    },
  });
}
