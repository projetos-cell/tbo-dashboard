"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/services/comments";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useComments(taskId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(supabase, taskId, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!taskId,
  });
}

export function useCreateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: Database["public"]["Tables"]["project_comments"]["Insert"]) =>
      createComment(supabase, comment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.task_id] });
    },
  });
}

export function useUpdateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content, taskId }: { id: string; content: string; taskId: string }) =>
      updateComment(supabase, id, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.taskId] });
    },
  });
}

export function useDeleteComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskId }: { id: string; taskId: string }) =>
      deleteComment(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.taskId] });
    },
  });
}
