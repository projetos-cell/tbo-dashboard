"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getFerramentasData } from "@/features/cultura/services/ferramentas";

function useSupabase() {
  return createClient();
}

/** Returns tool categories and best practices.
 * Fetches from Supabase `tool_categories` table; falls back to static seed if unavailable. */
export function useFerramentas() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["ferramentas"],
    queryFn: () => getFerramentasData(supabase),
    staleTime: 1000 * 60 * 10,
  });
}
