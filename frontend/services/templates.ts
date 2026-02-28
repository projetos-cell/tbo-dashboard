import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type TemplateRow = Database["public"]["Tables"]["dynamic_templates"]["Row"];

const FULL_COLS = "*";

export async function getTemplates(
  supabase: SupabaseClient<Database>
): Promise<TemplateRow[]> {
  const { data, error } = await supabase
    .from("dynamic_templates")
    .select(FULL_COLS)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getTemplateById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<TemplateRow | null> {
  const { data, error } = await supabase
    .from("dynamic_templates")
    .select(FULL_COLS)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTemplate(
  supabase: SupabaseClient<Database>,
  template: Database["public"]["Tables"]["dynamic_templates"]["Insert"]
): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from("dynamic_templates")
    .insert(template as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplate(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["dynamic_templates"]["Update"]
): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from("dynamic_templates")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplate(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("dynamic_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function incrementUsage(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<TemplateRow> {
  // First get current usage_count
  const { data: current, error: fetchError } = await supabase
    .from("dynamic_templates")
    .select("usage_count")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const newCount = ((current as { usage_count: number | null })?.usage_count ?? 0) + 1;

  const { data, error } = await supabase
    .from("dynamic_templates")
    .update({
      usage_count: newCount,
      last_used_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}
