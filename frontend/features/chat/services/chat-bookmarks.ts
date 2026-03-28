import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { MessageRow } from "./chat";

export interface BookmarkRow {
  id: string;
  user_id: string;
  message_id: string;
  created_at: string;
}

export interface BookmarkWithMessage extends BookmarkRow {
  chat_messages: MessageRow | null;
}

// Tables not yet in codegen — cast to untyped client to allow .from() on new tables
function untypedClient(supabase: SupabaseClient<Database>): SupabaseClient {
  return supabase as unknown as SupabaseClient;
}

export async function getBookmarks(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<BookmarkWithMessage[]> {
  const { data, error } = await untypedClient(supabase)
    .from("chat_bookmarks")
    .select("*, chat_messages(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookmarkWithMessage[];
}

export async function addBookmark(
  supabase: SupabaseClient<Database>,
  userId: string,
  messageId: string,
): Promise<void> {
  const { error } = await untypedClient(supabase)
    .from("chat_bookmarks")
    .upsert({ user_id: userId, message_id: messageId }, { onConflict: "user_id,message_id" });
  if (error) throw error;
}

export async function removeBookmark(
  supabase: SupabaseClient<Database>,
  userId: string,
  messageId: string,
): Promise<void> {
  const { error } = await untypedClient(supabase)
    .from("chat_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("message_id", messageId);
  if (error) throw error;
}
