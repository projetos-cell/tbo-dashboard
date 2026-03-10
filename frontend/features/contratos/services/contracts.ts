import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

// ─── Filters ──────────────────────────────────────────────────────────
export interface ContractFilters {
  status?: string;
  search?: string;
  categories?: readonly string[];
}

// ─── Queries ──────────────────────────────────────────────────────────
export async function getContracts(
  supabase: SupabaseClient<Database>,
  filters?: ContractFilters
): Promise<ContractRow[]> {
  let query = supabase
    .from("contracts")
    .select()
    .order("status", { ascending: true })
    .order("monthly_value", { ascending: false, nullsFirst: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.categories?.length) {
    query = query.in("category", [...filters.categories]);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,person_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ContractRow[];
}

export async function getContractById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ContractRow | null> {
  const { data, error } = await supabase
    .from("contracts")
    .select()
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ContractRow;
}

// ─── Mutations ────────────────────────────────────────────────────────
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

// ─── KPIs ─────────────────────────────────────────────────────────────
export interface ContractKPIs {
  total: number;
  ativos: number;
  receitaAtiva: number;
  custoAtivo: number;
  expiringSoon: number;
}

export function computeContractKPIs(
  contracts: ContractRow[],
  expiringDays = 30
): ContractKPIs {
  const ativos = contracts.filter((c) => c.status === "active");

  const clienteAtivos = ativos.filter((c) => c.category === "cliente");
  const receitaAtiva = clienteAtivos.reduce(
    (s, c) => s + (c.monthly_value ?? 0),
    0
  );

  const custoAtivos = ativos.filter(
    (c) => c.category === "equipe" || c.category === "fornecedor"
  );
  const custoAtivo = custoAtivos.reduce(
    (s, c) => s + (c.monthly_value ?? 0),
    0
  );

  const now = new Date();
  const expiringSoon = contracts.filter((c) => {
    if (c.status !== "active" || !c.end_date) return false;
    const days =
      (new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= expiringDays;
  }).length;

  return {
    total: contracts.length,
    ativos: ativos.length,
    receitaAtiva,
    custoAtivo,
    expiringSoon,
  };
}

// ─── Tab-specific KPIs ────────────────────────────────────────────────
export interface TabKPIs {
  label1: string;
  value1: number | string;
  label2: string;
  value2: number | string;
  label3: string;
  value3: number | string;
  label4: string;
  value4: number | string;
}

export function computeTabKPIs(
  contracts: ContractRow[],
  tab: string
): TabKPIs {
  const ativos = contracts.filter((c) => c.status === "active");
  const now = new Date();
  const expiring = contracts.filter((c) => {
    if (c.status !== "active" || !c.end_date) return false;
    const days =
      (new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }).length;

  const totalValue = ativos.reduce((s, c) => s + (c.monthly_value ?? 0), 0);

  switch (tab) {
    case "clientes":
      return {
        label1: "Total Contratos",
        value1: contracts.length,
        label2: "Ativos",
        value2: ativos.length,
        label3: "Receita Mensal",
        value3: totalValue,
        label4: "Alertas Vencimento",
        value4: expiring,
      };
    case "terceirizados":
      return {
        label1: "Total Terceirizados",
        value1: contracts.length,
        label2: "Ativos",
        value2: ativos.length,
        label3: "Custo Mensal",
        value3: totalValue,
        label4: "Alertas Vencimento",
        value4: expiring,
      };
    case "colaboradores":
      return {
        label1: "Total Colaboradores",
        value1: contracts.length,
        label2: "Ativos",
        value2: ativos.length,
        label3: "Custo Mensal",
        value3: totalValue,
        label4: "Alertas Vencimento",
        value4: expiring,
      };
    default: {
      // Visão geral
      const clientes = contracts.filter((c) => c.category === "cliente");
      const clientesAtivos = clientes.filter((c) => c.status === "active");
      const receita = clientesAtivos.reduce(
        (s, c) => s + (c.monthly_value ?? 0),
        0
      );

      const terceiros = contracts.filter(
        (c) => c.category === "equipe" || c.category === "fornecedor"
      );
      const terceirosAtivos = terceiros.filter((c) => c.status === "active");
      const custo = terceirosAtivos.reduce(
        (s, c) => s + (c.monthly_value ?? 0),
        0
      );

      return {
        label1: "Total Contratos",
        value1: contracts.length,
        label2: "Receita Ativa",
        value2: receita,
        label3: "Custo Ativo",
        value3: custo,
        label4: "Alertas Vencimento",
        value4: expiring,
      };
    }
  }
}
