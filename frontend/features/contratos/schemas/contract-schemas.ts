import { z } from "zod";

// ─── Scope Item ──────────────────────────────────────────────────────────────

export const ScopeItemSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional(),
  value: z.coerce.number().min(0).default(0),
  status: z.enum(["pending", "in_progress", "delivered", "approved"]).default("pending"),
  progress_pct: z.coerce.number().min(0).max(100).default(0),
  estimated_start: z.string().nullable().optional(),
  estimated_end: z.string().nullable().optional(),
  sort_order: z.number().default(0),
});

export type ScopeItemInput = z.infer<typeof ScopeItemSchema>;

// ─── Signer ──────────────────────────────────────────────────────────────────

export const SignerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().optional(),
  role: z
    .enum(["contractor", "contractee", "signer", "witness", "approver"])
    .default("signer"),
});

export type SignerInput = z.infer<typeof SignerSchema>;

// ─── Contract Stepper (full creation) ────────────────────────────────────────

export const ContractBasicsSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  project_id: z.string().nullable().optional(),
  client_id: z.string().nullable().optional(),
  total_value: z.coerce.number().min(0).default(0),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  category: z.string().optional(),
  type: z.string().default("pj"),
});

export type ContractBasicsInput = z.infer<typeof ContractBasicsSchema>;

// ─── Scope Item Status Config ────────────────────────────────────────────────

export const SCOPE_ITEM_STATUS = {
  pending: { label: "Pendente", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  in_progress: { label: "Em Andamento", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  delivered: { label: "Entregue", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
} as const;

export const SIGNER_ROLE = {
  contractor: { label: "Contratante", description: "Parte que contrata os servicos" },
  contractee: { label: "Contratado", description: "Parte que presta os servicos" },
  signer: { label: "Signatario", description: "Signatario adicional" },
  witness: { label: "Testemunha", description: "Testemunha do contrato" },
  approver: { label: "Aprovador", description: "Aprovador interno" },
} as const;

export type SignerRoleKey = keyof typeof SIGNER_ROLE;

/** Maps internal roles to Clicksign qualification */
export const SIGNER_ROLE_TO_CLICKSIGN: Record<SignerRoleKey, string> = {
  contractor: "sign",
  contractee: "sign",
  signer: "sign",
  witness: "witness",
  approver: "approve",
};

/** Maps roles to PDF signature labels */
export const SIGNER_ROLE_PDF_LABELS: Record<SignerRoleKey, string> = {
  contractor: "CONTRATANTE",
  contractee: "CONTRATADO",
  signer: "Signatario",
  witness: "Testemunha",
  approver: "Aprovador",
};

export const SIGNER_STATUS = {
  pending: { label: "Pendente", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  signed: { label: "Assinado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  declined: { label: "Recusado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export const CLICKSIGN_STATUS = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  running: { label: "Em Assinatura", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  closed: { label: "Assinado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  canceled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export const CONTRACT_INTERNAL_STATUS = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  pending_sign: { label: "Aguardando Assinatura", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  active: { label: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  completed: { label: "Concluído", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  canceled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export type ContractInternalStatusKey = keyof typeof CONTRACT_INTERNAL_STATUS;
export type ClicksignStatusKey = keyof typeof CLICKSIGN_STATUS;
export type ScopeItemStatusKey = keyof typeof SCOPE_ITEM_STATUS;
export type SignerStatusKey = keyof typeof SIGNER_STATUS;

// ─── Scope categories ────────────────────────────────────────────────────────

export const SCOPE_CATEGORIES = [
  { value: "branding", label: "Branding" },
  { value: "3d", label: "3D" },
  { value: "audiovisual", label: "Audiovisual" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "design", label: "Design" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outro", label: "Outro" },
] as const;
