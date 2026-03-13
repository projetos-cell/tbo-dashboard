import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Tag, CreateTagInput } from "@/schemas/tag";

const TAGS_TABLE = "tags" as never;
const JUNCTION_TABLE = "task_tags" as never;

// ─── Tags CRUD (org-level) ────────────────────────────

export async function getTags(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from(TAGS_TABLE)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Tag[];
}

export async function createTag(
  supabase: SupabaseClient<Database>,
  input: CreateTagInput & { tenant_id: string; created_by: string }
): Promise<Tag> {
  const { data, error } = await supabase
    .from(TAGS_TABLE)
    .insert(input as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as Tag;
}

export async function deleteTag(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(TAGS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

// ─── Task-Tag junction ────────────────────────────────

export async function getTaskTags(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from(JUNCTION_TABLE)
    .select("tag_id, tags:tag_id(*)")
    .eq("task_id", taskId);

  if (error) throw error;

  // Extract the joined tag data
  return ((data ?? []) as unknown as Array<{ tags: Tag }>).map((r) => r.tags);
}

export async function addTagToTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tagId: string
): Promise<void> {
  const { error } = await supabase
    .from(JUNCTION_TABLE)
    .insert({ task_id: taskId, tag_id: tagId } as never);

  if (error) throw error;
}

export async function removeTagFromTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tagId: string
): Promise<void> {
  const { error } = await supabase
    .from(JUNCTION_TABLE)
    .delete()
    .eq("task_id", taskId)
    .eq("tag_id", tagId);

  if (error) throw error;
}
