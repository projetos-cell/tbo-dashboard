import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  CustomFieldDefinition,
  CreateFieldDefinitionInput,
  TaskCustomFieldValue,
} from "@/schemas/custom-field";

const DEFS_TABLE = "custom_field_definitions" as never;
const VALUES_TABLE = "task_custom_field_values" as never;

// ─── Definitions (org-level) ──────────────────────────

export async function getFieldDefinitions(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<CustomFieldDefinition[]> {
  const { data, error } = await supabase
    .from(DEFS_TABLE)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as CustomFieldDefinition[];
}

export async function createFieldDefinition(
  supabase: SupabaseClient<Database>,
  input: CreateFieldDefinitionInput & { tenant_id: string; created_by: string }
): Promise<CustomFieldDefinition> {
  const { data, error } = await supabase
    .from(DEFS_TABLE)
    .insert(input as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as CustomFieldDefinition;
}

export async function deleteFieldDefinition(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(DEFS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

// ─── Values (per task) ────────────────────────────────

export async function getTaskCustomFieldValues(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<TaskCustomFieldValue[]> {
  const { data, error } = await supabase
    .from(VALUES_TABLE)
    .select("*")
    .eq("task_id", taskId);

  if (error) throw error;
  return (data ?? []) as unknown as TaskCustomFieldValue[];
}

export async function upsertTaskCustomFieldValue(
  supabase: SupabaseClient<Database>,
  input: TaskCustomFieldValue
): Promise<void> {
  const { error } = await supabase
    .from(VALUES_TABLE)
    .upsert(input as never, { onConflict: "task_id,field_id" });

  if (error) throw error;
}

export async function deleteTaskCustomFieldValue(
  supabase: SupabaseClient<Database>,
  taskId: string,
  fieldId: string
): Promise<void> {
  const { error } = await supabase
    .from(VALUES_TABLE)
    .delete()
    .eq("task_id", taskId)
    .eq("field_id", fieldId);

  if (error) throw error;
}
