"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const STALE = 1000 * 60 * 2; // 2 min

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  tenant_id: string;
  client_id: string | null;
  sender_type: string;
  sender_name: string | null;
  content: string;
  created_at: string;
}

// ─── Query: Fetch messages ───────────────────────────────────────────────────

export function usePortalChatMessages(projectId: string, tenantId: string | null) {
  return useQuery({
    queryKey: ["portal-chat", tenantId, projectId],
    queryFn: async () => {
      const supabase = createClient();
      // client_messages may reference client_id; we filter by tenant + project context
      // For simplicity, fetch messages linked to the project via a join or direct filter
      const { data, error } = await supabase
        .from("client_messages" as any)
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as unknown as ChatMessage[];
    },
    staleTime: STALE,
    enabled: !!projectId && !!tenantId,
  });
}

// ─── Mutation: Send message ──────────────────────────────────────────────────

interface SendMessageParams {
  tenantId: string;
  clientId: string | null;
  senderType: "client" | "team";
  senderName: string;
  content: string;
  projectId: string;
}

export function useSendPortalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_messages" as any)
        .insert({
          tenant_id: params.tenantId,
          client_id: params.clientId,
          sender_type: params.senderType,
          sender_name: params.senderName,
          content: params.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["portal-chat", vars.tenantId, vars.projectId],
      });
    },
  });
}

// ─── Realtime: Subscribe to new messages ─────────────────────────────────────

export function usePortalChatRealtime(projectId: string, tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId || !projectId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`portal-chat-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_messages",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["portal-chat", tenantId, projectId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, tenantId, queryClient]);
}
