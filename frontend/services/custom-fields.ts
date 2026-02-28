import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type FieldDefRow = Database["public"]["Tables"]["custom_field_definitions"]["Row"];
type FieldValRow = Database["public"]["Tables"]["custom_field_values"]["Row"];

const DEF_COLS = "id,tenant_id,project_id,name,field_type,options,order_index,is_required,created_at";
const VAL_COLS = "id,tenant_id,definition_id,task_id,value_text,value_number,value_date,value_json";

export async function getDefinitions(
  supabase: SupabaseClient<Database>,
  projectId: string,
  tenantId: string
): Promise<FieldDefRow[]> {
  const { data, error } = await supabase
    .from("custom_field_definitions")
    .select(DEF_COLS)
    .eq("project_id", projectId)
    .eq("tenant_id", tenantId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createDefinition(
  supabase: SupabaseClient<Database>,
  def: Database["public"]["Tables"]["custom_field_definitions"]["Insert"]
): Promise<FieldDefRow> {
  const { data, error } = await supabase
    .from("custom_field_definitions")
    .insert(def as never)
    .select(DEF_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDefinition(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["custom_field_definitions"]["Update"]
): Promise<FieldDefRow> {
  const { data, error } = await supabase
    .from("custom_field_definitions")
    .update(updates as never)
    .eq("id", id)
    .select(DEF_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDefinition(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_field_definitions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getValues(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tenantId: string
): Promise<FieldValRow[]> {
  const { data, error } = await supabase
    .from("custom_field_values")
    .select(VAL_COLS)
    .eq("task_id", taskId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
  return data ?? [];
}

export async function upsertValue(
  supabase: SupabaseClient<Database>,
  value: Database["public"]["Tables"]["custom_field_values"]["Insert"]
): Promise<FieldValRow> {
  const { data, error } = await supabase
    .from("custom_field_values")
    .upsert(value as never, { onConflict: "definition_id,task_id" })
    .select(VAL_COLS)
    .single();

  if (error) throw error;
  return data;
}
