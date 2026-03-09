import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

export async function getContracts(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    search?: string;
    clientId?: string;
  }
): Promise<ContractRow[]> {
  let query = supabase
    .from("contracts")
    .select()
    .eq("tenant_id", tenantId)
    .order("monthly_value", { ascending: false, nullsFirst: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.clientId) query = query.eq("client_id", filters.clientId);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ContractRow[];
}

export async function getContractById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<ContractRow | null> {
  const { data, error } = await supabase
    .from("contracts")
    .select()
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data as ContractRow;
}

export async function createContract(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["contracts"]["Insert"]
): Promise<ContractRow> {
  const { data, error } = await supabase
    .from("contracts")
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContractRow;
}

export async function updateContract(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["contracts"]["Update"]
): Promise<ContractRow> {
  const { data, error } = await supabase
    .from("contracts")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContractRow;
}

export interface ContractKPIs {
  total: number;
  ativos: number;
  totalValue: number;
  ativosValue: number;
  expiringSoon: number;
  ticketMedio: number;
}

export function computeContractKPIs(
  contracts: ContractRow[],
  expiringDays = 30
): ContractKPIs {
  const ativos = contracts.filter((c) => c.status === "ativo");
  const totalValue = contracts.reduce((s, c) => s + (c.monthly_value ?? 0), 0);
  const ativosValue = ativos.reduce((s, c) => s + (c.monthly_value ?? 0), 0);
  const withValue = contracts.filter((c) => (c.monthly_value ?? 0) > 0);
  const ticketMedio = withValue.length > 0 ? totalValue / withValue.length : 0;

  const now = new Date();
  const expiringSoon = contracts.filter((c) => {
    if (c.status !== "ativo" || !c.end_date) return false;
    const days =
      (new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= expiringDays;
  }).length;

  return {
    total: contracts.length,
    ativos: ativos.length,
    totalValue,
    ativosValue,
    expiringSoon,
    ticketMedio,
  };
}
