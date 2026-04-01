"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { MessageRow } from "@/features/chat/services/chat";
import { forwardMessage } from "@/features/chat/services/chat";

export function useForwardMessage() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetChannelId,
      senderId,
      originalMessage,
      originalSenderName,
    }: {
      targetChannelId: string;
      senderId: string;
      originalMessage: MessageRow;
      originalSenderName: string;
    }) => forwardMessage(supabase, targetChannelId, senderId, originalMessage, originalSenderName),
    onSuccess: (_data, { targetChannelId }) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", targetChannelId] });
      toast.success("Mensagem encaminhada");
    },
    onError: () => {
      toast.error("Erro ao encaminhar mensagem");
    },
  });
}
