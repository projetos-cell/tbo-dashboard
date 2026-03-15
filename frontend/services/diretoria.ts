import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ExecutiveKpis {
  mrr: number;
  totalPayables: number;
  marginPercent: number;
  teamCount: number;
  burnRate: number;
  pipelineTotal: number;
  openDeals: number;
  okrAvgProgress: number;
}

/** Aggregate executive KPIs for the board dashboard */
export async function getExecutiveKpis(
  supabase: SupabaseClient<Database>
): Promise<ExecutiveKpis> {
  const [receivablesRes, payablesRes, paidPayablesRes, dealsRes, teamRes, okrRes] =
    await Promise.all([
      // All receivables for MRR approximation
      supabase
        .from("fin_receivables" as never)
        .select("amount, status" as never),
      // Open payables
      supabase
        .from("fin_payables" as never)
        .select("amount, status" as never)
        .in("status" as never, ["pendente", "em_aberto", "aberto"] as never),
      // Paid payables this month for burn rate
      supabase
        .from("fin_payables" as never)
        .select("amount" as never)
        .eq("status" as never, "pago" as never),
      // Pipeline deals
      supabase
        .from("crm_deals")
        .select("value, stage")
        .not("stage", "in", '("ganho","perdido","cancelado")'),
      // Team count
      supabase
        .from("colaboradores")
        .select("id", { count: "exact", head: true })
        .eq("status", "ativo"),
      // OKR progress
      supabase
        .from("okr_key_results")
        .select("current_value, target_value, start_value"),
    ]);

  if (receivablesRes.error) throw receivablesRes.error;
  if (payablesRes.error) throw payablesRes.error;
  if (paidPayablesRes.error) throw paidPayablesRes.error;
  if (dealsRes.error) throw dealsRes.error;
  if (teamRes.error) throw teamRes.error;
  if (okrRes.error) throw okrRes.error;

  const receivables = (receivablesRes.data ?? []) as unknown as Array<{ amount: number | null; status: string }>;
  const mrr = receivables.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  const totalPayables = ((payablesRes.data ?? []) as unknown as Array<{ amount: number | null }>).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  const burnRate = ((paidPayablesRes.data ?? []) as unknown as Array<{ amount: number | null }>).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  // Margin = (receivables - payables) / receivables
  const marginPercent =
    mrr > 0 ? Math.round(((mrr - totalPayables) / mrr) * 100) : 0;

  const deals = (dealsRes.data ?? []) as unknown as Array<{ value: number | null; stage: string }>;
  const pipelineTotal = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const openDeals = deals.length;

  const teamCount = teamRes.count ?? 0;

  // OKR progress
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
    mrr,
    totalPayables,
    marginPercent,
    teamCount,
    burnRate,
    pipelineTotal,
    openDeals,
    okrAvgProgress,
  };
}
