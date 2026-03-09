import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ChangelogRow = Database["public"]["Tables"]["changelog_entries"]["Row"];

const FULL_COLS = "*";

export async function getChangelogEntries(
  supabase: SupabaseClient<Database>
): Promise<ChangelogRow[]> {
  const { data, error } = await supabase
    .from("changelog_entries")
    .select(FULL_COLS)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createChangelogEntry(
  supabase: SupabaseClient<Database>,
  entry: Database["public"]["Tables"]["changelog_entries"]["Insert"]
): Promise<ChangelogRow> {
  const { data, error } = await supabase
    .from("changelog_entries")
    .insert(entry as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateChangelogEntry(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["changelog_entries"]["Update"]
): Promise<ChangelogRow> {
  const { data, error } = await supabase
    .from("changelog_entries")
    .update(updates as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChangelogEntry(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("changelog_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
