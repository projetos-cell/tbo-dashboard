"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getVersionsByScene,
  getVersion,
  createVersion,
  updateVersionStatus,
  uploadVersionFile,
} from "@/features/review/services/review-versions";
import type { ReviewVersionStatus } from "@/features/review/types";
import { validateVersionFile } from "@/features/review/schemas/review-version.schema";
import { getVersionLabel } from "@/features/review/types";

export function useReviewVersions(sceneId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-versions", sceneId],
    queryFn: () => getVersionsByScene(supabase, sceneId!),
    enabled: !!sceneId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviewVersion(versionId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-version", versionId],
    queryFn: () => getVersion(supabase, versionId!),
    enabled: !!versionId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateVersion(sceneId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: {
      file_url: string;
      file_path?: string;
      thumbnail_url?: string;
      file_size_bytes?: number;
      mime_type?: string;
    }) =>
      createVersion(supabase, {
        ...input,
        scene_id: sceneId,
        tenant_id: tenantId!,
        uploaded_by: user?.id ?? "",
        uploaded_by_name: user?.user_metadata?.full_name ?? user?.email ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-versions", sceneId] });
      toast({ title: "Versão adicionada" });
    },
    onError: () => {
      toast({ title: "Erro ao criar versão", variant: "destructive" });
    },
  });
}

export function useUpdateVersionStatus(sceneId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewVersionStatus }) =>
      updateVersionStatus(supabase, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-versions", sceneId] });
      toast({ title: "Status atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });
}

export function useUploadVersion(
  sceneId: string,
  projectId: string
) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (file: File) => {
      const validationError = validateVersionFile(file);
      if (validationError) throw new Error(validationError);

      // Determine next version label for storage path
      const existing = await getVersionsByScene(supabase, sceneId);
      const maxNum = existing.length > 0
        ? Math.max(...existing.map((v) => v.version_number))
        : -1;
      const nextNum = maxNum + 1;

      const versionLabel = getVersionLabel(nextNum);

      const { publicUrl, storagePath } = await uploadVersionFile(supabase, file, {
        tenantId: tenantId!,
        projectId,
        sceneId,
        versionLabel,
      });

      return createVersion(supabase, {
        scene_id: sceneId,
        tenant_id: tenantId!,
        file_url: publicUrl,
        file_path: storagePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user?.id ?? "",
        uploaded_by_name: user?.user_metadata?.full_name ?? user?.email ?? "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-versions", sceneId] });
      queryClient.invalidateQueries({ queryKey: ["review-scenes", projectId] });
      toast({ title: "Versão enviada com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
