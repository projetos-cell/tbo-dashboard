import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealFilters {
  stage?: string;
  search?: string;
  owner_id?: string;
}

export async function getDeals(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: DealFilters,
) {
  let query = supabase
    .from("crm_deals")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (filters?.stage) {
    query = query.eq("stage", filters.stage);
  }
  if (filters?.owner_id) {
    query = query.eq("owner_id", filters.owner_id);
  }
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,contact.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as DealRow[];
}

export async function getDealById(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { data, error } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DealRow;
}

export async function createDeal(
  supabase: SupabaseClient<Database>,
  deal: Database["public"]["Tables"]["crm_deals"]["Insert"],
) {
  const { data, error } = await supabase
    .from("crm_deals")
    .insert(deal as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as DealRow;
}

export async function updateDeal(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["crm_deals"]["Update"],
) {
  const { data, error } = await supabase
    .from("crm_deals")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as DealRow;
}

export async function updateDealStage(
  supabase: SupabaseClient<Database>,
  id: string,
  stage: string,
) {
  return updateDeal(supabase, id, { stage });
}

const CLOSED_STAGES = ["fechado_ganho", "fechado_perdido"];

export function computeDealKPIs(deals: DealRow[]) {
  const activeDeals = deals.filter((d) => !CLOSED_STAGES.includes(d.stage));
  const wonDeals = deals.filter((d) => d.stage === "fechado_ganho");
  const lostDeals = deals.filter((d) => d.stage === "fechado_perdido");
  const totalClosed = wonDeals.length + lostDeals.length;

  const pipelineValue = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const wonValue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const forecast = activeDeals.reduce(
    (s, d) => s + ((d.value ?? 0) * (d.probability ?? 0)) / 100,
    0,
  );
  const conversionRate =
    totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;

  return {
    total: deals.length,
    active: activeDeals.length,
    won: wonDeals.length,
    lost: lostDeals.length,
    pipelineValue,
    wonValue,
    forecast,
    conversionRate,
  };
}
