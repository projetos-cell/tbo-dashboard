import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  MarketingKPI,
  FunnelStage,
  ChannelAttribution,
  MarketingReport,
} from "../types/marketing";

type Client = SupabaseClient<Database>;

// NOTE: These tables (marketing_kpis, marketing_funnel, marketing_attribution,
// marketing_reports) will be created via migration. Until then, queries use
// `as never` to bypass strict DB typing.

// ── KPIs ───────────────────────────────────────────────────────────

export async function getMarketingKPIs(
  supabase: Client,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _period?: string,
): Promise<MarketingKPI[]> {
  // TODO: filter by _period when marketing_kpis table supports date ranges
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_kpis")
    .select("*")
    .order("label");
  if (error) throw error;
  return (data ?? []) as MarketingKPI[];
}

// ── Funnel ─────────────────────────────────────────────────────────

export async function getFunnelData(
  supabase: Client,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _period?: string,
): Promise<FunnelStage[]> {
  // TODO: filter by _period when marketing_funnel table supports date ranges
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_funnel")
    .select("*")
    .order("stage");
  if (error) throw error;
  return (data ?? []) as FunnelStage[];
}

// ── Attribution ────────────────────────────────────────────────────

export async function getChannelAttribution(supabase: Client): Promise<ChannelAttribution[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_attribution")
    .select("*")
    .order("revenue", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChannelAttribution[];
}

// ── Reports ────────────────────────────────────────────────────────

export async function getMarketingReports(supabase: Client): Promise<MarketingReport[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MarketingReport[];
}

export async function getMarketingReport(
  supabase: Client,
  id: string,
): Promise<MarketingReport> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_reports")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as MarketingReport;
}

export async function createMarketingReport(
  supabase: Client,
  report: Omit<MarketingReport, "id" | "created_at">,
): Promise<MarketingReport> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_reports")
    .insert(report)
    .select()
    .single();
  if (error) throw error;
  return data as MarketingReport;
}
