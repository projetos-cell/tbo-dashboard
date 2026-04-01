"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

// ─── Task bookmark IDs ────────────────────────────────────────────────────────

export function useTaskBookmarkIds() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["task-bookmarks", userId],
    queryFn: async () => {
      if (!userId) return [] as string[];
      const { data, error } = await (supabase as ReturnType<typeof createClient>)
        .from("user_task_bookmarks" as never)
        .select("task_id")
        .eq("user_id", userId);
      if (error) throw error;
      return ((data as { task_id: string }[] | null) ?? []).map((r) => r.task_id);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Toggle bookmark (optimistic) ────────────────────────────────────────────

export function useToggleTaskBookmark() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      isBookmarked,
    }: {
      taskId: string;
      isBookmarked: boolean;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      if (isBookmarked) {
        const { error } = await (supabase as ReturnType<typeof createClient>)
          .from("user_task_bookmarks" as never)
          .delete()
          .eq("user_id", userId)
          .eq("task_id", taskId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as ReturnType<typeof createClient>)
          .from("user_task_bookmarks" as never)
          .insert({ user_id: userId, task_id: taskId } as never);
        if (error) throw error;
      }
    },
    onMutate: async ({ taskId, isBookmarked }) => {
      await qc.cancelQueries({ queryKey: ["task-bookmarks", userId] });
      const prev = qc.getQueryData<string[]>(["task-bookmarks", userId]) ?? [];
      qc.setQueryData<string[]>(
        ["task-bookmarks", userId],
        isBookmarked ? prev.filter((id) => id !== taskId) : [...prev, taskId],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["task-bookmarks", userId], ctx.prev);
      toast.error("Erro ao atualizar favorito");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["task-bookmarks", userId] });
      qc.invalidateQueries({ queryKey: ["bookmarked-tasks", userId] });
    },
  });
}

// ─── Full bookmarked task data ────────────────────────────────────────────────

export interface BookmarkedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  is_completed: boolean;
  project_id: string | null;
  project_name: string | null;
  bookmarked_at: string;
}

export function useBookmarkedTasks() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["bookmarked-tasks", userId],
    queryFn: async (): Promise<BookmarkedTask[]> => {
      if (!userId) return [];

      // Fetch bookmarks with task data joined
      const { data, error } = await (supabase as ReturnType<typeof createClient>)
        .from("user_task_bookmarks" as never)
        .select(
          `
          task_id,
          created_at,
          os_tasks!inner (
            id,
            title,
            status,
            priority,
            due_date,
            is_completed,
            project_id,
            projects ( name )
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      type RawRow = {
        task_id: string;
        created_at: string;
        os_tasks: {
          id: string;
          title: string;
          status: string;
          priority: string;
          due_date: string | null;
          is_completed: boolean;
          project_id: string | null;
          projects: { name: string } | null;
        };
      };

      return ((data as RawRow[]) ?? []).map((row) => ({
        id: row.os_tasks.id,
        title: row.os_tasks.title,
        status: row.os_tasks.status,
        priority: row.os_tasks.priority,
        due_date: row.os_tasks.due_date,
        is_completed: row.os_tasks.is_completed,
        project_id: row.os_tasks.project_id,
        project_name: row.os_tasks.projects?.name ?? null,
        bookmarked_at: row.created_at,
      }));
    },
    enabled: !!userId,
  });
}
