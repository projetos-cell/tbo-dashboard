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
  /** Contratante info */
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  /** Contratado(a) info */
  contracteeName?: string;
  contracteeCnpj?: string;
  contracteeCpf?: string;
  contracteeAddress?: string;
  /** Custom clauses appended to the template */
  customClauses?: string[];
  /** Payment conditions */
  paymentConditions?: string;
  /** Confidentiality clause */
  confidentialityClause?: string;
  /** Fine/penalty percentage */
  penaltyPercent?: number;
}

// ─── Template registry ────────────────────────────────────────────────────────

export type ContractTemplateKey = "pj" | "nda" | "freelancer" | "clt" | "aditivo" | "generico";

export const CONTRACT_TEMPLATES: Record<
  ContractTemplateKey,
  { label: string; description: string }
> = {
  pj: {
    label: "Prestacao de Servicos (PJ)",
    description: "Contrato padrao de prestacao de servicos entre pessoas juridicas",
  },
  nda: {
    label: "Acordo de Confidencialidade (NDA)",
    description: "Termo de confidencialidade e nao-divulgacao",
  },
  freelancer: {
    label: "Freelancer",
    description: "Contrato simplificado para prestador freelancer",
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
    description: "Modelo generico com todas as clausulas basicas",
  },
};
