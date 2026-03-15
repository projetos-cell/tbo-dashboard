import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const FULL_COLS = "*";

/**
 * Generates the next sequential project code: TBO-YYYY-NNN
 * Queries the latest code for the current year and increments.
 */
export async function generateProjectCode(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TBO-${year}-`;

  const { data } = await supabase
    .from("projects")
    .select("code")
    .like("code", `${prefix}%`)
    .order("code", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0 && data[0].code) {
    const lastCode = data[0].code;
    const lastNum = parseInt(lastCode.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

export async function getProjects(
  supabase: SupabaseClient<Database>
): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(FULL_COLS)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(FULL_COLS)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectDemands(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<DemandRow[]> {
  const { data, error } = await supabase
    .from("demands")
    .select("*")
    .eq("project_id", projectId)
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
  projectId: string
): Promise<ProjectStats> {
  const [demandsRes, sectionsRes, attachRes] = await Promise.all([
    supabase
      .from("demands")
      .select("id,status,feito,due_date", { count: "exact" })
      .eq("project_id", projectId),
    supabase
      .from("os_sections")
      .select("id", { count: "exact" })
      .eq("project_id", projectId),
    supabase
      .from("project_attachments")
      .select("id", { count: "exact" })
      .eq("project_id", projectId),
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
