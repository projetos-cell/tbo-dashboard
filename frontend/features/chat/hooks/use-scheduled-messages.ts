"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import {
  getScheduledMessages,
  sendMessage,
  cancelScheduledMessage,
} from "@/features/chat/services/chat";

export function useScheduledMessages(channelId: string | null) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-scheduled", channelId, userId],
    queryFn: () => getScheduledMessages(supabase, channelId!, userId!),
    staleTime: 1000 * 30,
    enabled: !!channelId && !!userId,
  });
}

export function useSendScheduledMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (msg: Database["public"]["Tables"]["chat_messages"]["Insert"]) =>
      sendMessage(supabase, msg),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["chat-scheduled", variables.channel_id, userId] });
      toast.success("Mensagem agendada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao agendar mensagem");
    },
  });
}

export function useCancelScheduledMessage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({ messageId, channelId }: { messageId: string; channelId: string }) =>
      cancelScheduledMessage(supabase, messageId),
    onSuccess: (_data, { channelId }) => {
      qc.invalidateQueries({ queryKey: ["chat-scheduled", channelId, userId] });
      toast.success("Agendamento cancelado");
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento");
    },
  });
}
