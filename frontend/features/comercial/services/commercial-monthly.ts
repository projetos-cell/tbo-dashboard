import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type MonthlyRow = Database["public"]["Tables"]["commercial_monthly_data"]["Row"];
type MonthlyInsert = Database["public"]["Tables"]["commercial_monthly_data"]["Insert"];
type MonthlyUpdate = Database["public"]["Tables"]["commercial_monthly_data"]["Update"];

export type { MonthlyRow };

// ── Get monthly data for a specific month ────────────────────────────────────
export async function getMonthlyData(
  supabase: SupabaseClient<Database>,
  yearMonth: string,
): Promise<MonthlyRow | null> {
  const { data, error } = await supabase
    .from("commercial_monthly_data" as never)
    .select("*")
    .eq("year_month", yearMonth)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as MonthlyRow | null;
}

// ── Upsert monthly data ─────────────────────────────────────────────────────
export async function upsertMonthlyData(
  supabase: SupabaseClient<Database>,
  payload: MonthlyInsert,
): Promise<MonthlyRow> {
  const { data, error } = await supabase
    .from("commercial_monthly_data" as never)
    .upsert(payload as never, { onConflict: "tenant_id,year_month" })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as MonthlyRow;
}

// ── Get RD snapshot metrics for a given month ────────────────────────────────
export async function getRdMonthlySnapshot(
  supabase: SupabaseClient<Database>,
  yearMonth: string,
) {
  // Parse year-month to get date range
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // Count leads (all deals created in this month)
  const { count: leadsTotal } = await supabase
    .from("crm_deals")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Won deals in this month
  const { data: wonDeals } = await supabase
    .from("crm_deals")
    .select("value")
    .eq("stage", "fechado_ganho")
    .gte("updated_at", startDate)
    .lte("updated_at", endDate);

  const wonRows = (wonDeals ?? []) as Array<{ value: number | null }>;
  const dealsWon = wonRows.length;
  const dealsWonValue = wonRows.reduce((sum, d) => sum + (d.value ?? 0), 0);

  // Current pipeline value (active deals)
  const { data: activeDeals } = await supabase
    .from("crm_deals")
    .select("value, probability")
    .not("stage", "in", "(fechado_ganho,fechado_perdido)");

  const activeRows = (activeDeals ?? []) as Array<{
    value: number | null;
    probability: number | null;
  }>;
  const pipelineValue = activeRows.reduce(
    (sum, d) => sum + (d.value ?? 0),
    0,
  );

  // Conversion rate (won / closed in this month)
  const { count: closedTotal } = await supabase
    .from("crm_deals")
    .select("*", { count: "exact", head: true })
    .in("stage", ["fechado_ganho", "fechado_perdido"])
    .gte("updated_at", startDate)
    .lte("updated_at", endDate);

  const conversionRate =
    (closedTotal ?? 0) > 0
      ? (dealsWon / (closedTotal ?? 1)) * 100
      : 0;

  return {
    rd_leads_total: leadsTotal ?? 0,
    rd_deals_won: dealsWon,
    rd_deals_won_value: dealsWonValue,
    rd_pipeline_value: pipelineValue,
    rd_conversion_rate: Math.round(conversionRate * 100) / 100,
  };
}

// ── Computed KPIs (cross-reference manual + RD) ──────────────────────────────
export interface ComputedCommercialKPIs {
  // Eficiência de reuniões
  taxaRealizacao: number; // realizadas / agendadas * 100
  // Conversão reunião → venda
  taxaConversaoReuniao: number; // vendas_quantidade / realizadas * 100
  // Ticket médio
  ticketMedio: number; // vendas_valor / vendas_quantidade
  // CPL estimado (se tiver custo de marketing futuro)
  totalLeads: number; // inbound + outbound
  // Taxa de conversão lead → venda
  taxaConversaoLead: number; // vendas_quantidade / totalLeads * 100
  // RD data
  rdConversionRate: number;
  rdPipelineValue: number;
  rdDealsWonValue: number;
}

export function computeCommercialKPIs(
  data: Partial<MonthlyRow>,
): ComputedCommercialKPIs {
  const agendadas = data.reunioes_agendadas ?? 0;
  const realizadas = data.reunioes_realizadas ?? 0;
  const qtd = data.vendas_quantidade ?? 0;
  const valor = data.vendas_valor ?? 0;
  const outbound = data.prospeccoes_outbound ?? 0;
  const inbound = data.leads_inbound ?? 0;
  const totalLeads = outbound + inbound;

  return {
    taxaRealizacao: agendadas > 0 ? (realizadas / agendadas) * 100 : 0,
    taxaConversaoReuniao: realizadas > 0 ? (qtd / realizadas) * 100 : 0,
    ticketMedio: qtd > 0 ? valor / qtd : 0,
    totalLeads,
    taxaConversaoLead: totalLeads > 0 ? (qtd / totalLeads) * 100 : 0,
    rdConversionRate: data.rd_conversion_rate ?? 0,
    rdPipelineValue: data.rd_pipeline_value ?? 0,
    rdDealsWonValue: data.rd_deals_won_value ?? 0,
  };
}
