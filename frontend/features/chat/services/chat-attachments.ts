import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ChatAttachmentRow =
  Database["public"]["Tables"]["chat_attachments"]["Row"];

const BUCKET = "chat-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function isImageFile(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}

export async function uploadChatFile(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  channelId: string,
  file: File,
): Promise<{ path: string; url: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Arquivo excede 10 MB");
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
