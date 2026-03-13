"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTaskTags,
  getTags,
  addTagToTask,
  removeTagFromTask,
  createTag,
} from "@/features/tasks/services/task-tags";
import { taskKeys, tagKeys } from "@/lib/query/task-keys";
import type { Tag, CreateTagInput } from "@/schemas/tag";

// ─── Task Tags Query ───────────────────────────────

export function useTaskTags(taskId: string) {
  const supabase = createClient();

  return useQuery<Tag[]>({
    queryKey: taskKeys.tags(taskId),
    queryFn: () => getTaskTags(supabase, taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId,
  });
}

// ─── Org Tags Query ────────────────────────────────

export function useOrgTags() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<Tag[]>({
    queryKey: tagKeys.list(tenantId ?? ""),
    queryFn: () => getTags(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ─── Add Tag to Task ───────────────────────────────

export function useAddTagToTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tag }: { taskId: string; tag: Tag }) =>
      addTagToTask(supabase, taskId, tag.id),

    onMutate: async ({ taskId, tag }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.tags(taskId) });
      const previous = queryClient.getQueryData<Tag[]>(taskKeys.tags(taskId));

      queryClient.setQueryData<Tag[]>(taskKeys.tags(taskId), (old = []) => {
        if (old.some((t) => t.id === tag.id)) return old;
        return [...old, tag];
      });

      return { previous, taskId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(taskKeys.tags(ctx.taskId), ctx.previous);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tags(variables.taskId) });
    },
  });
}

// ─── Remove Tag from Task ──────────────────────────

export function useRemoveTagFromTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      removeTagFromTask(supabase, taskId, tagId),

    onMutate: async ({ taskId, tagId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.tags(taskId) });
      const previous = queryClient.getQueryData<Tag[]>(taskKeys.tags(taskId));

      queryClient.setQueryData<Tag[]>(
        taskKeys.tags(taskId),
        (old = []) => old.filter((t) => t.id !== tagId)
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(taskKeys.tags(ctx.taskId), ctx.previous);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tags(variables.taskId) });
    },
  });
}

// ─── Create Tag (org-level) ────────────────────────

export function useCreateTag() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      createTag(supabase, {
        ...input,
        tenant_id: tenantId!,
        created_by: userId!,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
