import { z } from "zod";

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
