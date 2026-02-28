import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type InteractionRow = Database["public"]["Tables"]["client_interactions"]["Row"];

export async function getClients(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    search?: string;
    segment?: string;
  }
): Promise<ClientRow[]> {
  let query = supabase
    .from("clients")
    .select()
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.segment) query = query.eq("segment", filters.segment);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

export async function getClientById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<ClientRow | null> {
  const { data, error } = await supabase
    .from("clients")
    .select()
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data as ClientRow;
}

export async function createClient(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["clients"]["Insert"]
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ClientRow;
}

export async function updateClient(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["clients"]["Update"]
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ClientRow;
}

export async function getClientInteractions(
  supabase: SupabaseClient<Database>,
  clientId: string,
  tenantId: string
): Promise<InteractionRow[]> {
  const { data, error } = await supabase
    .from("client_interactions")
    .select()
    .eq("client_id", clientId)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InteractionRow[];
}

export async function createInteraction(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["client_interactions"]["Insert"]
): Promise<InteractionRow> {
  const { data, error } = await supabase
    .from("client_interactions")
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as InteractionRow;
}

export interface ClientKPIs {
  total: number;
  ativos: number;
  leads: number;
  vip: number;
  bySegment: Record<string, number>;
}

export function computeClientKPIs(clients: ClientRow[]): ClientKPIs {
  const ativos = clients.filter((c) => c.status === "ativo" || c.status === "vip");
  const leads = clients.filter((c) => c.status === "lead" || c.status === "prospect");
  const vip = clients.filter((c) => c.status === "vip");
  const bySegment: Record<string, number> = {};
  for (const c of clients) {
    if (c.segment) bySegment[c.segment] = (bySegment[c.segment] ?? 0) + 1;
  }

  return {
    total: clients.length,
    ativos: ativos.length,
    leads: leads.length,
    vip: vip.length,
    bySegment,
  };
}
