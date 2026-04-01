"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import type { MessageRow } from "@/features/chat/services/chat";
import {
  getThreadMessages,
  getThreadReplyCount,
  sendMessage,
} from "@/features/chat/services/chat";

export function useThreadMessages(parentMessageId: string | null) {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!parentMessageId || !tenantId) return;

    const ch = supabase
      .channel(`chat-thread:${parentMessageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const msg = (payload.new ?? payload.old) as MessageRow;
          if (msg && (msg as Record<string, unknown>).reply_to === parentMessageId) {
            qc.invalidateQueries({ queryKey: ["chat-thread", parentMessageId] });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentMessageId, tenantId]);

  return useQuery({
    queryKey: ["chat-thread", parentMessageId],
    queryFn: () => getThreadMessages(supabase, parentMessageId!),
    staleTime: 1000 * 30,
    enabled: !!parentMessageId,
  });
}

export function useThreadReplyCount(messageIds: string[]) {
  const supabase = createClient();
  const stableKey = messageIds.join(",");

  return useQuery({
    queryKey: ["chat-thread-counts", stableKey],
    queryFn: () => getThreadReplyCount(supabase, messageIds),
    staleTime: 1000 * 30,
    enabled: messageIds.length > 0,
  });
}

export function useSendThreadReply() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["chat-thread", variables.reply_to] });
    },
  });
}
