import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];
type VersionRow = Database["public"]["Tables"]["cultura_item_versions"]["Row"];

const ITEM_COLS =
  "id,tenant_id,category,title,content,content_html,author_id,status,order_index,icon,metadata,version,created_at,updated_at";

const VERSION_COLS = "id,item_id,version,title,content,edited_by,created_at";

export async function getCulturaItems(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  category?: string
): Promise<CulturaRow[]> {
  let query = supabase
    .from("cultura_items")
    .select(ITEM_COLS)
    .eq("tenant_id", tenantId)
    .order("order_index", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCulturaItem(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<CulturaRow | null> {
  const { data, error } = await supabase
    .from("cultura_items")
    .select(ITEM_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createCulturaItem(
  supabase: SupabaseClient<Database>,
  item: Database["public"]["Tables"]["cultura_items"]["Insert"]
): Promise<CulturaRow> {
  const { data, error } = await supabase
    .from("cultura_items")
    .insert(item as never)
    .select(ITEM_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCulturaItem(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["cultura_items"]["Update"],
  editedBy?: string
): Promise<CulturaRow> {
  // Get current item for version history
  const { data: currentRaw } = await supabase
    .from("cultura_items")
    .select("version,title,content")
    .eq("id", id)
    .single();

  const current = currentRaw as { version: number | null; title: string | null; content: string | null } | null;
  const newVersion = (current?.version ?? 0) + 1;

  // Save version snapshot
  if (current && editedBy) {
    await supabase.from("cultura_item_versions").insert({
      item_id: id,
      version: current.version ?? 1,
      title: current.title ?? "",
      content: current.content,
      edited_by: editedBy,
    } as never);
  }

  const { data, error } = await supabase
    .from("cultura_items")
    .update({
      ...updates,
      version: newVersion,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select(ITEM_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCulturaItem(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("cultura_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getCulturaVersions(
  supabase: SupabaseClient<Database>,
  itemId: string
): Promise<VersionRow[]> {
  const { data, error } = await supabase
    .from("cultura_item_versions")
    .select(VERSION_COLS)
    .eq("item_id", itemId)
    .order("version", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
