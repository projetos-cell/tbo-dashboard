import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface MessageHistoryRow {
  id: string;
  message_id: string;
  content: string;
  edited_at: string;
  edited_by: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function anyClient(supabase: SupabaseClient<Database>): any {
  return supabase;
}

export async function getMessageEditHistory(
  supabase: SupabaseClient<Database>,
  messageId: string,
): Promise<MessageHistoryRow[]> {
  const { data, error } = await anyClient(supabase)
    .from("chat_message_history")
    .select("*")
    .eq("message_id", messageId)
    .order("edited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageHistoryRow[];
}
