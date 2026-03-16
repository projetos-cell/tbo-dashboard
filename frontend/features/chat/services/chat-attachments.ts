import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ChatAttachmentRow =
  Database["public"]["Tables"]["chat_attachments"]["Row"];

const BUCKET = "chat-attachments";
/** Global fallback limit when channel has no custom limit */
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function isImageFile(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}

/**
 * Get the effective upload limit for a channel in bytes.
 * Reads max_file_size_mb from the channel row; falls back to DEFAULT_MAX_FILE_SIZE_MB.
 */
export async function getChannelUploadLimitBytes(
  supabase: SupabaseClient<Database>,
  channelId: string,
): Promise<number> {
  const { data } = await supabase
    .from("chat_channels")
    .select("max_file_size_mb")
    .eq("id", channelId)
    .single();

  const mb = (data as unknown as { max_file_size_mb: number | null } | null)?.max_file_size_mb
    ?? DEFAULT_MAX_FILE_SIZE_MB;
  return mb * 1024 * 1024;
}

/**
 * Set the upload limit for a channel (founder/diretoria only).
 */
export async function setChannelUploadLimit(
  supabase: SupabaseClient<Database>,
  channelId: string,
  maxFileSizeMb: number | null,
): Promise<void> {
  const { error } = await supabase
    .from("chat_channels")
    .update({ max_file_size_mb: maxFileSizeMb } as never)
    .eq("id", channelId);
  if (error) throw error;
}

export async function uploadChatFile(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  channelId: string,
  file: File,
  /** Pass explicit limit bytes to avoid an extra DB round-trip (optional). */
  maxFileSizeBytes?: number,
): Promise<{ path: string; url: string }> {
  const limit = maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size > limit) {
    const limitMb = Math.round(limit / (1024 * 1024));
    throw new Error(`Arquivo excede ${limitMb} MB`);
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${tenantId}/${channelId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: publicUrl };
}

export async function createAttachmentRecord(
  supabase: SupabaseClient<Database>,
  messageId: string,
  file: File,
  fileUrl: string,
  thumbnailUrl?: string,
): Promise<ChatAttachmentRow> {
  const { data, error } = await supabase
    .from("chat_attachments")
    .insert({
      message_id: messageId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl ?? null,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ChatAttachmentRow;
}

export async function getAttachmentsByMessageIds(
  supabase: SupabaseClient<Database>,
  messageIds: string[],
): Promise<ChatAttachmentRow[]> {
  if (messageIds.length === 0) return [];
  const { data, error } = await supabase
    .from("chat_attachments")
    .select("*")
    .in("message_id", messageIds);
  if (error) throw error;
  return data as ChatAttachmentRow[];
}

export async function deleteChatAttachment(
  supabase: SupabaseClient<Database>,
  attachmentId: string,
  filePath: string,
): Promise<void> {
  // Remove from storage
  await supabase.storage.from(BUCKET).remove([filePath]);
  // Remove DB record
  const { error } = await supabase
    .from("chat_attachments")
    .delete()
    .eq("id", attachmentId);
  if (error) throw error;
}
