import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type IntakeFormRow = Database["public"]["Tables"]["intake_forms"]["Row"];
type IntakeFormInsert = Database["public"]["Tables"]["intake_forms"]["Insert"];
type IntakeFormUpdate = Database["public"]["Tables"]["intake_forms"]["Update"];

export interface IntakeField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "email" | "url";
  required: boolean;
  options?: string[]; // for select type
}

const COLS =
  "id,project_id,tenant_id,title,description,fields_json,target_section_id,default_status,default_priority,token,is_active,created_at,updated_at";

export async function getIntakeForm(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<IntakeFormRow | null> {
  const { data, error } = await supabase
    .from("intake_forms")
    .select(COLS)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getIntakeFormByToken(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<(IntakeFormRow & { project_name: string }) | null> {
  const { data, error } = await supabase
    .from("intake_forms")
    .select(`${COLS}`)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Get project name
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", data.project_id)
    .single();

  return { ...data, project_name: project?.name ?? "Projeto" };
}

export async function createIntakeForm(
  supabase: SupabaseClient<Database>,
  form: IntakeFormInsert
): Promise<IntakeFormRow> {
  const { data, error } = await supabase
    .from("intake_forms")
    .insert(form as never)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateIntakeForm(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: IntakeFormUpdate
): Promise<IntakeFormRow> {
  const { data, error } = await supabase
    .from("intake_forms")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIntakeForm(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("intake_forms")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
