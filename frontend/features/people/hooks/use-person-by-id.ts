"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getPersonById } from "@/features/people/services/people";

export function usePersonById(personId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["person", personId],
    queryFn: () => getPersonById(supabase, personId!),
    enabled: !!personId,
    staleTime: 1000 * 60 * 5,
  });
}
