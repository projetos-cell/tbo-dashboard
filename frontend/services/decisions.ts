import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

const FULL_COLS = "*";

export async function getDecisions(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DecisionRow[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getDecisionById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<DecisionRow | null> {
  const { data, error } = await supabase
    .from("decisions")
    .select(FULL_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createDecision(
  supabase: SupabaseClient<Database>,
  decision: Database["public"]["Tables"]["decisions"]["Insert"]
): Promise<DecisionRow> {
  const { data, error } = await supabase
    .from("decisions")
    .insert(decision as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDecision(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["decisions"]["Update"]
): Promise<DecisionRow> {
  const { data, error } = await supabase
    .from("decisions")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDecision(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw error;
}
