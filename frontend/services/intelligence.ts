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

/** Aggregate KPIs across modules for the intelligence dashboard */
export async function getIntelligenceKpis(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<IntelligenceKpis> {
  const [receivablesRes, payablesRes, dealsRes, teamRes, okrRes] =
    await Promise.all([
      // Total receivables (open)
      supabase
        .from("fin_receivables")
        .select("amount")
        .eq("tenant_id", tenantId)
        .in("status", ["pendente", "em_aberto", "aberto"]),
      // Total payables (open)
      supabase
        .from("fin_payables")
        .select("amount")
        .eq("tenant_id", tenantId)
        .in("status", ["pendente", "em_aberto", "aberto"]),
      // Pipeline deals (not closed)
      supabase
        .from("crm_deals")
        .select("value, stage")
        .eq("tenant_id", tenantId)
        .not("stage", "in", '("ganho","perdido","cancelado")'),
      // Active team members
      supabase
        .from("colaboradores")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("status", "ativo"),
      // OKR Key Results progress
      supabase
        .from("okr_key_results")
        .select("current_value, target_value, start_value")
        .eq("tenant_id", tenantId),
    ]);

  if (receivablesRes.error) throw receivablesRes.error;
  if (payablesRes.error) throw payablesRes.error;
  if (dealsRes.error) throw dealsRes.error;
  if (teamRes.error) throw teamRes.error;
  if (okrRes.error) throw okrRes.error;

  const totalReceivables = (receivablesRes.data ?? []).reduce(
    (sum, r) => sum + (r.amount ?? 0),
    0
  );
  const totalPayables = (payablesRes.data ?? []).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  const deals = dealsRes.data ?? [];
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
