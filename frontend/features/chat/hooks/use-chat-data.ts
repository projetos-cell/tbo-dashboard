"use client";

/**
 * Aggregated data hook for ChatLayout — extracts all data fetching,
 * realtime sync, and derived state from the god-component.
 */

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import { canPerformChannelAction } from "@/features/chat/utils/chat-permissions";
import { buildProfileMap, type ProfileInfo } from "@/features/chat/utils/profile-utils";
import { useProfiles } from "@/features/people/hooks/use-people";
import { toast } from "sonner";

import {
  useChannelsWithMembers,
  useMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useUnreadCounts,
  useSections,
  useTogglePin,
  useArchivedChannels,
  useArchiveChannel,
  useUnarchiveChannel,
  useDeleteChannelPermanently,
  useUpdateChannel,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useAddReaction,
  useRemoveReaction,
  flattenMessages,
  useScheduledMessages,
  useSendScheduledMessage,
  useCancelScheduledMessage,
} from "@/features/chat/hooks/use-chat";
import { useTypingIndicator } from "@/features/chat/hooks/use-typing-indicator";
import { useChatPresence } from "@/features/chat/hooks/use-presence";
import { useAutoArchive } from "@/features/chat/hooks/use-auto-archive";
import { usePushNotifications } from "@/features/chat/hooks/use-push-notifications";
import { useAllNotificationPrefs } from "@/features/chat/hooks/use-notification-prefs";
import { useFaviconBadge } from "@/features/chat/hooks/use-favicon-badge";
import {
  useNotificationSound,
  getSoundPref,
  saveSoundPref,
} from "@/features/chat/hooks/use-notification-sound";
import { useBookmarks, useAddBookmark, useRemoveBookmark } from "@/features/chat/hooks/use-chat-bookmarks";
import { useChannelFavorites } from "@/features/chat/hooks/use-channel-favorites";
import { setNotificationPref } from "@/features/chat/services/chat-notification-prefs";
import type { MentionOption } from "@/features/chat/components/mention-popup";
import { SPECIAL_MENTION_OPTIONS } from "@/features/chat/components/mention-popup";
import type { MessageRow } from "@/features/chat/services/chat";

