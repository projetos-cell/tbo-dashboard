import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

export interface DashboardData {
  projects: ProjectRow[];
  tasks: TaskRow[];
  demands: DemandRow[];
}

export interface DashboardKPIs {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  stoppedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
  totalDemands: number;
  uniqueClients: number;
}

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DashboardData> {
  const [projectsRes, tasksRes, demandsRes] = await Promise.all([
    supabase
      .from("projects")
      .select()
      .eq("tenant_id", tenantId)
      .order("name"),
    supabase
      .from("os_tasks")
      .select()
      .eq("tenant_id", tenantId)
      .order("due_date", { ascending: true }),
    supabase
      .from("demands")
      .select()
      .eq("tenant_id", tenantId)
      .order("due_date", { ascending: true }),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (tasksRes.error) throw tasksRes.error;
  if (demandsRes.error) throw demandsRes.error;

  return {
    projects: (projectsRes.data ?? []) as ProjectRow[],
    tasks: (tasksRes.data ?? []) as TaskRow[],
    demands: (demandsRes.data ?? []) as DemandRow[],
  };
}

export function computeKPIs(data: DashboardData): DashboardKPIs {
  const now = new Date().toISOString().split("T")[0];

  const activeProjects = data.projects.filter(
    (p) => !["finalizado", "cancelado"].includes(p.status ?? "")
  );
  const completedProjects = data.projects.filter(
    (p) => p.status === "finalizado"
  );
  const stoppedProjects = data.projects.filter(
    (p) => p.status === "parado" || p.status === "pausado"
  );

  const pendingTasks = data.tasks.filter(
    (t) => !t.is_completed && t.status !== "cancelada"
  );
  const overdueTasks = data.tasks.filter(
    (t) => !t.is_completed && t.due_date && t.due_date < now && t.status !== "cancelada"
  );
  const completedTasks = data.tasks.filter((t) => t.is_completed);

  const uniqueClients = new Set(
    data.projects.map((p) => p.construtora).filter(Boolean)
  ).size;

  return {
    totalProjects: data.projects.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    stoppedProjects: stoppedProjects.length,
    totalTasks: data.tasks.length,
    pendingTasks: pendingTasks.length,
    overdueTasks: overdueTasks.length,
    completedTasks: completedTasks.length,
    totalDemands: data.demands.length,
    uniqueClients,
  };
}
