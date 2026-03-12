import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContractEventRow {
  id: string;
  contract_id: string;
  tenant_id: string;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  source: string;
  user_id: string | null;
  created_at: string;
}

export interface ContractEventInsert {
  contract_id: string;
  tenant_id: string;
  event_type: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  source?: string;
  user_id?: string | null;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getContractEvents(
  supabase: SupabaseClient<Database>,
  contractId: string
): Promise<ContractEventRow[]> {
  const { data, error } = await supabase
    .from("contract_events" as never)
    .select()
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ContractEventRow[];
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createContractEvent(
  supabase: SupabaseClient<Database>,
  input: ContractEventInsert
): Promise<ContractEventRow> {
  const { data, error } = await supabase
    .from("contract_events" as never)
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContractEventRow;
}