export function useChatData() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.role) as RoleSlug | null;

  const selectedChannelId = useChatStore((s) => s.selectedChannelId);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);
  const unreadCounts = useChatStore((s) => s.unreadCounts);

  // ── Data queries ─────────────────────────────────────────
  const { data: channels, isLoading: loadingChannels } = useChannelsWithMembers();
  const { data: sections } = useSections();
  const { data: archivedChannels } = useArchivedChannels();
  const { data: profiles } = useProfiles();
  const messagesQuery = useMessages(selectedChannelId);
  const { data: unreadData } = useUnreadCounts();
  const { data: notifPrefsData } = useAllNotificationPrefs();
  const { data: scheduledMessages, isLoading: loadingScheduled } = useScheduledMessages(selectedChannelId);
  const { data: bookmarksData } = useBookmarks();

  // Sync unread counts
  useEffect(() => {
    if (unreadData) setUnreadCounts(unreadData);
  }, [unreadData, setUnreadCounts]);

  // ── Realtime hooks ───────────────────────────────────────
  const { sendTyping } = useTypingIndicator(selectedChannelId);
  useChatPresence();
  useAutoArchive();

  // ── Derived state ────────────────────────────────────────
  const messages = flattenMessages(messagesQuery.data);
  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);
  const profileMap = useMemo(() => buildProfileMap(profiles ?? []), [profiles]);

  const canDeleteOthers = hasPermission(userRole, "chat.delete_messages");
  const canCreateChannel = hasPermission(userRole, "chat.create_channel");
  const canManageChannels = hasPermission(userRole, "chat.create_channel");

  const myMemberRole = useMemo(() => {
    if (!selectedChannel || !userId) return null;
    return selectedChannel.chat_channel_members?.find((m) => m.user_id === userId)?.role ?? null;
  }, [selectedChannel, userId]);

  const channelSettings = useMemo(() => {
    return (selectedChannel as Record<string, unknown> | undefined)?.settings as
      | { who_can_post?: "everyone" | "admins"; is_read_only?: boolean }
      | null
      | undefined;
  }, [selectedChannel]);

  const canSendMessage = canPerformChannelAction("send_message", {
    userRole,
    channelMemberRole: myMemberRole,
    channelSettings,
    isCreator: selectedChannel?.created_by === userId,
  });

  const canPin = canPerformChannelAction("pin_message", {
    userRole,
    channelMemberRole: myMemberRole,
    channelSettings: null,
    isCreator: selectedChannel?.created_by === userId,
  });

  // ── Push notifications ───────────────────────────────────
  const channelNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ch of channels ?? []) {
      if (ch.name) map[ch.id] = ch.name;
    }
    return map;
  }, [channels]);

  const senderNames = useMemo(
    () => Object.fromEntries(Object.entries(profileMap).map(([id, p]) => [id, p.name])),
    [profileMap],
  );
  usePushNotifications({ channelNames, senderNames, notifPrefs: notifPrefsData ?? {} });

  // Favicon badge
  const totalUnread = useChatStore((s) =>
    Object.values(s.unreadCounts).reduce((sum, n) => sum + n, 0),
  );
  useFaviconBadge(totalUnread);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(() => getSoundPref());
  function handleToggleSound(enabled: boolean) {
    setSoundEnabled(enabled);
    saveSoundPref(enabled);
  }
  useNotificationSound({ soundEnabled, notifPrefs: notifPrefsData ?? {} });

  // ── Mention options ──────────────────────────────────────
  const mentionOptions: MentionOption[] = useMemo(() => {
    if (!userId) return [];
    const channelMemberIds = new Set(
      (selectedChannel?.chat_channel_members ?? []).map((m) => m.user_id),
    );
    const allUsers = Object.entries(profileMap)
      .filter(([id, p]) => id !== userId && p.name && p.name !== "Usuário")
      .map(([id, p]) => ({
        id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        _inChannel: channelMemberIds.has(id),
      }))
      .sort((a, b) => (a._inChannel === b._inChannel ? 0 : a._inChannel ? -1 : 1))
      .map(({ _inChannel, ...rest }) => rest);
    const isPublic = selectedChannel?.type === "channel" || selectedChannel?.type === "private";
    return isPublic ? [...SPECIAL_MENTION_OPTIONS, ...allUsers] : allUsers;
  }, [selectedChannel, userId, profileMap]);

  // ── Last own message (for ↑ to edit) ─────────────────────
  const lastOwnMessage = useMemo(() => {
    if (!userId) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.sender_id === userId && msg.message_type === "text" && !msg.deleted_at) {
        return msg;
      }
    }
    return null;
  }, [messages, userId]);

  // ── Muted channels ───────────────────────────────────────
  const qc = useQueryClient();
  const muteChannelMut = useMutation({
    mutationFn: async ({ channelId, muted }: { channelId: string; muted: boolean }) => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await setNotificationPref(supabase, userId!, channelId, muted ? "nothing" : "all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-notif-prefs-all", userId] });
    },
  });

  const mutedChannelIds = useMemo(() => {
    if (!notifPrefsData) return new Set<string>();
    return new Set(
      Object.entries(notifPrefsData)
        .filter(([, v]) => v === "nothing")
        .map(([k]) => k),
    );
  }, [notifPrefsData]);

  // ── Favorites ────────────────────────────────────────────
  const { favoriteIds, toggleFavorite } = useChannelFavorites();

  // ── Bookmarks ────────────────────────────────────────────
  const addBookmarkMut = useAddBookmark();
  const removeBookmarkMut = useRemoveBookmark();
  const bookmarkedMessageIds = useMemo(
    () => new Set((bookmarksData ?? []).map((b) => b.message_id)),
    [bookmarksData],
  );

  return {
    // Auth
    tenantId,
    userId,
    userRole,
    // Queries
    channels,
    sections,
    archivedChannels,
    loadingChannels,
    messagesQuery,
    messages,
    selectedChannel,
    selectedChannelId,
    setSelectedChannelId,
    profileMap,
    unreadCounts,
    scheduledMessages,
    loadingScheduled,
    notifPrefsData,
    // Permissions
    canDeleteOthers,
    canCreateChannel,
    canManageChannels,
    canSendMessage,
    canPin,
    myMemberRole,
    // Sound
    soundEnabled,
    handleToggleSound,
    // Mentions
    mentionOptions,
    lastOwnMessage,
    // Mute
    mutedChannelIds,
    handleMuteToggle: (channelId: string, muted: boolean) => muteChannelMut.mutate({ channelId, muted }),
    // Favorites
    favoriteIds,
    toggleFavorite,
    // Bookmarks
    bookmarkedMessageIds,
    handleBookmark: (messageId: string, remove: boolean) => {
      if (remove) removeBookmarkMut.mutate(messageId);
      else addBookmarkMut.mutate(messageId);
    },
    // Typing
    sendTyping,
    // Channel names (for push)
    channelNames,
    channelSettings,
  };
}
