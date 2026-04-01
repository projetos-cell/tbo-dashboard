"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import {
  createChannel,
  updateChannel,
  archiveChannel,
  unarchiveChannel,
  deleteChannelPermanently,
  addChannelMembers,
  updateMemberRole,
  joinChannel,
} from "@/features/chat/services/chat";

// ── Create Channel ───────────────────────────────────────────────────

export function useCreateChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      type?: string;
      memberIds?: string[];
    }) => {
      if (!tenantId || !userId) {
        throw new Error("Usuário não autenticado");
      }
      const channel = await createChannel(supabase, {
        tenant_id: tenantId,
        name: input.name,
        description: input.description ?? null,
        type: input.type ?? "channel",
        created_by: userId,
      });
      // Add creator + selected members
      const allMembers = [...new Set([userId, ...(input.memberIds ?? [])])];
      await addChannelMembers(supabase, channel.id, allMembers, "member");
      // Promote creator to admin
      await updateMemberRole(supabase, channel.id, userId, "admin");
      return channel;
    },
    onSuccess: (channel) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success(`Canal "${channel.name}" criado com sucesso`);
      if (userId) {
        logAuditTrail({
          userId,
          action: "create",
          table: "chat_channels",
          recordId: channel.id,
          after: { name: channel.name, type: channel.type },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Update Channel ───────────────────────────────────────────────────

export function useUpdateChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["chat_channels"]["Update"];
    }) => updateChannel(supabase, id, updates),
    onSuccess: (channel) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success("Canal atualizado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channel.id,
          after: { name: channel.name },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao atualizar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Archive Channel ──────────────────────────────────────────────────

export function useArchiveChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) => archiveChannel(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      toast.success("Canal arquivado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channelId,
          after: { is_archived: true },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao arquivar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Unarchive Channel ────────────────────────────────────────────────

export function useUnarchiveChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) => unarchiveChannel(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      qc.invalidateQueries({ queryKey: ["chat-archived-channels"] });
      toast.success("Canal desarquivado");
      if (userId) {
        logAuditTrail({
          userId,
          action: "update",
          table: "chat_channels",
          recordId: channelId,
          after: { is_archived: false },
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao desarquivar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Delete Channel Permanently ──────────────────────────────────────

export function useDeleteChannelPermanently() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (channelId: string) =>
      deleteChannelPermanently(supabase, channelId),
    onSuccess: (_data, channelId) => {
      qc.invalidateQueries({ queryKey: ["chat-channels"] });
      qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
      qc.invalidateQueries({ queryKey: ["chat-archived-channels"] });
      toast.success("Canal deletado permanentemente");
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_channels",
          recordId: channelId,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao deletar canal", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

// ── Join Channel ─────────────────────────────────────────────────────

export function useJoinChannel() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await joinChannel(supabase, channelId, userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-channels-members", tenantId] });
      qc.invalidateQueries({ queryKey: ["chat-channels", tenantId] });
      qc.invalidateQueries({ queryKey: ["chat-browsable-channels", tenantId] });
      toast.success("Canal adicionado à sua lista");
    },
    onError: () => {
      toast.error("Erro ao entrar no canal");
    },
  });
}
