"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getAnnouncements,
  getUnreadAnnouncements,
  getUserReadIds,
  createAnnouncement,
  markAnnouncementRead,
  deleteAnnouncement,
  type AnnouncementRow,
  type AnnouncementPriority,
} from "@/features/hub/services/announcements";

const ANNOUNCEMENTS_KEY = "announcements";
const UNREAD_KEY = "announcements-unread";
const READ_IDS_KEY = "announcement-read-ids";

/* ─── Queries ────────────────────────────────────────────── */

export function useAnnouncements(limit?: number) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, tenantId, limit],
    queryFn: () =>
      getAnnouncements(supabase, { tenantId: tenantId!, limit }),
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useUnreadAnnouncements() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: [UNREAD_KEY, tenantId, userId],
    queryFn: () =>
      getUnreadAnnouncements(supabase, {
        tenantId: tenantId!,
        userId: userId!,
      }),
    enabled: !!tenantId && !!userId,
    staleTime: 60_000,
  });
}

export function useAnnouncementReadIds() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: [READ_IDS_KEY, userId],
    queryFn: () => getUserReadIds(supabase, userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

/* ─── Mutations ──────────────────────────────────────────── */

export function useCreateAnnouncement() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      title: string;
      body: string;
      priority?: AnnouncementPriority;
      requiresReadConfirmation?: boolean;
      pinned?: boolean;
      publishNow?: boolean;
      expiresAt?: string | null;
    }) =>
      createAnnouncement(supabase, {
        ...payload,
        tenantId: tenantId!,
        authorId: userId!,
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_KEY] });
    },
  });
}

export function useMarkAnnouncementRead() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) =>
      markAnnouncementRead(supabase, {
        announcementId,
        userId: userId!,
        tenantId: tenantId!,
      }),
    onMutate: async (announcementId) => {
      // Optimistic: remove from unread list
      await qc.cancelQueries({ queryKey: [UNREAD_KEY] });
      const previous = qc.getQueryData<AnnouncementRow[]>([
        UNREAD_KEY,
        tenantId,
        userId,
      ]);
      if (previous) {
        qc.setQueryData(
          [UNREAD_KEY, tenantId, userId],
          previous.filter((a) => a.id !== announcementId),
        );
      }

      // Optimistic: add to read IDs
      const prevReadIds = qc.getQueryData<Set<string>>([
        READ_IDS_KEY,
        userId,
      ]);
      if (prevReadIds) {
        const next = new Set(prevReadIds);
        next.add(announcementId);
        qc.setQueryData([READ_IDS_KEY, userId], next);
      }

      return { previous, prevReadIds };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData([UNREAD_KEY, tenantId, userId], context.previous);
      }
      if (context?.prevReadIds) {
        qc.setQueryData([READ_IDS_KEY, userId], context.prevReadIds);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [UNREAD_KEY] });
      qc.invalidateQueries({ queryKey: [READ_IDS_KEY] });
    },
  });
}

export function useDeleteAnnouncement() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(supabase, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      const previous = qc.getQueryData<AnnouncementRow[]>([
        ANNOUNCEMENTS_KEY,
        tenantId,
      ]);
      if (previous) {
        qc.setQueryData(
          [ANNOUNCEMENTS_KEY, tenantId],
          previous.filter((a) => a.id !== id),
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData([ANNOUNCEMENTS_KEY, tenantId], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_KEY] });
    },
  });
}
