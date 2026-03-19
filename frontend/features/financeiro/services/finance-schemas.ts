import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip formatting from CPF/CNPJ and validate length */
function isValidCpfCnpj(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return digits.length === 11 || digits.length === 14;
}

/** Normalize monetary value to 2 decimal places */
export function roundMoney(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Sanitize text input: trim whitespace */
export function sanitizeText(v: string): string {
  return v.trim();
}

// ── Enums ────────────────────────────────────────────────────────────────────

export const transactionTypeEnum = z.enum(["receita", "despesa", "transferencia"]);

export const transactionStatusEnum = z.enum([
  "previsto",
  "provisionado",
  "pago",
  "liquidado",
  "parcial",
  "atrasado",
  "recorrente",
  "cancelado",
]);

export const categoryTypeEnum = z.enum(["receita", "despesa"]);

export const statementTypeEnum = z.enum(["credit", "debit"]);

export const overdueTypeEnum = z.enum(["ar", "ap", "all"]);

export const dateFieldEnum = z.enum(["date", "paid_date"]);

// ── Reusable primitives ─────────────────────────────────────────────────────

/** ISO date string (YYYY-MM-DD) */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

/** ISO date string validated against 2-year future cap */
const isoDateCapped = isoDate.refine(
  (d) => {
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    return new Date(d) <= twoYearsAhead;
  },
  "Data não pode ser mais de 2 anos no futuro"
);

/** CPF (11 digits) or CNPJ (14 digits), with or without formatting */
const cpfOrCnpj = z
  .string()
  .refine(isValidCpfCnpj, "CPF deve ter 11 dígitos ou CNPJ 14 dígitos")
  .nullable()
  .optional();

/** UUID v4 */
const uuid = z.string().uuid();

/** Month string (YYYY-MM) */
const monthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Mês deve estar no formato YYYY-MM");

/** Positive page number, defaults to 1 */
const page = z.coerce.number().int().positive().default(1);

/** Page size between 1 and 500, defaults to 50 */
const pageSize = z.coerce.number().int().min(1).max(500).default(50);

// ── FinanceFilters ──────────────────────────────────────────────────────────

export const financeFiltersSchema = z.object({
  type: transactionTypeEnum.optional(),
  typeIn: z.array(z.string()).optional(),
  status: z.string().optional(),
  statusIn: z.array(z.string()).optional(),
  category_id: uuid.optional(),
  cost_center_id: uuid.optional(),
  business_unit: z.string().optional(),
  project_id: uuid.optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  dateField: dateFieldEnum.optional(),
  search: z.string().max(200).optional(),
  page: page.optional(),
  pageSize: pageSize.optional(),
});

export type FinanceFiltersInput = z.infer<typeof financeFiltersSchema>;

// ── BankStatementFilters ────────────────────────────────────────────────────

export const bankStatementFiltersSchema = z.object({
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  bankAccountId: uuid.optional(),
  type: statementTypeEnum.optional(),
  page: page.optional(),
  pageSize: pageSize.optional(),
});

export type BankStatementFiltersInput = z.infer<typeof bankStatementFiltersSchema>;

// ── Date range params (used by KPIs, payroll, cash flow, etc.) ──────────────

export const dateRangeSchema = z
  .object({
    dateFrom: isoDate,
    dateTo: isoDate,
  })
  .refine((d) => d.dateFrom <= d.dateTo, {
    message: "dateFrom não pode ser posterior a dateTo",
  });

export const optionalDateRangeSchema = z.object({
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
});

// ── CreateCashEntryInput ────────────────────────────────────────────────────

export const createCashEntrySchema = z.object({
  amount: z.number().refine((v) => v !== 0, "Valor não pode ser zero"),
  note: z.string().max(500).optional(),
  recorded_at: isoDate.optional(),
});

export type CreateCashEntryInput = z.infer<typeof createCashEntrySchema>;

// ── UpsertOperationalIndicatorInput ─────────────────────────────────────────

export const upsertOperationalIndicatorSchema = z.object({
  month: monthString,
  headcount: z.number().int().nonnegative().nullable().optional(),
  folha_pagamento: z.number().nonnegative().nullable().optional(),
  custos_fixos: z.number().nonnegative().nullable().optional(),
  meta_receita: z.number().nonnegative().nullable().optional(),
  meta_margem: z.number().min(0).max(100).nullable().optional(),
  churn_clientes_perdidos: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type UpsertOperationalIndicatorInput = z.infer<typeof upsertOperationalIndicatorSchema>;

// ── Overdue entries filter ──────────────────────────────────────────────────

export const overdueTypeSchema = overdueTypeEnum.default("all");

// ── Days param (cash flow projection) ───────────────────────────────────────

export const daysParamSchema = z.coerce.number().int().min(1).max(365).default(30);

// ── Recurring rule input ────────────────────────────────────────────────────

const buEnum = z.enum(["Branding", "Digital 3D", "Marketing", "Audiovisual", "Interiores"]);

export const recurringRuleSchema = z
  .object({
    type: categoryTypeEnum,
    description: z.string().min(3, "Descrição deve ter ao menos 3 caracteres").max(300),
    amount: z.number().positive("Valor deve ser positivo"),
    category_id: uuid.nullable().optional(),
    cost_center_id: uuid.nullable().optional(),
    counterpart: z.string().max(200).nullable().optional(),
    counterpart_doc: cpfOrCnpj,
    payment_method: z.string().max(100).nullable().optional(),
    bank_account: z.string().max(100).nullable().optional(),
    business_unit: buEnum.nullable().optional(),
    tags: z.array(z.string()).optional(),
    day_of_month: z.number().int().min(1).max(28),
    start_month: monthString,
    end_month: monthString.nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (d) => !d.end_month || d.end_month >= d.start_month,
    { message: "Mês final não pode ser anterior ao mês inicial", path: ["end_month"] }
  );

export type RecurringRuleInput = z.infer<typeof recurringRuleSchema>;

// ── Transaction CRUD input ─────────────────────────────────────────────────

const PAID_STATUSES = ["pago", "liquidado"] as const;

/** Base object schema (no refinements) — used for .partial() on update */
const transactionBaseSchema = z.object({
  type: transactionTypeEnum,
  status: transactionStatusEnum.default("previsto"),
  description: z.string().min(3, "Descrição deve ter ao menos 3 caracteres").max(500),
  amount: z.number().positive("Valor deve ser positivo"),
  paid_amount: z.number().nonnegative().default(0),
  date: isoDate,
  due_date: isoDate.nullable().optional(),
  paid_date: isoDate.nullable().optional(),
  category_id: uuid.nullable().optional(),
  cost_center_id: uuid.nullable().optional(),
  project_id: uuid.nullable().optional(),
  counterpart: z.string().max(200).nullable().optional(),
  counterpart_doc: cpfOrCnpj,
  payment_method: z.string().max(100).nullable().optional(),
  bank_account: z.string().max(100).nullable().optional(),
  business_unit: buEnum.nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).nullable().optional(),
  contract_id: uuid.nullable().optional(),
});

export const createTransactionSchema = transactionBaseSchema
  .refine(
    (d) => {
      if (PAID_STATUSES.includes(d.status as (typeof PAID_STATUSES)[number])) {
        return !!d.paid_date;
      }
      return true;
    },
    { message: "Data de pagamento obrigatória para status pago/liquidado", path: ["paid_date"] }
  )
  .refine(
    (d) => {
      if (PAID_STATUSES.includes(d.status as (typeof PAID_STATUSES)[number])) {
        return (d.paid_amount ?? 0) > 0;
      }
      return true;
    },
    { message: "Valor pago deve ser maior que zero para status pago/liquidado", path: ["paid_amount"] }
  )
  .refine(
    (d) => {
      const twoYearsAhead = new Date();
      twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
      return new Date(d.date) <= twoYearsAhead;
    },
    { message: "Data não pode ser mais de 2 anos no futuro", path: ["date"] }
  );

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = transactionBaseSchema.partial();

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
