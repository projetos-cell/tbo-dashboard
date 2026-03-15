"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getNotificationPref,
  setNotificationPref,
  getAllNotificationPrefs,
  type NotifSetting,
} from "../services/chat-notification-prefs";
import { toast } from "sonner";

/** Preference for a single channel (with optimistic update) */
export function useNotificationPref(channelId: string | null) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  const qk = ["chat-notif-pref", userId, channelId];

  const query = useQuery({
    queryKey: qk,
    queryFn: () => getNotificationPref(supabase, userId!, channelId!),
    enabled: !!userId && !!channelId,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (setting: NotifSetting) =>
      setNotificationPref(supabase, userId!, channelId!, setting),
    onMutate: async (setting) => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<NotifSetting>(qk);
      qc.setQueryData(qk, setting);
      return { prev };
    },
    onError: (_err, _setting, context) => {
      if (context?.prev !== undefined) qc.setQueryData(qk, context.prev);
      toast.error("Erro ao salvar preferência de notificação");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-notif-prefs-all", userId] });
    },
  });

  return {
    pref: (query.data ?? "all") as NotifSetting,
    isLoading: query.isLoading,
    setPref: mutation.mutate,
    isPending: mutation.isPending,
  };
}

/** All notification preferences for the current user (used in push notifications) */
export function useAllNotificationPrefs() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-notif-prefs-all", userId],
    queryFn: () => getAllNotificationPrefs(supabase, userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
