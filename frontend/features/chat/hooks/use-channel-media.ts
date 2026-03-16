"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getChannelMedia } from "@/features/chat/services/chat-media-gallery";

export function useChannelMedia(channelId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["channel-media", channelId],
    queryFn: () => getChannelMedia(supabase, channelId!),
    enabled: !!channelId,
    staleTime: 1000 * 60 * 2,
  });
}
