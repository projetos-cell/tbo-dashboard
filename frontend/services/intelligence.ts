import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface IntelligenceKpis {
  totalReceivables: number;
  totalPayables: number;
  pipelineTotal: number;
  teamCount: number;
  okrAvgProgress: number;
  openDeals: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string | null;
  category: string | null;
  confidence: number | null;
  agent_name: string;
  source_bu: string | null;
  times_applied: number | null;
  times_successful: number | null;
  created_at: string | null;
}

export interface TrendItem {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  severity: "critical" | "warning" | "ok" | "info";
  category: "tasks" | "okrs" | "pipeline" | "financial";
  href: string;
}

export interface IntelligenceTrends {
  trends: TrendItem[];
  scoredAt: string;
}

/** Aggregate KPIs across modules for the intelligence dashboard */
export async function getIntelligenceKpis(
  supabase: SupabaseClient<Database>
): Promise<IntelligenceKpis> {
  const [receivablesRes, payablesRes, dealsRes, teamRes, okrRes] =
    await Promise.all([
      // Total receivables (open)
      supabase
        .from("fin_receivables" as never)
        .select("amount" as never)
        .in("status" as never, ["pendente", "em_aberto", "aberto"] as never),
      // Total payables (open)
      supabase
        .from("fin_payables" as never)
        .select("amount" as never)
        .in("status" as never, ["pendente", "em_aberto", "aberto"] as never),
      // Pipeline deals (not closed)
      supabase
        .from("crm_deals")
        .select("value, stage")
        .not("stage", "in", '("ganho","perdido","cancelado")'),
      // Active team members
      supabase
        .from("colaboradores")
        .select("id", { count: "exact", head: true })
        .eq("status", "ativo"),
      // OKR Key Results progress
      supabase
        .from("okr_key_results")
        .select("current_value, target_value, start_value"),
    ]);

  if (receivablesRes.error) throw receivablesRes.error;
  if (payablesRes.error) throw payablesRes.error;
  if (dealsRes.error) throw dealsRes.error;
  if (teamRes.error) throw teamRes.error;
  if (okrRes.error) throw okrRes.error;

  const totalReceivables = (
    (receivablesRes.data ?? []) as unknown as Array<{ amount: number | null }>
  ).reduce((sum, r) => sum + (r.amount ?? 0), 0);

  const totalPayables = (
    (payablesRes.data ?? []) as unknown as Array<{ amount: number | null }>
  ).reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const deals = (dealsRes.data ?? []) as unknown as Array<{
    value: number | null;
    stage: string;
  }>;
  const pipelineTotal = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const openDeals = deals.length;

  const teamCount = teamRes.count ?? 0;

  // Calculate average OKR progress
  const krs = okrRes.data ?? [];
  let okrAvgProgress = 0;
  if (krs.length > 0) {
    const progressValues = krs.map((kr) => {
      const start = kr.start_value ?? 0;
      const current = kr.current_value ?? 0;
      const target = kr.target_value ?? 1;
      const range = target - start;
      if (range === 0) return 100;
      return Math.min(100, Math.max(0, ((current - start) / range) * 100));
    });
    okrAvgProgress = Math.round(
      progressValues.reduce((a, b) => a + b, 0) / progressValues.length
    );
  }

  return {
    totalReceivables,
    totalPayables,
    pipelineTotal,
    teamCount,
    okrAvgProgress,
    openDeals,
  };
}

