"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getMessageEditHistory } from "../services/chat-message-history";

export function useMessageEditHistory(messageId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-message-history", messageId],
    queryFn: () => getMessageEditHistory(supabase, messageId!),
    enabled: !!messageId,
  });
}
