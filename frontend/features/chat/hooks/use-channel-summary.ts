"use client";

/**
 * Feature #45 — Resumo AI do canal ("O que perdi?")
 */

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface ChannelSummary {
  topics: string[];
  decisions: string[];
  action_items: string[];
  highlights: string[];
  period_label: string;
}

export interface SummaryResult {
  summary: ChannelSummary | null;
  message_count: number;
}

export function useChannelSummary() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      since,
      limit = 100,
    }: {
      channelId: string;
      since?: string;
      limit?: number;
    }): Promise<SummaryResult> => {
      const { data, error } = await supabase.functions.invoke("chat-summarize", {
        body: { channel_id: channelId, since, limit },
      });

      if (error) throw error;
      return data as SummaryResult;
    },
  });
}
