import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ChatAttachmentRow } from "./chat-attachments";

export type MediaType = "image" | "video" | "pdf" | "file";

export interface GalleryItem extends ChatAttachmentRow {
  mediaType: MediaType;
  sentAt: string;
  senderName?: string;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];

export function getMediaType(mimeType: string): MediaType {
  if (IMAGE_TYPES.includes(mimeType)) return "image";
  if (VIDEO_TYPES.includes(mimeType)) return "video";
  if (mimeType === "application/pdf") return "pdf";
  return "file";
}

export function isVideoFile(type: string): boolean {
  return VIDEO_TYPES.includes(type);
}

export function isPdfFile(type: string): boolean {
  return type === "application/pdf";
}

/**
 * Fetch all attachments for a channel, joining with message timestamps.
 * Returns newest first.
 */
export async function getChannelMedia(
  supabase: SupabaseClient<Database>,
  channelId: string,
  limit = 100,
): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("chat_attachments")
    .select(`
      *,
      chat_messages!inner(channel_id, created_at, sender_id,
        profiles:sender_id(full_name)
      )
    `)
    .eq("chat_messages.channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const rawRow = row as unknown as Record<string, unknown>;
    const msgs = rawRow.chat_messages as Record<string, unknown> | null;
    const profile = msgs?.profiles as Record<string, unknown> | null;

    return {
      ...(rawRow as unknown as ChatAttachmentRow),
      mediaType: getMediaType(rawRow.file_type as string),
      sentAt: (msgs?.created_at as string) ?? new Date().toISOString(),
      senderName: (profile?.full_name as string) ?? undefined,
    };
  });
}
