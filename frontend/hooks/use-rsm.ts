"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listAccounts,
  listPosts,
  listIdeas,
  createPost,
  updatePost,
  deletePost,
  createIdea,
  updateIdea,
  deleteIdea,
} from "@/services/rsm";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

// ── Accounts ──────────────────────────────────────────────────

export function useRsmAccounts() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-accounts", tenantId],
    queryFn: () => listAccounts(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

// ── Posts ──────────────────────────────────────────────────────

export function useRsmPosts(filters?: {
  accountId?: string;
  status?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-posts", tenantId, filters],
    queryFn: () => listPosts(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useCreateRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Database["public"]["Tables"]["rsm_posts"]["Insert"]) =>
      createPost(supabase, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-posts"] }),
  });
}

export function useUpdateRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["rsm_posts"]["Update"];
    }) => updatePost(supabase, id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-posts"] }),
  });
}

export function useDeleteRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-posts"] }),
  });
}

// ── Ideas ─────────────────────────────────────────────────────

export function useRsmIdeas(filters?: { status?: string }) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-ideas", tenantId, filters],
    queryFn: () => listIdeas(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useCreateRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idea: Database["public"]["Tables"]["rsm_ideas"]["Insert"]) =>
      createIdea(supabase, idea),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-ideas"] }),
  });
}

export function useUpdateRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["rsm_ideas"]["Update"];
    }) => updateIdea(supabase, id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-ideas"] }),
  });
}

export function useDeleteRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIdea(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsm-ideas"] }),
  });
}
