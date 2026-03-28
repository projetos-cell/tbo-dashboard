import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface MessageHistoryRow {
  id: string;
  message_id: string;
  content: string;
  edited_at: string;
  edited_by: string | null;
}

// Table not yet in codegen — cast to untyped client to allow .from() on new tables
function untypedClient(supabase: SupabaseClient<Database>): SupabaseClient {
  return supabase as unknown as SupabaseClient;
}

export async function getMessageEditHistory(
  supabase: SupabaseClient<Database>,
  messageId: string,
): Promise<MessageHistoryRow[]> {
  const { data, error } = await untypedClient(supabase)
    .from("chat_message_history")
    .select("*")
    .eq("message_id", messageId)
    .order("edited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageHistoryRow[];
}
