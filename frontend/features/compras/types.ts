// ─── Compras & Fornecedores — Domain Types ────────────────────────────────────

export type PedidoStatus =
  | "rascunho"
  | "aguardando_aprovacao"
  | "aprovado"
  | "rejeitado"
  | "em_andamento"
  | "concluido"
  | "cancelado";

export type PedidoPrioridade = "baixa" | "media" | "alta" | "urgente";

export type DecisaoAprovacao =
  | "aprovado"
  | "rejeitado"
  | "solicitado_revisao";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface VendorCategory {
  id: string;
  tenant_id: string;
  name: string;
  color: string | null;
  sort_order: number;
  created_at?: string | null;
}

export interface Vendor {
  id: string;
  tenant_id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  notes: string | null;
  is_active: boolean | null;
  omie_id: string | null;
  omie_synced_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Pedido {
  id: string;
  tenant_id: string;
  vendor_id: string | null;
  titulo: string;
  descricao: string | null;
  status: PedidoStatus;
  prioridade: PedidoPrioridade;
  categoria_id: string | null;
  valor_estimado: number | null;
  valor_final: number | null;
  data_solicitacao: string | null;
  data_necessidade: string | null;
  data_aprovacao: string | null;
  aprovado_por: string | null;
  criado_por: string | null;
  sort_order: number;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // joined fields
  vendor?: Pick<Vendor, "id" | "name" | "cnpj"> | null;
}

export interface PedidoItem {
  id: string;
  tenant_id: string;
  pedido_id: string;
  descricao: string;
  quantidade: number;
  unidade: string | null;
  valor_unit: number | null;
  sort_order: number;
  created_at?: string | null;
}

export interface Aprovacao {
  id: string;
  tenant_id: string;
  pedido_id: string;
  aprovador: string | null;
  decisao: DecisaoAprovacao;
  comentario: string | null;
  created_at?: string | null;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  PedidoStatus,
  { label: string; color: string; badge: "default" | "secondary" | "outline" | "destructive" }
> = {
  rascunho: { label: "Rascunho", color: "#6b7280", badge: "secondary" },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "#f59e0b", badge: "outline" },
  aprovado: { label: "Aprovado", color: "#22c55e", badge: "default" },
  rejeitado: { label: "Rejeitado", color: "#ef4444", badge: "destructive" },
  em_andamento: { label: "Em Andamento", color: "#3b82f6", badge: "default" },
  concluido: { label: "Concluído", color: "#10b981", badge: "default" },
  cancelado: { label: "Cancelado", color: "#9ca3af", badge: "secondary" },
};

export const PRIORIDADE_CONFIG: Record<
  PedidoPrioridade,
  { label: string; color: string; sort: number }
> = {
  urgente: { label: "Urgente", color: "#ef4444", sort: 0 },
  alta: { label: "Alta", color: "#f59e0b", sort: 1 },
  media: { label: "Média", color: "#3b82f6", sort: 2 },
  baixa: { label: "Baixa", color: "#6b7280", sort: 3 },
};

export const DECISAO_CONFIG: Record<
  DecisaoAprovacao,
  { label: string; color: string }
> = {
  aprovado: { label: "Aprovado", color: "#22c55e" },
  rejeitado: { label: "Rejeitado", color: "#ef4444" },
  solicitado_revisao: { label: "Revisão Solicitada", color: "#f59e0b" },
};
