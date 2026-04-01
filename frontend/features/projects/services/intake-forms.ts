import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// intake_forms table not in generated types — define manually
export interface IntakeFormRow {
  id: string;
  project_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  fields_json: unknown;
  target_section_id: string | null;
  default_status: string | null;
  default_priority: string | null;
  token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
type IntakeFormInsert = Partial<IntakeFormRow> & { project_id: string; tenant_id: string; title: string; token: string };
type IntakeFormUpdate = Partial<IntakeFormRow>;

export interface IntakeField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "email" | "url";
  required: boolean;
  options?: string[];
}

// Use untyped client to bypass missing table in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

const COLS =
  "id,project_id,tenant_id,title,description,fields_json,target_section_id,default_status,default_priority,token,is_active,created_at,updated_at";

export async function getIntakeForm(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<IntakeFormRow | null> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("intake_forms")
    .select(COLS)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data as IntakeFormRow | null;
}

export async function getIntakeFormByToken(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<(IntakeFormRow & { project_name: string }) | null> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("intake_forms")
    .select(COLS)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as IntakeFormRow;

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", row.project_id)
    .single();

  return { ...row, project_name: project?.name ?? "Projeto" };
}

export async function createIntakeForm(
  supabase: SupabaseClient<Database>,
  form: IntakeFormInsert
): Promise<IntakeFormRow> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("intake_forms")
    .insert(form)
    .select(COLS)
    .single();

  if (error) throw error;
  return data as IntakeFormRow;
}

export async function updateIntakeForm(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: IntakeFormUpdate
): Promise<IntakeFormRow> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("intake_forms")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return data as IntakeFormRow;
}

export async function deleteIntakeForm(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const db = supabase as unknown as UntypedClient;
  const { error } = await db
    .from("intake_forms")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
