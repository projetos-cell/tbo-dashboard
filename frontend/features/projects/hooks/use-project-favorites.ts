"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export function useProjectFavorites() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["project-favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await (supabase
        .from("user_project_favorites" as never)
        .select("project_id")
        .eq("user_id", userId) as unknown as Promise<{ data: { project_id: string }[] | null }>);
      return (data || []).map((r) => r.project_id);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useToggleFavorite() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async ({ projectId, isFavorite }: { projectId: string; isFavorite: boolean }) => {
      if (!userId) throw new Error("Not authenticated");
      if (isFavorite) {
        await (supabase
          .from("user_project_favorites" as never)
          .delete()
          .eq("user_id", userId)
          .eq("project_id", projectId) as unknown as Promise<unknown>);
      } else {
        await (supabase
          .from("user_project_favorites" as never)
          .insert({ user_id: userId, project_id: projectId } as never) as unknown as Promise<unknown>);
      }
    },
    onMutate: async ({ projectId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["project-favorites", userId] });
      const previous = queryClient.getQueryData<string[]>(["project-favorites", userId]);
      queryClient.setQueryData<string[]>(
        ["project-favorites", userId],
        (old) => {
          if (!old) return isFavorite ? [] : [projectId];
          return isFavorite
            ? old.filter((id) => id !== projectId)
            : [...old, projectId];
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["project-favorites", userId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-favorites", userId] });
    },
  });
}
