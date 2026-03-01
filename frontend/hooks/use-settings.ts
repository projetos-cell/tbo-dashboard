"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUsers,
  updateUserRole,
  getAuditLogs,
} from "@/services/settings";

export function useProfile() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(supabase, userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (updates: Parameters<typeof updateProfile>[2]) =>
      updateProfile(supabase, userId!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUploadAvatar() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadAvatar(supabase, userId!, file);
      await updateProfile(supabase, userId!, { avatar_url: url });
      return url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUsers() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["users", tenantId],
    queryFn: () => getUsers(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUpdateUserRole() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(supabase, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", tenantId] });
    },
  });
}

export function useAuditLogs(opts: {
  page?: number;
  action?: string;
  entityType?: string;
} = {}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const page = opts.page ?? 0;
  const limit = 25;

  return useQuery({
    queryKey: ["audit-logs", tenantId, page, opts.action, opts.entityType],
    queryFn: () =>
      getAuditLogs(supabase, tenantId!, {
        limit,
        offset: page * limit,
        action: opts.action,
        entityType: opts.entityType,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
