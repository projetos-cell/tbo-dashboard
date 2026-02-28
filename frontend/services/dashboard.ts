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

/* ---------- Founder dashboard extended data ---------- */

export interface FinancialEntry {
  id: string;
  date: string;
  type: "receita" | "despesa";
  category: string | null;
  amount: number;
  description: string | null;
}

export interface OkrSnapshot {
  objectiveId: string;
  objectiveTitle: string;
  progress: number;
  keyResultsCount: number;
  keyResultsCompleted: number;
}

export interface AlertItem {
  id: string;
  type: "overdue_task" | "stalled_project" | "okr_at_risk" | "overdue_demand";
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  href: string;
}

export interface FounderDashboardData extends DashboardData {
  financial: FinancialEntry[];
  okrSnapshots: OkrSnapshot[];
  alerts: AlertItem[];
}

/* ---------- Fetch functions ---------- */

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

export async function getFounderDashboardData(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<FounderDashboardData> {
  const baseData = await getDashboardData(supabase, tenantId);

  // Fetch financial entries (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const finRes = await supabase
    .from("financial_entries" as never)
    .select("id, date, type, category, amount, description")
    .eq("tenant_id", tenantId)
    .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Fetch OKR objectives + key results for active cycle
  const cycleRes = await supabase
    .from("okr_cycles" as never)
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  let okrSnapshots: OkrSnapshot[] = [];
  if (cycleRes.data) {
    const objRes = await supabase
      .from("okr_objectives" as never)
      .select("id, title, progress")
      .eq("tenant_id", tenantId)
      .eq("cycle_id", (cycleRes.data as Record<string, unknown>).id as string);

    if (objRes.data) {
      const objectives = objRes.data as Array<{
        id: string;
        title: string;
        progress: number;
      }>;
      for (const obj of objectives) {
        const krRes = await supabase
          .from("okr_key_results" as never)
          .select("id, current_value, target_value")
          .eq("objective_id", obj.id);
        const krs = (krRes.data ?? []) as Array<{
          id: string;
          current_value: number;
          target_value: number;
        }>;
        const completed = krs.filter(
          (kr) => kr.current_value >= kr.target_value
        ).length;
        okrSnapshots.push({
          objectiveId: obj.id,
          objectiveTitle: obj.title,
          progress: obj.progress ?? 0,
          keyResultsCount: krs.length,
          keyResultsCompleted: completed,
        });
      }
    }
  }

  // Build alerts
  const now = new Date().toISOString().split("T")[0];
  const alerts: AlertItem[] = [];

  // Overdue tasks (high severity)
  const overdueTasks = baseData.tasks.filter(
    (t) =>
      !t.is_completed &&
      t.due_date &&
      t.due_date < now &&
      t.status !== "cancelada"
  );
  overdueTasks.slice(0, 5).forEach((t) => {
    alerts.push({
      id: `task-${t.id}`,
      type: "overdue_task",
      title: t.title ?? "Tarefa sem titulo",
      detail: `Venceu em ${t.due_date}`,
      severity: "high",
      href: "/tarefas",
    });
  });

  // Stalled projects
  const stalledProjects = baseData.projects.filter(
    (p) => p.status === "parado" || p.status === "pausado"
  );
  stalledProjects.slice(0, 3).forEach((p) => {
    alerts.push({
      id: `project-${p.id}`,
      type: "stalled_project",
      title: p.name ?? "Projeto sem nome",
      detail: `Status: ${p.status}`,
      severity: "medium",
      href: `/projetos/${p.id}`,
    });
  });

  // OKRs at risk (progress < 30% for active cycle)
  okrSnapshots
    .filter((o) => o.progress < 30)
    .slice(0, 3)
    .forEach((o) => {
      alerts.push({
        id: `okr-${o.objectiveId}`,
        type: "okr_at_risk",
        title: o.objectiveTitle,
        detail: `Progresso: ${o.progress}%`,
        severity: "medium",
        href: "/okrs",
      });
    });

  // Overdue demands
  const overdueDemands = baseData.demands.filter(
    (d: Record<string, unknown>) =>
      d.due_date && (d.due_date as string) < now && d.status !== "concluida" && d.status !== "cancelada"
  );
  overdueDemands.slice(0, 3).forEach((d: Record<string, unknown>) => {
    alerts.push({
      id: `demand-${d.id}`,
      type: "overdue_demand",
      title: (d.title as string) ?? "Demanda",
      detail: `Venceu em ${d.due_date}`,
      severity: "high",
      href: "/entregas",
    });
  });

  return {
    ...baseData,
    financial: ((finRes.data as FinancialEntry[]) ?? []),
    okrSnapshots,
    alerts: alerts.sort((a, b) =>
      a.severity === "high" && b.severity !== "high" ? -1 : 0
    ),
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
    (t) =>
      !t.is_completed &&
      t.due_date &&
      t.due_date < now &&
      t.status !== "cancelada"
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
