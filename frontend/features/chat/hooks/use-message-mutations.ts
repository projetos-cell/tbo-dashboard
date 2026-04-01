"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import type { MessageRow } from "@/features/chat/services/chat";
import { sendMessage, editMessage, deleteMessage } from "@/features/chat/services/chat";

// ── Send Message (with optimistic insert) ────────────────────────────

export function useSendMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onMutate: async (newMsg) => {
      const qk = ["chat-messages", newMsg.channel_id, tenantId];
      await qc.cancelQueries({ queryKey: qk });
      const previous = qc.getQueryData<InfiniteData<MessageRow[], string | undefined>>(qk);

      const optimistic = {
        id: `optimistic-${Date.now()}`,
        channel_id: newMsg.channel_id,
        sender_id: newMsg.sender_id,
        content: newMsg.content ?? null,
        message_type: newMsg.message_type ?? "text",
        metadata: null,
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        reply_to: null,
      } as unknown as MessageRow;

      qc.setQueryData<InfiniteData<MessageRow[], string | undefined>>(
        qk,
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = [...(pages[0] ?? []), optimistic];
          return { ...old, pages };
        },
      );

      return { previous, qk };
    },
    onError: (err, _msg, context) => {
      if (context?.previous) {
        qc.setQueryData(context.qk, context.previous);
      }
      const msg = err instanceof Error ? err.message : "Erro ao enviar";
      toast.error(`Mensagem não enviada: ${msg}`);
    },
    onSettled: (_data, _err, msg) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", msg.channel_id] });
    },
  });
}

// ── Edit Message ─────────────────────────────────────────────────────

export function useEditMessage() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(supabase, messageId, content),
    onMutate: async ({ messageId, content }) => {
      const queryFilter = { queryKey: ["chat-messages"], type: "active" as const };
      await qc.cancelQueries(queryFilter);

      const snapshots: { queryKey: readonly unknown[]; data: unknown }[] = [];
      qc.getQueriesData<InfiniteData<MessageRow[], string | undefined>>(queryFilter).forEach(
        ([key, data]) => {
          if (data) snapshots.push({ queryKey: key, data });
        },
      );

      qc.setQueriesData<InfiniteData<MessageRow[], string | undefined>>(
        queryFilter,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((m) =>
                m.id === messageId
                  ? { ...m, content, edited_at: new Date().toISOString() }
                  : m,
              ),
            ),
          };
        },
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const { queryKey, data } of context.snapshots) {
          qc.setQueryData(queryKey, data);
        }
      }
      toast.error("Erro ao editar mensagem");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}

// ── Delete Message ───────────────────────────────────────────────────

export function useDeleteMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      deleteMessage(supabase, messageId),
    onMutate: async ({ messageId }) => {
      const queryFilter = { queryKey: ["chat-messages"], type: "active" as const };
      await qc.cancelQueries(queryFilter);

      const snapshots: { queryKey: readonly unknown[]; data: unknown }[] = [];
      qc.getQueriesData<InfiniteData<MessageRow[], string | undefined>>(queryFilter).forEach(
        ([key, data]) => {
          if (data) snapshots.push({ queryKey: key, data });
        },
      );

      qc.setQueriesData<InfiniteData<MessageRow[], string | undefined>>(
        queryFilter,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.filter((m) => m.id !== messageId),
            ),
          };
        },
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const { queryKey, data } of context.snapshots) {
          qc.setQueryData(queryKey, data);
        }
      }
      toast.error("Erro ao deletar mensagem");
    },
    onSuccess: (_data, { messageId }) => {
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_messages",
          recordId: messageId,
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}
