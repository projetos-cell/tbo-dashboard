import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type MarketResearchRow = Database["public"]["Tables"]["market_research"]["Row"];
type MarketSourceRow = Database["public"]["Tables"]["market_sources"]["Row"];

// ── Research ──────────────────────────────────────────────────

export async function listResearch(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    category?: string;
    status?: string;
    search?: string;
  }
): Promise<MarketResearchRow[]> {
  let query = supabase
    .from("market_research")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search)
    query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MarketResearchRow[];
}

export async function getResearchById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<MarketResearchRow | null> {
  const { data, error } = await supabase
    .from("market_research")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as MarketResearchRow;
}

export async function createResearch(
  supabase: SupabaseClient<Database>,
  research: Database["public"]["Tables"]["market_research"]["Insert"]
): Promise<MarketResearchRow> {
  const { data, error } = await supabase
    .from("market_research")
    .insert(research as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as MarketResearchRow;
}

export async function updateResearch(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["market_research"]["Update"]
): Promise<MarketResearchRow> {
  const { data, error } = await supabase
    .from("market_research")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as MarketResearchRow;
}

export async function deleteResearch(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("market_research")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Sources ───────────────────────────────────────────────────

export async function listSources(
  supabase: SupabaseClient<Database>,
  researchId: string
): Promise<MarketSourceRow[]> {
  const { data, error } = await supabase
    .from("market_sources")
    .select("*")
    .eq("research_id", researchId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MarketSourceRow[];
}

export async function createSource(
  supabase: SupabaseClient<Database>,
  source: Database["public"]["Tables"]["market_sources"]["Insert"]
): Promise<MarketSourceRow> {
  const { data, error } = await supabase
    .from("market_sources")
    .insert(source as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as MarketSourceRow;
}

export async function deleteSource(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("market_sources")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── KPI helpers (client-side aggregation) ─────────────────────

export interface MercadoKPIs {
  totalResearch: number;
  thisMonth: number;
  byStatus: Record<string, number>;
}

export function computeMercadoKPIs(
  research: MarketResearchRow[]
): MercadoKPIs {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const thisMonth = research.filter(
    (r) => r.created_at && r.created_at >= monthStart
  ).length;

  const byStatus: Record<string, number> = {};
  for (const r of research) {
    const s = r.status ?? "sem_status";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }

  return {
    totalResearch: research.length,
    thisMonth,
    byStatus,
  };
}
