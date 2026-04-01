import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const FULL_COLS = "*";

/**
 * Formats a project name following the standard: CONSTRUTORA_EMPREENDIMENTO (UPPERCASE)
 * - If construtora equals empreendimento name → just CONSTRUTORA
 * - If name already contains construtora prefix → keep as-is (uppercase)
 * - Otherwise → CONSTRUTORA_EMPREENDIMENTO
 */
export function formatProjectName(
  empreendimento: string,
  construtora?: string | null,
): string {
  const name = empreendimento.trim().toUpperCase();
  if (!construtora?.trim()) return name;

  const c = construtora.trim().toUpperCase();

  // Construtora = empreendimento → just the name
  if (c === name) return c;

  // Name already has construtora prefix
  if (name.startsWith(`${c}_`) || name.startsWith(`${c} `)) return name;

  return `${c}_${name}`;
}

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
  supabase: SupabaseClient<Database>,
  opts?: { page?: number; pageSize?: number }
): Promise<{ data: ProjectRow[]; count: number }> {
  const page = opts?.page ?? 0;
  const pageSize = opts?.pageSize ?? 500;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("projects")
    .select(FULL_COLS, { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
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

// ── Project Members ──────────────────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  tenant_id: string;
  role_id: string;
  granted_by: string | null;
  granted_at: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export async function getProjectMembers(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ProjectMember[]> {
  const { data, error } = await supabase
    .from("project_memberships")
    .select("*")
    .eq("project_id", projectId);

  if (error) throw error;

  const memberships = data ?? [];
  if (memberships.length === 0) return [];

  // Enrich with profile data
  const userIds = memberships.map((m) => m.user_id);
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profilesData ?? []).map((p) => [p.id, p]),
  );

  return memberships.map((m) => ({
    ...m,
    profile: profileMap.get(m.user_id) ?? undefined,
  })) as ProjectMember[];
}

export async function addProjectMember(
  supabase: SupabaseClient<Database>,
  params: { projectId: string; userId: string; tenantId: string; grantedBy: string },
): Promise<void> {
  const { error } = await supabase.from("project_memberships").insert({
    project_id: params.projectId,
    user_id: params.userId,
    tenant_id: params.tenantId,
    granted_by: params.grantedBy,
  } as never);

  if (error) throw error;
}

export async function removeProjectMember(
  supabase: SupabaseClient<Database>,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("project_memberships")
    .delete()
    .eq("id", membershipId);

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

  const DONE_STATUSES = ["concluído", "concluido", "concluida", "concluída", "done"];
  const isDone = (d: { status: string; feito: boolean | null }) =>
    d.feito || DONE_STATUSES.includes(d.status?.toLowerCase());

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
