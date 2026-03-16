"use client";

/**
 * Feature #46 — Webhook / Bot messages hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getChannelWebhooks,
  createWebhook,
  deleteWebhook,
  toggleWebhook,
} from "@/features/chat/services/chat-webhooks";
import { toast } from "sonner";

export function useChannelWebhooks(channelId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["channel-webhooks", channelId],
    queryFn: () => getChannelWebhooks(supabase, channelId!),
    enabled: !!channelId,
    staleTime: 1000 * 60,
  });
}

export function useCreateWebhook(channelId: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!userId || !tenantId) throw new Error("Not authenticated");
      return createWebhook(supabase, { channelId, tenantId, name, createdBy: userId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-webhooks", channelId] });
      toast.success("Webhook criado!");
    },
    onError: () => toast.error("Erro ao criar webhook."),
  });
}

export function useDeleteWebhook(channelId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) => deleteWebhook(supabase, webhookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-webhooks", channelId] });
      toast.success("Webhook removido.");
    },
    onError: () => toast.error("Erro ao remover webhook."),
  });
}

export function useToggleWebhook(channelId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, isActive }: { webhookId: string; isActive: boolean }) =>
      toggleWebhook(supabase, webhookId, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-webhooks", channelId] });
    },
    onError: () => toast.error("Erro ao atualizar webhook."),
  });
}
