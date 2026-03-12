import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContractSignerRow {
  id: string;
  contract_id: string;
  tenant_id: string;
  name: string;
  email: string;
  cpf: string | null;
  role: string;
  clicksign_signer_id: string | null;
  sign_status: string;
  signed_at: string | null;
  created_at: string;
}

export interface ContractSignerInsert {
  contract_id: string;
  tenant_id: string;
  name: string;
  email: string;
  cpf?: string | null;
  role?: string;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getContractSigners(
  supabase: SupabaseClient<Database>,
  contractId: string
): Promise<ContractSignerRow[]> {
  const { data, error } = await supabase
    .from("contract_signers" as never)
    .select()
    .eq("contract_id", contractId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ContractSignerRow[];
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createContractSigner(
  supabase: SupabaseClient<Database>,
  input: ContractSignerInsert
): Promise<ContractSignerRow> {
  const { data, error } = await supabase
    .from("contract_signers" as never)
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContractSignerRow;
}

export async function createContractSignersBatch(
  supabase: SupabaseClient<Database>,
  signers: ContractSignerInsert[]
): Promise<ContractSignerRow[]> {
  if (!signers.length) return [];

  const { data, error } = await supabase
    .from("contract_signers" as never)
    .insert(signers as never[])
    .select();

  if (error) throw error;
  return (data ?? []) as unknown as ContractSignerRow[];
}

export async function updateContractSigner(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<ContractSignerInsert>
): Promise<ContractSignerRow> {
  const { data, error } = await supabase
    .from("contract_signers" as never)
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContractSignerRow;
}

export async function deleteContractSigner(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("contract_signers" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}
