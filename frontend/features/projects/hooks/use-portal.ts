"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPortalComments,
  createPortalComment,
  deletePortalComment,
  getPortalFiles,
  uploadPortalFile,
  deletePortalFile,
  getApprovalLog,
  requestApproval,
  respondToApproval,
  getOverdueApprovals,
} from "@/features/projects/services/portal-interactions";

const STALE = 1000 * 60 * 5; // 5 min

// ─── Comments ─────────────────────────────────────────────────────────────────

export function usePortalComments(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["portal-comments", tenantId, projectId],
    queryFn: () => {
      const supabase = createClient();
      return getPortalComments(supabase, projectId);
    },
    staleTime: STALE,
    enabled: !!projectId,
  });
}

export function useCreatePortalComment() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: Parameters<typeof createPortalComment>[1]) => {
      const supabase = createClient();
      return createPortalComment(supabase, params);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["portal-comments", tenantId, vars.project_id],
      });
    },
  });
}

export function useDeletePortalComment(projectId: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => {
      const supabase = createClient();
      return deletePortalComment(supabase, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portal-comments", tenantId, projectId],
      });
    },
  });
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function usePortalFiles(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["portal-files", tenantId, projectId],
    queryFn: () => {
      const supabase = createClient();
      return getPortalFiles(supabase, projectId);
    },
    staleTime: STALE,
    enabled: !!projectId,
  });
}

export function useUploadPortalFile() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: Parameters<typeof uploadPortalFile>[1]) => {
      const supabase = createClient();
      return uploadPortalFile(supabase, params);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["portal-files", tenantId, vars.project_id],
      });
    },
  });
}

export function useDeletePortalFile(projectId: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => {
      const supabase = createClient();
      return deletePortalFile(supabase, id, storagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portal-files", tenantId, projectId],
      });
    },
  });
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export function useApprovalLog(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["portal-approval-log", tenantId, projectId],
    queryFn: () => {
      const supabase = createClient();
      return getApprovalLog(supabase, projectId);
    },
    staleTime: STALE,
    enabled: !!projectId,
  });
}

export function useRequestApproval() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: Parameters<typeof requestApproval>[1]) => {
      const supabase = createClient();
      return requestApproval(supabase, params);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["portal-approval-log", tenantId, vars.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["portal-overdue-approvals", tenantId, vars.project_id],
      });
    },
  });
}

export function useRespondToApproval(projectId: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({
      id,
      ...params
    }: { id: string } & Parameters<typeof respondToApproval>[2]) => {
      const supabase = createClient();
      return respondToApproval(supabase, id, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portal-approval-log", tenantId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["portal-overdue-approvals", tenantId, projectId],
      });
    },
  });
}

export function useOverdueApprovals(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["portal-overdue-approvals", tenantId, projectId],
    queryFn: () => {
      const supabase = createClient();
      return getOverdueApprovals(supabase, projectId);
    },
    staleTime: STALE,
    enabled: !!projectId,
  });
}
