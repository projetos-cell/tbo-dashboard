"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { togglePinMessage, getPinnedMessages } from "@/features/chat/services/chat";

export function usePinnedMessages(channelId: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["chat-pinned", channelId],
    queryFn: () => getPinnedMessages(supabase, channelId!),
    enabled: !!channelId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTogglePin() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, pinned }: { messageId: string; pinned: boolean }) =>
      togglePinMessage(supabase, messageId, pinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-pinned"] });
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}
