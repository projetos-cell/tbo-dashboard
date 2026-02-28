import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const FULL_COLS = "*";

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
    .select("*")
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

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalSections: number;
  totalAttachments: number;
}

export async function getProjectStats(
  supabase: SupabaseClient<Database>,
  projectId: string,
  tenantId: string
): Promise<ProjectStats> {
  const [demandsRes, sectionsRes, attachRes] = await Promise.all([
    supabase
      .from("demands")
      .select("id,status,feito,due_date", { count: "exact" })
      .eq("project_id", projectId)
      .eq("tenant_id", tenantId),
    supabase
      .from("os_sections")
      .select("id", { count: "exact" })
      .eq("project_id", projectId)
      .eq("tenant_id", tenantId),
    supabase
      .from("project_attachments")
      .select("id", { count: "exact" })
      .eq("project_id", projectId)
      .eq("tenant_id", tenantId),
  ]);

  const demands = (demandsRes.data ?? []) as {
    id: string;
    status: string;
    feito: boolean | null;
    due_date: string | null;
  }[];
  const now = new Date().toISOString().split("T")[0];

  const isDone = (d: { status: string; feito: boolean | null }) =>
    d.feito || d.status === "Concluído" || d.status === "Concluido";

  return {
    totalTasks: demandsRes.count ?? demands.length,
    completedTasks: demands.filter(isDone).length,
    overdueTasks: demands.filter(
      (d) => !isDone(d) && d.due_date && d.due_date < now
    ).length,
    totalSections: sectionsRes.count ?? 0,
    totalAttachments: attachRes.count ?? 0,
  };
}
