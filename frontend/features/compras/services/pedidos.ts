import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Pedido, PedidoItem, Aprovacao } from "../types";

type Sb = SupabaseClient<Database>;

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export async function getPedidos(supabase: Sb): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("compras_pedidos")
    .select(`
      *,
      vendor:fin_vendors(id, name, cnpj)
    `)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Pedido[];
}

export async function getPedido(supabase: Sb, id: string): Promise<Pedido> {
  const { data, error } = await supabase
    .from("compras_pedidos")
    .select(`
      *,
      vendor:fin_vendors(id, name, cnpj)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Pedido;
}

export async function createPedido(
  supabase: Sb,
  input: Omit<Pedido, "id" | "created_at" | "updated_at" | "vendor">
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("compras_pedidos")
    .insert(input)
    .select(`*, vendor:fin_vendors(id, name, cnpj)`)
    .single();
  if (error) throw error;
  return data as unknown as Pedido;
}

export async function updatePedido(
  supabase: Sb,
  id: string,
  updates: Partial<Omit<Pedido, "id" | "tenant_id" | "created_at" | "updated_at" | "vendor">>
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("compras_pedidos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`*, vendor:fin_vendors(id, name, cnpj)`)
    .single();
  if (error) throw error;
  return data as unknown as Pedido;
}

export async function deletePedido(supabase: Sb, id: string): Promise<void> {
  const { error } = await supabase
    .from("compras_pedidos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderPedidos(
  supabase: Sb,
  items: { id: string; sort_order: number }[]
): Promise<void> {
  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("compras_pedidos").update({ sort_order }).eq("id", id)
    )
  );
}

// ─── Pedido Items ─────────────────────────────────────────────────────────────

export async function getPedidoItens(supabase: Sb, pedidoId: string): Promise<PedidoItem[]> {
  const { data, error } = await supabase
    .from("compras_itens")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PedidoItem[];
}

export async function upsertPedidoItens(
  supabase: Sb,
  pedidoId: string,
  items: Omit<PedidoItem, "id" | "created_at">[]
): Promise<PedidoItem[]> {
  // Delete existing items first, then re-insert
  const { error: deleteErr } = await supabase
    .from("compras_itens")
    .delete()
    .eq("pedido_id", pedidoId);
  if (deleteErr) throw deleteErr;

  if (items.length === 0) return [];

  const { data, error } = await supabase
    .from("compras_itens")
    .insert(items)
    .select();
  if (error) throw error;
  return (data ?? []) as PedidoItem[];
}

// ─── Aprovacoes ───────────────────────────────────────────────────────────────

export async function getAprovacoes(supabase: Sb, pedidoId: string): Promise<Aprovacao[]> {
  const { data, error } = await supabase
    .from("compras_aprovacoes")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Aprovacao[];
}

export async function criarAprovacao(
  supabase: Sb,
  input: Omit<Aprovacao, "id" | "created_at">
): Promise<Aprovacao> {
  const { data, error } = await supabase
    .from("compras_aprovacoes")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Aprovacao;
}
