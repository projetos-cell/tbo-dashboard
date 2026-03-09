import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const FULL_COLS = "*";

export async function getDemandById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<DemandRow | null> {
  const { data, error } = await supabase
    .from("demands")
    .select(FULL_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createDemand(
  supabase: SupabaseClient<Database>,
  demand: Database["public"]["Tables"]["demands"]["Insert"]
): Promise<DemandRow> {
  const { data, error } = await supabase
    .from("demands")
    .insert(demand as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDemand(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["demands"]["Update"]
): Promise<DemandRow> {
  const { data, error } = await supabase
    .from("demands")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDemand(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("demands").delete().eq("id", id);
  if (error) throw error;
}
