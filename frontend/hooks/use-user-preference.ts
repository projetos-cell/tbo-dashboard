"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

/**
 * Persists user preferences to Supabase `user_preferences` table.
 * Falls back to localStorage for immediate read (cache-first).
 *
 * Usage:
 *   const { value, setValue } = useUserPreference<MyType>("my-key", defaultValue);
 *
 * Requires migration:
 *   CREATE TABLE IF NOT EXISTS user_preferences (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *     key text NOT NULL,
 *     value jsonb NOT NULL DEFAULT '{}',
 *     updated_at timestamptz DEFAULT now(),
 *     UNIQUE(user_id, key)
 *   );
 *   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Users manage own preferences" ON user_preferences
 *     FOR ALL USING (auth.uid() = user_id);
 */
export function useUserPreference<T>(key: string, defaultValue: T) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const queryKey = ["user-preference", key, userId];

  const { data: value = defaultValue } = useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      if (!userId) return defaultValue;

      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from("user_preferences")
        .select("value")
        .eq("user_id", userId)
        .eq("key", key)
        .maybeSingle();

      if (error || !data) {
        // Fallback: read from localStorage for migration period
        try {
          const raw = localStorage.getItem(`tbo-pref-${key}`);
          if (raw) return JSON.parse(raw) as T;
        } catch {
          // ignore parse errors
        }
        return defaultValue;
      }

      return (data as { value: T }).value;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { mutate: setValue } = useMutation({
    mutationFn: async (newValue: T) => {
      // Write to localStorage immediately for fast reads
      try {
        localStorage.setItem(`tbo-pref-${key}`, JSON.stringify(newValue));
      } catch {
        // ignore
      }

      if (!userId) return;

      const supabase = createClient();
      await (supabase as any).from("user_preferences").upsert(
        {
          user_id: userId,
          key,
          value: newValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,key" },
      );
    },
    onMutate: async (newValue: T) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, newValue);
      return { previous };
    },
    onError: (_err, _newValue, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { value, setValue };
}
