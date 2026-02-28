"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
} from "@/services/attachments";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useAttachments(filters?: { task_id?: string; project_id?: string }) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["attachments", filters?.task_id, filters?.project_id],
    queryFn: () => getAttachments(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useUploadAttachment() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      projectId,
      taskId,
    }: {
      file: File;
      projectId?: string;
      taskId?: string;
    }) =>
      uploadAttachment(supabase, file, {
        tenantId: tenantId!,
        projectId,
        taskId,
        uploadedBy: userId,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.taskId, variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
}

export function useDeleteAttachment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
      deleteAttachment(supabase, id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
}
