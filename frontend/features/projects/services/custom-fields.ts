import { createClient } from "@/lib/supabase/client";

export type CustomFieldType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "person"
  | "checkbox"
  | "url"
  | "email";

export interface CustomField {
  id: string;
  tenant_id: string;
  scope: "global" | "project";
  project_id: string | null;
  name: string;
  type: CustomFieldType;
  config_json: Record<string, unknown> | null;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskFieldValue {
  id: string;
  tenant_id: string;
  task_id: string;
  field_id: string;
  value_json: unknown;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldInput {
  name: string;
  type: CustomFieldType;
  project_id: string;
  config_json?: Record<string, unknown>;
  order_index?: number;
}

// TODO: regenerate types with `supabase gen types` to get proper table types
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- table missing from generated types
function fieldsTable(): any { return createClient().from("os_custom_fields" as never); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- table missing from generated types
function valuesTable(): any { return createClient().from("os_task_field_values" as never); }

// ─── Custom Field CRUD ──────────────────────────────────────────────────────────

export async function getProjectCustomFields(
  tenantId: string,
  projectId: string,
): Promise<CustomField[]> {
  const { data, error } = await fieldsTable()
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("project_id", projectId)
    .eq("is_visible", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CustomField[];
}

export async function createCustomField(
  tenantId: string,
  input: CreateCustomFieldInput,
): Promise<CustomField> {
  const { data, error } = await fieldsTable()
    .insert({
      tenant_id: tenantId,
      scope: "project",
      project_id: input.project_id,
      name: input.name,
      type: input.type,
      config_json: input.config_json ?? null,
      order_index: input.order_index ?? 0,
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CustomField;
}

export async function updateCustomField(
  id: string,
  updates: Partial<Pick<CustomField, "name" | "type" | "config_json" | "order_index" | "is_visible">>,
): Promise<CustomField> {
  const { data, error } = await fieldsTable()
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomField;
}

export async function deleteCustomField(id: string): Promise<void> {
  const { error } = await fieldsTable().delete().eq("id", id);
  if (error) throw error;
}

// ─── Task Field Values ──────────────────────────────────────────────────────────

export async function getTaskFieldValues(
  tenantId: string,
  taskIds: string[],
): Promise<TaskFieldValue[]> {
  if (taskIds.length === 0) return [];
  const { data, error } = await valuesTable()
    .select("*")
    .eq("tenant_id", tenantId)
    .in("task_id", taskIds);

  if (error) throw error;
  return (data ?? []) as TaskFieldValue[];
}

export async function upsertTaskFieldValue(
  tenantId: string,
  taskId: string,
  fieldId: string,
  value: unknown,
): Promise<TaskFieldValue> {
  // Try update first, then insert
  const { data: existing } = await valuesTable()
    .select("id")
    .eq("task_id", taskId)
    .eq("field_id", fieldId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await valuesTable()
      .update({ value_json: value })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as TaskFieldValue;
  }

  const { data, error } = await valuesTable()
    .insert({
      tenant_id: tenantId,
      task_id: taskId,
      field_id: fieldId,
      value_json: value,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TaskFieldValue;
}

// ─── View Preferences (column widths, order, visibility) ────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- table missing from generated types
function prefsTable(): any { return createClient().from("user_view_preferences" as never); }

export interface ViewPreferences {
  id: string;
  user_id: string;
  project_id: string;
  column_widths: Record<string, number>;
  column_order: string[];
  hidden_columns: string[];
}

export async function getViewPreferences(
  userId: string,
  projectId: string,
): Promise<ViewPreferences | null> {
  const { data, error } = await prefsTable()
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data as ViewPreferences | null;
}

export async function upsertViewPreferences(
  userId: string,
  projectId: string,
  prefs: Partial<Pick<ViewPreferences, "column_widths" | "column_order" | "hidden_columns">>,
): Promise<void> {
  const { data: existing } = await prefsTable()
    .select("id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (existing) {
    const { error } = await prefsTable()
      .update(prefs)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await prefsTable()
      .insert({
        user_id: userId,
        project_id: projectId,
        ...prefs,
      });
    if (error) throw error;
  }
}
