/**
 * Barrel re-export — all chat hooks split into domain modules.
 * Consumers keep importing from "@/features/chat/hooks/use-chat".
 */

// Channels
export { useChannels, useChannelsWithMembers, useArchivedChannels, useBrowsableChannels } from "./use-channel-queries";
export { useCreateChannel, useUpdateChannel, useArchiveChannel, useUnarchiveChannel, useDeleteChannelPermanently, useJoinChannel } from "./use-channel-mutations";
export { useChannelMembers, useAddChannelMembers, useRemoveChannelMember, useUpdateMemberRole } from "./use-channel-members";

// Messages
export { useMessages, flattenMessages, useMessageAttachments, buildAttachmentMap } from "./use-message-queries";
export { useSendMessage, useEditMessage, useDeleteMessage } from "./use-message-mutations";

// Reactions
export { useAddReaction, useRemoveReaction, useReactionsForMessages, buildReactionMap } from "./use-reactions";
export type { ReactionGroup, ReactionMap } from "./use-reactions";

// Pins
export { usePinnedMessages, useTogglePin } from "./use-pins";

// Read status
export { useMarkAsRead, useUnreadCounts } from "./use-read-status";

// Sections
export { useSections, useCreateSection, useUpdateSection, useDeleteSection } from "./use-sections";

// Threads
export { useThreadMessages, useThreadReplyCount, useSendThreadReply } from "./use-threads";

// Scheduled messages
export { useScheduledMessages, useSendScheduledMessage, useCancelScheduledMessage } from "./use-scheduled-messages";

// Forward
export { useForwardMessage } from "./use-forward-message";
