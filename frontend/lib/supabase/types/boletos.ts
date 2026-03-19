// ── Finance Boletos Types ─────────────────────────────────────────────────────
// Gerado manualmente para a tabela finance_boletos
// ─────────────────────────────────────────────────────────────────────────────

export type BoletoStatus =
  | "emitido"
  | "pago"
  | "vencido"
  | "cancelado"
  | "substituido";

// ── finance_boletos ───────────────────────────────────────────────────────────

export interface Boleto {
  id: string;
  tenant_id: string;
  invoice_id: string | null;
  barcode: string;
  digitable_line: string;
  due_date: string;                 // ISO date string (YYYY-MM-DD)
  amount: number;
  status: BoletoStatus;
  bank_return_code: string | null;
  paid_at: string | null;
  paid_amount: number | null;
  nosso_numero: string;
  remessa_sent_at: string | null;
  payer_name: string | null;
  payer_document: string | null;
  payer_address: string | null;
  instructions: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoletoInsert {
  id?: string;
  tenant_id: string;
  invoice_id?: string | null;
  barcode: string;
  digitable_line: string;
  due_date: string;
  amount: number;
  status?: BoletoStatus;
  bank_return_code?: string | null;
  paid_at?: string | null;
  paid_amount?: number | null;
  nosso_numero: string;
  remessa_sent_at?: string | null;
  payer_name?: string | null;
  payer_document?: string | null;
  payer_address?: string | null;
  instructions?: string | null;
  created_by?: string | null;
}

export interface BoletoUpdate {
  status?: BoletoStatus;
  bank_return_code?: string | null;
  paid_at?: string | null;
  paid_amount?: number | null;
  remessa_sent_at?: string | null;
  payer_name?: string | null;
  payer_document?: string | null;
  payer_address?: string | null;
  instructions?: string | null;
  updated_at?: string;
}

export interface BoletoFilters {
  status?: BoletoStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  invoiceId?: string;
  page?: number;
  pageSize?: number;
}

export interface BoletoSummary {
  totalEmitidos: number;
  totalPagos: number;
  totalVencidos: number;
  totalCancelados: number;
  valorEmitidos: number;
  valorPagos: number;
  valorVencidos: number;
}

// ── CNAB 400 types ────────────────────────────────────────────────────────────

export interface BoletoGenerateParams {
  tenantId: string;
  invoiceId?: string;
  amount: number;
  dueDate: string;                  // YYYY-MM-DD
  payerName: string;
  payerDocument: string;            // CPF or CNPJ (digits only)
  payerAddress: string;
  instructions?: string;
  // Bank config
  bankConvenio: string;             // Convênio BB (7 digits)
  bankAgency: string;               // Agência (4 digits, without check digit)
  bankAccount: string;              // Conta (8 digits, without check digit)
  bankCarteira?: string;            // Carteira (default: '017' — sem registro)
  beneficiaryName: string;
  nossoNumero?: string;             // Override; if omitted, auto-generated
}

export interface CnabRetornoRecord {
  nossoNumero: string;
  returnCode: string;
  paymentDate: string | null;       // DDMMAA or null
  paidAmount: number | null;
  creditDate: string | null;        // DDMMAA or null
  status: BoletoStatus;
}

export interface CnabRetornoResult {
  totalRecords: number;
  paid: number;
  errors: number;
  records: CnabRetornoRecord[];
}
