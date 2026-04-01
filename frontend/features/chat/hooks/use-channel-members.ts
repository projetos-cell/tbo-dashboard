"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getChannelMembers,
  addChannelMembers,
  removeChannelMember,
  updateMemberRole,
} from "@/features/chat/services/chat";

export function useChannelMembers(channelId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-channel-members", channelId],
    queryFn: () => getChannelMembers(supabase, channelId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!channelId,
  });
}

export function useAddChannelMembers() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      userIds,
      role,
    }: {
      channelId: string;
      userIds: string[];
      role?: "admin" | "member";
    }) => addChannelMembers(supabase, channelId, userIds, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
    },
  });
}

export function useRemoveChannelMember() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      channelId,
      memberId,
    }: {
      channelId: string;
      memberId: string;
    }) => removeChannelMember(supabase, channelId, memberId),
    onSuccess: (_data, { channelId, memberId }) => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
      if (userId) {
        logAuditTrail({
          userId,
          action: "delete",
          table: "chat_channel_members",
          recordId: `${channelId}:${memberId}`,
        });
      }
    },
  });
}

export function useUpdateMemberRole() {
  const supabase = createClient();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      channelId,
      memberId,
      role,
    }: {
      channelId: string;
      memberId: string;
      role: "admin" | "member";
    }) => updateMemberRole(supabase, channelId, memberId, role),
    onSuccess: (_data, { channelId, memberId, role }) => {
      qc.invalidateQueries({ queryKey: ["chat-channel-members"] });
      if (userId) {
        logAuditTrail({
          userId,
          action: "permission_change",
          table: "chat_channel_members",
          recordId: `${channelId}:${memberId}`,
          after: { role },
        });
      }
    },
  });
}
