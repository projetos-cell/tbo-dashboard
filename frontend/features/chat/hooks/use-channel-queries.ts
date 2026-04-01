"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getChannels,
  getChannelsWithMembers,
  getBrowsableChannels,
  getArchivedChannels,
} from "@/features/chat/services/chat";

// ── Channels ─────────────────────────────────────────────────────────

export function useChannels() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-channels", tenantId],
    queryFn: () => getChannels(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useChannelsWithMembers() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  // Realtime subscription for channel changes (create, update, archive)
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("chat-channels-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_channels",
        },
        () => {
          // Any channel change → refetch both channel queries
          qc.invalidateQueries({ queryKey: ["chat-channels"] });
          qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_channel_members",
        },
        () => {
          // Member changes → refetch channel list + member queries
          qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
          qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return useQuery({
    queryKey: ["chat-channels-members", tenantId],
    queryFn: () => getChannelsWithMembers(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Archived Channels ───────────────────────────────────────────────

export function useArchivedChannels() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-archived-channels", tenantId],
    queryFn: () => getArchivedChannels(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Browse Channels ─────────────────────────────────────────────────

export function useBrowsableChannels(enabled: boolean) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-browsable-channels", tenantId],
    queryFn: () => getBrowsableChannels(supabase),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && enabled,
  });
}
