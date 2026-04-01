"use client";

/**
 * All mutation handlers extracted from ChatLayout.
 * Takes data from useChatData() and returns stable handler functions.
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChatStore } from "@/features/chat/stores/chat-store";
import {
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useTogglePin,
  useAddReaction,
  useRemoveReaction,
  useMarkAsRead,
  useArchiveChannel,
  useUnarchiveChannel,
  useDeleteChannelPermanently,
  useUpdateChannel,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useSendScheduledMessage,
  useCancelScheduledMessage,
} from "@/features/chat/hooks/use-chat";
import {
  uploadChatFile,
  createAttachmentRecord,
  getChannelUploadLimitBytes,
} from "@/features/chat/services/chat-attachments";
import { compressFiles } from "@/features/chat/utils/image-compress";
import {
  extractMentionIds,
  hasBroadcastMention,
  notifyOnChatMention,
} from "@/services/notification-triggers";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import type { MessageRow, ChannelRow } from "@/features/chat/services/chat";

interface HandlersInput {
  tenantId: string | null;
  userId: string | undefined;
  selectedChannelId: string | null;
  selectedChannel: (ChannelRow & { chat_channel_members: { user_id: string; role: string }[] }) | undefined;
  profileMap: Record<string, ProfileInfo>;
  channels: (ChannelRow & { chat_channel_members: { user_id: string; role: string }[] })[] | undefined;
}

export function useChatHandlers({
  tenantId,
  userId,
  selectedChannelId,
  selectedChannel,
  profileMap,
  channels,
}: HandlersInput) {
  const qc = useQueryClient();
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  // Mutations
  const sendMsg = useSendMessage();
  const editMsg = useEditMessage();
  const deleteMsg = useDeleteMessage();
  const togglePin = useTogglePin();
  const addReactionMut = useAddReaction();
  const removeReactionMut = useRemoveReaction();
  const markAsRead = useMarkAsRead();
  const archiveChannelMut = useArchiveChannel();
  const unarchiveChannelMut = useUnarchiveChannel();
  const deleteChannelMut = useDeleteChannelPermanently();
  const updateChannelMut = useUpdateChannel();
  const createSectionMut = useCreateSection();
  const updateSectionMut = useUpdateSection();
  const deleteSectionMut = useDeleteSection();
  const sendScheduledMsg = useSendScheduledMessage();
  const cancelScheduledMsg = useCancelScheduledMessage();

  // ── Channel actions ──────────────────────────────────────
  const handleArchiveChannel = useCallback(
    (id: string) => {
      archiveChannelMut.mutate(id);
      if (selectedChannelId === id) setSelectedChannelId(null);
    },
    [archiveChannelMut, selectedChannelId, setSelectedChannelId],
  );

  const handleDeleteChannel = useCallback(
    (id: string) => {
      deleteChannelMut.mutate(id);
      if (selectedChannelId === id) setSelectedChannelId(null);
    },
    [deleteChannelMut, selectedChannelId, setSelectedChannelId],
  );

  const handleUnarchiveChannel = useCallback(
    (id: string) => unarchiveChannelMut.mutate(id),
    [unarchiveChannelMut],
  );

  const handleMoveToSection = useCallback(
    (channelId: string, sectionId: string | null) =>
      updateChannelMut.mutate({ id: channelId, updates: { section_id: sectionId } }),
    [updateChannelMut],
  );

  const handleCreateSection = useCallback(
    (name: string) => createSectionMut.mutate({ name }),
    [createSectionMut],
  );

  const handleRenameSection = useCallback(
    (id: string, name: string) => updateSectionMut.mutate({ id, updates: { name } }),
    [updateSectionMut],
  );

  const handleDeleteSection = useCallback(
    (id: string) => deleteSectionMut.mutate(id),
    [deleteSectionMut],
  );

  const handleUpdateTopic = useCallback(
    (channelId: string, description: string) =>
      updateChannelMut.mutate({ id: channelId, updates: { description: description || null } }),
    [updateChannelMut],
  );

  // ── Message actions ──────────────────────────────────────
  const handleEdit = useCallback(
    (messageId: string, content: string) => editMsg.mutate({ messageId, content }),
    [editMsg],
  );

  const handleDelete = useCallback(
    (messageId: string) => deleteMsg.mutate({ messageId }),
    [deleteMsg],
  );

  const handleTogglePin = useCallback(
    (messageId: string, pinned: boolean) => togglePin.mutate({ messageId, pinned }),
    [togglePin],
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string, remove: boolean) => {
      if (!userId) return;
      if (remove) {
        removeReactionMut.mutate({ messageId, userId, emoji });
      } else {
        addReactionMut.mutate({ message_id: messageId, user_id: userId, emoji });
      }
    },
    [userId, addReactionMut, removeReactionMut],
  );

  const handleMarkAsRead = useCallback(
    (channelId: string) => {
      if (userId) markAsRead.mutate({ channelId, userId });
    },
    [userId, markAsRead],
  );

  const handleScrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-primary/10");
      setTimeout(() => el.classList.remove("bg-primary/10"), 2000);
    }
  }, []);

  // ── Mention click → open DM ─────────────────────────────
  const handleMentionClick = useCallback(
    async (mentionedUserId: string) => {
      if (!userId || !tenantId || mentionedUserId === userId) return;
      const existingDM = channels?.find(
        (ch) =>
          ch.type === "direct" &&
          ch.chat_channel_members?.some((m) => m.user_id === mentionedUserId),
      );
      if (existingDM) {
        setSelectedChannelId(existingDM.id);
        return;
      }
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const { findOrCreateDirectChannel } = await import("@/features/chat/services/chat");
        const supabase = createClient();
        const dm = await findOrCreateDirectChannel(supabase, tenantId, userId, mentionedUserId);
        await qc.invalidateQueries({ queryKey: ["chat-channels-members"] });
        setSelectedChannelId(dm.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Falha ao abrir conversa: ${msg}`);
      }
    },
    [userId, tenantId, channels, setSelectedChannelId, qc],
  );

  // ── Send (with file upload + mentions) ──────────────────
  const handleSend = useCallback(
    async (content: string, files?: File[], messageType?: string, scheduledAt?: Date) => {
      if (!selectedChannelId || !tenantId || !userId) return;

      if (scheduledAt) {
        sendScheduledMsg.mutate({
          channel_id: selectedChannelId,
          sender_id: userId,
          content,
          message_type: messageType ?? "text",
          scheduled_at: scheduledAt.toISOString(),
        } as never);
        return;
      }

      const msgType = messageType ?? (files?.length ? "file" : "text");
      let message: MessageRow | undefined;
      try {
        message = await sendMsg.mutateAsync({
          channel_id: selectedChannelId,
          sender_id: userId,
          content,
          message_type: msgType,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Falha ao enviar mensagem: ${msg}`);
        return;
      }

      const supabase = (await import("@/lib/supabase/client")).createClient();

      // @mentions
      const mentionedIds = extractMentionIds(content);
      const broadcast = hasBroadcastMention(content);
      if (broadcast.channel || broadcast.here) {
        const memberIds = (selectedChannel?.chat_channel_members ?? [])
          .map((m) => m.user_id)
          .filter((id) => id !== userId);
        for (const id of memberIds) {
          if (!mentionedIds.includes(id)) mentionedIds.push(id);
        }
      }
      if (mentionedIds.length > 0) {
        const senderName = profileMap[userId]?.name ?? "Alguém";
        const channelName = selectedChannel?.name ?? "chat";
        notifyOnChatMention(supabase, {
          tenantId,
          senderId: userId,
          senderName,
          channelId: selectedChannelId,
          channelName,
          messageContent: content,
          mentionedUserIds: mentionedIds,
        }).catch(() => {});
      }

      // File uploads
      if (files?.length && message?.id) {
        const toastId = toast.loading(`Enviando ${files.length} arquivo${files.length > 1 ? "s" : ""}...`);
        const processedFiles = await compressFiles(files);
        const uploadLimitBytes = await getChannelUploadLimitBytes(supabase, selectedChannelId).catch(
          () => 10 * 1024 * 1024,
        );
        let successCount = 0;
        let failCount = 0;
        for (const file of processedFiles) {
          try {
            const { url } = await uploadChatFile(supabase, tenantId, selectedChannelId, file, uploadLimitBytes);
            await createAttachmentRecord(supabase, message.id, file, url);
            successCount++;
          } catch (err) {
            failCount++;
            if (err instanceof Error && err.message.includes("excede")) {
              toast.error(err.message);
            }
          }
        }
        if (failCount === 0) {
          toast.success(
            `${successCount} arquivo${successCount > 1 ? "s" : ""} enviado${successCount > 1 ? "s" : ""}`,
            { id: toastId },
          );
        } else {
          toast.error(
            `${failCount} arquivo${failCount > 1 ? "s" : ""} falhou. ${successCount} enviado${successCount > 1 ? "s" : ""}.`,
            { id: toastId },
          );
        }
      }
    },
    [selectedChannelId, tenantId, userId, selectedChannel, profileMap, sendMsg, sendScheduledMsg],
  );

  return {
    sendMsg,
    markAsRead,
    cancelScheduledMsg,
    // Channel actions
    handleArchiveChannel,
    handleDeleteChannel,
    handleUnarchiveChannel,
    handleMoveToSection,
    handleCreateSection,
    handleRenameSection,
    handleDeleteSection,
    handleUpdateTopic,
    // Message actions
    handleEdit,
    handleDelete,
    handleTogglePin,
    handleReact,
    handleMarkAsRead,
    handleScrollToMessage,
    handleMentionClick,
    handleSend,
  };
}
