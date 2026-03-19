// ─── Contract PDF generation data ─────────────────────────────────────────────

export interface ContractPdfScopeItem {
  title: string;
  description?: string | null;
  category?: string | null;
  value: number;
  estimated_start?: string | null;
  estimated_end?: string | null;
}

export interface ContractPdfSigner {
  name: string;
  email: string;
  cpf?: string | null;
  role: "signer" | "witness" | "approver";
}

export interface ContractPdfData {
  /** Contract number (e.g. TBO-2026-001) */
  contractNumber?: string | null;
  title: string;
  description?: string | null;
  /** Category: cliente, equipe, fornecedor, distrato */
  category: string;
  /** Type: pj, nda, aditivo, freelancer, clt, outro */
  type: string;
  totalValue: number;
  startDate?: string | null;
  endDate?: string | null;
  scopeItems: ContractPdfScopeItem[];
  signers: ContractPdfSigner[];

  // ── Contratante (TBO default) ─────────────────────────────
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  /** Representante legal da contratante */
  companyRepresentative?: string;

  // ── Contratado(a) ─────────────────────────────────────────
  contracteeName?: string;
  contracteeCnpj?: string;
  contracteeCpf?: string;
  contracteeAddress?: string;
  /** Representante legal do contratado */
  contracteeRepresentative?: string;

  // ── Clausulas customizaveis ───────────────────────────────
  /** Custom clauses appended to the template */
  customClauses?: string[];
  /** Payment conditions (installments, bank details) */
  paymentConditions?: string;
  /** Payment method (boleto, PIX, TED) */
  paymentMethod?: string;
  /** Bank details for payment */
  bankDetails?: string;
  /** Confidentiality clause override */
  confidentialityClause?: string;
  /** Fine/penalty percentage for termination (default 20%) */
  penaltyPercent?: number;
  /** Late payment penalty percent (default 10%) */
  latePenaltyPercent?: number;
  /** Late payment monthly interest (default 1%) */
  lateInterestPercent?: number;
  /** Advance notice period for termination in business days (default 60) */
  terminationNoticeDays?: number;
  /** Max revisions per deliverable (default 3) */
  maxRevisions?: number;
  /** Extra revision cost percentage (default 50%) */
  extraRevisionPercent?: number;
  /** Non-exclusive contract flag (default true) */
  nonExclusive?: boolean;
  /** Forum city (default "Curitiba/PR") */
  forumCity?: string;
  /** Nome do empreendimento/projeto (for real estate contracts) */
  projectName?: string;

  // ── AI-generated content ──────────────────────────────────
  /** AI-generated object/description clause */
  aiObjectClause?: string;
  /** AI-generated scope details */
  aiScopeDetails?: string;
  /** AI-suggested payment structure */
  aiPaymentStructure?: string;
}

// ─── Template registry ────────────────────────────────────────────────────────

export type ContractTemplateKey = "pj" | "nda" | "freelancer" | "clt" | "aditivo" | "generico";

export const CONTRACT_TEMPLATES: Record<
  ContractTemplateKey,
  { label: string; description: string }
> = {
  pj: {
    label: "Prestacao de Servicos (PJ)",
    description: "Modelo TBO padrao — 13 clausulas, baseado em contratos reais",
  },
  nda: {
    label: "Acordo de Confidencialidade (NDA)",
    description: "Termo de confidencialidade com LGPD e nao-divulgacao",
  },
  freelancer: {
    label: "Freelancer",
    description: "Contrato para prestador autonomo sem vinculo empregaticio",
  },
  clt: {
    label: "Trabalho (CLT)",
    description: "Contrato de trabalho por prazo determinado",
  },
  aditivo: {
    label: "Aditivo Contratual",
    description: "Termo aditivo a contrato existente",
  },
  generico: {
    label: "Generico",
    description: "Modelo generico com clausulas basicas",
  },
};

// ─── TBO defaults ─────────────────────────────────────────────────────────────

export const TBO_DEFAULTS = {
  companyName: "AGENCIA DE PUBLICIDADE TBO LTDA",
  companyCnpj: "41.312.686/0001-33",
  companyAddress: "Rua dos Cedros, n. 39, bairro Alphaville Graciosa, Cidade de Pinhais, Estado do Parana",
  forumCity: "Curitiba/PR",
  penaltyPercent: 20,
  latePenaltyPercent: 10,
  lateInterestPercent: 1,
  terminationNoticeDays: 60,
  maxRevisions: 3,
  extraRevisionPercent: 50,
  nonExclusive: true,
} as const;
