"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export interface GlobalSearchResults {
  projects: { id: string; name: string; status: string | null }[];
  tasks: { id: string; title: string; status: string | null; project_id: string | null }[];
  people: { id: string; full_name: string; role: string | null; avatar_url: string | null }[];
  deals: { id: string; name: string }[];
  contracts: { id: string; title: string; person_name: string | null; status: string | null }[];
  sops: { id: string; title: string; slug: string; bu: string | null }[];
  messages: { id: string; content: string; channel_id: string | null }[];
}

export function useGlobalSearch(query: string): {
  data: GlobalSearchResults | undefined;
  isLoading: boolean;
} {
  const debouncedQuery = useDebouncedValue(query, 250);

  return useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: async (): Promise<GlobalSearchResults> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { projects: [], tasks: [], people: [], deals: [], contracts: [], sops: [], messages: [] };
      }

      const supabase = createClient();
      const term = `%${debouncedQuery}%`;

      const [projectsRes, tasksRes, peopleRes, dealsRes, contractsRes, sopsRes, messagesRes] =
        await Promise.all([
          supabase
            .from("projects")
            .select("id, name, status")
            .ilike("name", term)
            .limit(5),
          supabase
            .from("os_tasks")
            .select("id, title, status, project_id")
            .ilike("title", term)
            .limit(5),
          supabase
            .from("profiles")
            .select("id, full_name, role, avatar_url")
            .ilike("full_name", term)
            .limit(5),
          supabase
            .from("crm_deals")
            .select("id, name")
            .ilike("name", term)
            .limit(5),
          supabase
            .from("contracts")
            .select("id, title, person_name, status")
            .ilike("title", term)
            .limit(5),
          supabase
            .from("knowledge_sops")
            .select("id, title, slug, bu")
            .ilike("title", term)
            .limit(5),
          supabase
            .from("chat_messages")
            .select("id, content, channel_id")
            .ilike("content", term)
            .is("deleted_at", null)
            .limit(5),
        ]);

      return {
        projects: projectsRes.data ?? [],
        tasks: tasksRes.data ?? [],
        people: peopleRes.data ?? [],
        deals: dealsRes.data ?? [],
        contracts: contractsRes.data ?? [],
        sops: sopsRes.data ?? [],
        messages: messagesRes.data ?? [],
      };
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
}
