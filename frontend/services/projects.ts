import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const FULL_COLS =
  "id,name,status,construtora,bus,owner_name,due_date_start,due_date_end,notion_url,code,notion_page_id,tenant_id,created_at,updated_at";

export async function getProjects(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(FULL_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectDemands(
  supabase: SupabaseClient<Database>,
  projectId: string,
  tenantId: string
): Promise<DemandRow[]> {
  const { data, error } = await supabase
    .from("demands")
    .select("id,title,status,due_date,responsible,bus,project_id,notion_url,tenant_id,created_at")
    .eq("project_id", projectId)
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  project: Database["public"]["Tables"]["projects"]["Insert"]
): Promise<ProjectRow> {
  const { data, error } = await supabase
    .from("projects")
    .insert(project as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["projects"]["Update"]
): Promise<ProjectRow> {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
