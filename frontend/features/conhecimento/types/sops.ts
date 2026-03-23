export type SOPBu =
  | "digital-3d"
  | "branding"
  | "marketing"
  | "audiovisual"
  | "gamificacao"
  | "operacoes"
  | "atendimento"
  | "comercial"
  | "financeiro"
  | "recursos-humanos"
  | "relacionamentos"
  | "politicas"
  | "geral";

export type SOPCategory = "processo" | "checklist" | "referencia" | "troubleshooting";

export type SOPStatus = "draft" | "published" | "archived" | "review";

export type SOPPriority = "critical" | "high" | "medium" | "low";

export type SOPStepType = "step" | "warning" | "tip" | "note" | "checkpoint";

export interface SOP {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  bu: SOPBu;
  category: SOPCategory;
  description: string | null;
  content: string | null;
  content_html: string | null;
  author_id: string | null;
  status: SOPStatus;
  priority: SOPPriority;
  tags: string[];
  order_index: number;
  version: number;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SOPVersion {
  id: string;
  sop_id: string;
  version: number;
  title: string;
  content: string | null;
  edited_by: string | null;
  change_summary: string | null;
  created_at: string;
}

export interface SOPStep {
  id: string;
  sop_id: string;
  title: string;
  content: string | null;
  content_html: string | null;
  order_index: number;
  step_type: SOPStepType;
  media_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SOPInsert = Omit<SOP, "id" | "created_at" | "updated_at" | "version" | "last_reviewed_at" | "last_reviewed_by"> & {
  last_reviewed_at?: string | null;
  last_reviewed_by?: string | null;
};

export type SOPUpdate = Partial<Omit<SOP, "id" | "tenant_id" | "created_at">>;

export type SOPStepInsert = Omit<SOPStep, "id" | "created_at" | "updated_at">;

export type SOPStepUpdate = Partial<Omit<SOPStep, "id" | "sop_id" | "created_at">>;

export const SOP_BU_CONFIG: Record<SOPBu, { label: string; color: string; icon: string }> = {
  "digital-3d": { label: "Digital 3D", color: "#8b5cf6", icon: "cube" },
  branding: { label: "Branding", color: "#f59e0b", icon: "palette" },
  marketing: { label: "Marketing", color: "#10b981", icon: "speakerphone" },
  audiovisual: { label: "Audiovisual", color: "#ef4444", icon: "video" },
  gamificacao: { label: "Gamificação", color: "#ec4899", icon: "device-gamepad-2" },
  operacoes: { label: "Operações", color: "#6366f1", icon: "settings" },
  atendimento: { label: "Atendimento", color: "#14b8a6", icon: "headset" },
  comercial: { label: "Comercial", color: "#f97316", icon: "chart-line" },
  financeiro: { label: "Financeiro", color: "#22c55e", icon: "currency-dollar" },
  "recursos-humanos": { label: "Recursos Humanos", color: "#a855f7", icon: "users" },
  relacionamentos: { label: "Relacionamentos", color: "#06b6d4", icon: "heart-handshake" },
  politicas: { label: "Políticas", color: "#64748b", icon: "shield-check" },
  geral: { label: "Geral", color: "#6b7280", icon: "book" },
};

export const SOP_CATEGORY_CONFIG: Record<SOPCategory, { label: string; color: string; icon: string }> = {
  processo: { label: "Processo", color: "#3b82f6", icon: "list-check" },
  checklist: { label: "Checklist", color: "#10b981", icon: "checklist" },
  referencia: { label: "Referência", color: "#8b5cf6", icon: "bookmark" },
  troubleshooting: { label: "Troubleshooting", color: "#f59e0b", icon: "alert-triangle" },
};

export const SOP_STATUS_CONFIG: Record<SOPStatus, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "gray" },
  review: { label: "Em Revisão", color: "amber" },
  published: { label: "Publicado", color: "green" },
  archived: { label: "Arquivado", color: "slate" },
};

export const SOP_PRIORITY_CONFIG: Record<SOPPriority, { label: string; color: string }> = {
  critical: { label: "Crítico", color: "red" },
  high: { label: "Alto", color: "orange" },
  medium: { label: "Médio", color: "blue" },
  low: { label: "Baixo", color: "gray" },
};
