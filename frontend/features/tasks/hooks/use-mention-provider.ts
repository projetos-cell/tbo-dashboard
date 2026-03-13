"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { MentionItem, MentionDataProvider } from "@/components/shared/mention-suggestion";

/**
 * Hook that returns a MentionDataProvider for @mentions in rich text editors.
 * Searches people, projects, and tasks by query string.
 */
export function useMentionProvider(): MentionDataProvider {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();

  // Pre-fetch people
  const { data: people } = useQuery({
    queryKey: ["mention-people", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("tenant_id", tenantId)
        .order("full_name");
      return (data || []).map(
        (p: { id: string; full_name: string | null }): MentionItem => ({
          id: p.id,
          label: p.full_name || "Sem nome",
          type: "person",
        })
      );
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });

  // Pre-fetch projects
  const { data: projects } = useQuery({
    queryKey: ["mention-projects", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("name");
      return (data || []).map(
        (p: { id: string; name: string }): MentionItem => ({
          id: p.id,
          label: p.name,
          type: "project",
        })
      );
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });

  // Pre-fetch recent tasks (limit to avoid too many)
  const { data: tasks } = useQuery({
    queryKey: ["mention-tasks", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("os_tasks")
        .select("id, title")
        .eq("tenant_id", tenantId)
        .eq("is_completed", false)
        .order("updated_at", { ascending: false })
        .limit(100);
      return (data || []).map(
        (t: { id: string; title: string }): MentionItem => ({
          id: t.id,
          label: t.title,
          type: "task",
        })
      );
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  });

  return useMemo((): MentionDataProvider => {
    const allItems: MentionItem[] = [
      ...(people || []),
      ...(projects || []),
      ...(tasks || []),
    ];

    return {
      search: (query: string) => {
        if (!query) return allItems.slice(0, 10);
        const lower = query.toLowerCase();
        return allItems
          .filter((item) => item.label.toLowerCase().includes(lower))
          .slice(0, 10);
      },
    };
  }, [people, projects, tasks]);
}
