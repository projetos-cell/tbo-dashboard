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
  const [tasksRes, sectionsRes, attachRes] = await Promise.all([
    supabase
      .from("os_tasks")
      .select("id,is_completed,due_date", { count: "exact" })
      .eq("project_id", projectId)
      .eq("tenant_id", tenantId)
      .is("parent_id", null),
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

  const tasks = (tasksRes.data ?? []) as { id: string; is_completed: boolean | null; due_date: string | null }[];
  const now = new Date().toISOString();

  return {
    totalTasks: tasksRes.count ?? tasks.length,
    completedTasks: tasks.filter((t) => t.is_completed).length,
    overdueTasks: tasks.filter(
      (t) => !t.is_completed && t.due_date && t.due_date < now
    ).length,
    totalSections: sectionsRes.count ?? 0,
    totalAttachments: attachRes.count ?? 0,
  };
}