/** Fetch AI insights stored by agents in agent_insights table */
export async function getAiInsights(
  supabase: SupabaseClient<Database>
): Promise<AiInsight[]> {
  const { data, error } = await supabase
    .from("agent_insights")
    .select(
      "id, title, description, insight_type, category, confidence, agent_name, source_bu, times_applied, times_successful, created_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as AiInsight[];
}

/** Compute trends and anomalies from real module data */
export async function getIntelligenceTrends(
  supabase: SupabaseClient<Database>
): Promise<IntelligenceTrends> {
  const now = new Date().toISOString().split("T")[0];

  const [tasksRes, demandsRes, okrRes, dealsRes] = await Promise.all([
    supabase
      .from("os_tasks")
      .select("id, is_completed, due_date, status")
      .neq("status", "cancelada"),
    supabase
      .from("demands")
      .select("id, due_date, feito, status"),
    supabase
      .from("okr_key_results")
      .select("id, current_value, target_value, start_value"),
    supabase
      .from("crm_deals")
      .select("id, value, stage, updated_at")
      .not("stage", "in", '("ganho","perdido","cancelado")'),
  ]);

  const trends: TrendItem[] = [];

  // ── Tasks anomalias ──────────────────────────────────────────────────────
  if (!tasksRes.error && tasksRes.data) {
    const tasks = tasksRes.data as Array<{
      id: string;
      is_completed: boolean | null;
      due_date: string | null;
      status: string | null;
    }>;
    const openTasks = tasks.filter((t) => !t.is_completed);
    const overdueTasks = openTasks.filter(
      (t) => t.due_date && t.due_date < now
    );
    const overdueRatio =
      openTasks.length > 0
        ? Math.round((overdueTasks.length / openTasks.length) * 100)
        : 0;

    trends.push({
      id: "tasks-overdue",
      label: "Tarefas em atraso",
      value: `${overdueTasks.length} de ${openTasks.length}`,
      detail:
        overdueRatio >= 30
          ? `${overdueRatio}% das tarefas abertas estão vencidas — atenção imediata`
          : overdueRatio >= 15
          ? `${overdueRatio}% das tarefas abertas estão vencidas`
          : `${overdueRatio}% em atraso — dentro do esperado`,
      severity:
        overdueRatio >= 30 ? "critical" : overdueRatio >= 15 ? "warning" : "ok",
      category: "tasks",
      href: "/tarefas",
    });
  }

  // ── Demandas anomalias ───────────────────────────────────────────────────
  if (!demandsRes.error && demandsRes.data) {
    const demands = demandsRes.data as Array<{
      id: string;
      due_date: string | null;
      feito: boolean | null;
      status: string | null;
    }>;
    const openDemands = demands.filter(
      (d) =>
        !d.feito && d.status !== "Concluído" && d.status !== "Concluido"
    );
    const overdueDemands = openDemands.filter(
      (d) => d.due_date && d.due_date < now
    );

    if (overdueDemands.length > 0) {
      trends.push({
        id: "demands-overdue",
        label: "Demandas vencidas",
        value: overdueDemands.length,
        detail:
          overdueDemands.length >= 5
            ? `${overdueDemands.length} demandas vencidas — alto volume`
            : `${overdueDemands.length} demandas vencidas`,
        severity: overdueDemands.length >= 5 ? "critical" : "warning",
        category: "tasks",
        href: "/projetos",
      });
    }
  }

  // ── OKRs anomalias ───────────────────────────────────────────────────────
  if (!okrRes.error && okrRes.data) {
    const krs = okrRes.data as Array<{
      id: string;
      current_value: number | null;
      target_value: number | null;
      start_value: number | null;
    }>;

    if (krs.length > 0) {
      const progressValues = krs.map((kr) => {
        const start = kr.start_value ?? 0;
        const current = kr.current_value ?? 0;
        const target = kr.target_value ?? 1;
        const range = target - start;
        if (range === 0) return current >= target ? 100 : 0;
        return Math.min(100, Math.max(0, ((current - start) / range) * 100));
      });
      const avgProgress = Math.round(
        progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      );
      const atRisk = progressValues.filter((p) => p < 40).length;

      trends.push({
        id: "okr-progress",
        label: "Progresso OKRs",
        value: `${avgProgress}%`,
        detail:
          atRisk > 0
            ? `${atRisk} KR${atRisk > 1 ? "s" : ""} abaixo de 40% — em risco`
            : `Média de ${avgProgress}% — dentro do ciclo`,
        severity:
          atRisk >= 3 ? "critical" : atRisk >= 1 ? "warning" : avgProgress >= 60 ? "ok" : "info",
        category: "okrs",
        href: "/okrs",
      });
    }
  }

  // ── Pipeline anomalias ───────────────────────────────────────────────────
  if (!dealsRes.error && dealsRes.data) {
    const deals = dealsRes.data as Array<{
      id: string;
      value: number | null;
      stage: string | null;
      updated_at: string | null;
    }>;

    // Deals without activity in 14+ days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const stalledDeals = deals.filter(
      (d) =>
        !d.updated_at ||
        new Date(d.updated_at) < cutoff
    );

    trends.push({
      id: "pipeline-stalled",
      label: "Deals parados",
      value: stalledDeals.length,
      detail:
        stalledDeals.length >= 3
          ? `${stalledDeals.length} deals sem atividade há 14+ dias`
          : stalledDeals.length > 0
          ? `${stalledDeals.length} deal${stalledDeals.length > 1 ? "s" : ""} parado${stalledDeals.length > 1 ? "s" : ""} há 14+ dias`
          : "Todos os deals têm atividade recente",
      severity:
        stalledDeals.length >= 3
          ? "warning"
          : stalledDeals.length > 0
          ? "info"
          : "ok",
      category: "pipeline",
      href: "/comercial",
    });

    const pipelineTotal = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
    if (pipelineTotal > 0) {
      trends.push({
        id: "pipeline-total",
        label: "Pipeline ativo",
        value: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(pipelineTotal),
        detail: `${deals.length} deal${deals.length !== 1 ? "s" : ""} em aberto`,
        severity: "info",
        category: "pipeline",
        href: "/comercial",
      });
    }
  }

  return { trends, scoredAt: new Date().toISOString() };
}
