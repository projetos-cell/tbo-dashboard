/**
 * TBO OS — OFX 1.x (SGML) Bank Statement Parser
 *
 * Parses OFX files exported by Banco do Brasil and other banks.
 * OFX 1.x uses SGML (not XML): leaf elements have no closing tag.
 *
 * Usage:
 *   import { parseOFX } from "./ofx-parser";
 *   const statement = parseOFX(fileContent);
 */

import { z } from "zod";

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const OFXTransactionSchema = z.object({
  /** FITID — unique identifier from the bank (used for deduplication) */
  fitid: z.string().min(1),
  /** ISO 8601 date: YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Absolute value (always positive) */
  amount: z.number().nonnegative(),
  type: z.enum(["credit", "debit"]),
  description: z.string(),
  checkNum: z.string().optional(),
  refNum: z.string().optional(),
});

export const OFXStatementSchema = z.object({
  bankId: z.string(),
  agencyId: z.string().optional(),
  accountId: z.string(),
  accountType: z.string(),
  currency: z.string().default("BRL"),
  /** ISO date of first transaction */
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** ISO date of last transaction */
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Current ledger balance (optional) */
  balance: z.number().optional(),
  transactions: z.array(OFXTransactionSchema),
});

export type OFXTransaction = z.infer<typeof OFXTransactionSchema>;
export type OFXStatement = z.infer<typeof OFXStatementSchema>;

export interface OFXParseError {
  code: "INVALID_FORMAT" | "MISSING_TRANSACTIONS" | "VALIDATION_ERROR";
  message: string;
}

export type OFXParseResult =
  | { success: true; data: OFXStatement }
  | { success: false; error: OFXParseError };

// ── Date utilities ────────────────────────────────────────────────────────────

/**
 * Converts OFX date string to ISO YYYY-MM-DD.
 * Handles: YYYYMMDD, YYYYMMDDHHMMSS, YYYYMMDDHHMMSS[±HH:mm], YYYYMMDDHHMMSS.mmm
 */
function parseOFXDate(raw: string): string {
  const digits = raw.replace(/\[.*\]/, "").replace(/\..+$/, "").trim();
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);

  if (!year || !month || !day) {
    throw new Error(`Data OFX inválida: "${raw}"`);
  }
  return `${year}-${month}-${day}`;
}

// ── SGML extraction helpers ───────────────────────────────────────────────────

function extractLeaf(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>([^<]+)`, "i");
  const m = re.exec(block);
  return m ? m[1].trim() : undefined;
}

function extractBlock(body: string, tag: string): string | undefined {
  const upper = body.toUpperCase();
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = upper.indexOf(open);
  if (start === -1) return undefined;
  const contentStart = start + open.length;
  const end = upper.indexOf(close, contentStart);
  if (end === -1) return undefined;
  return body.slice(contentStart, end);
}

function extractAllBlocks(body: string, tag: string): string[] {
  const upper = body.toUpperCase();
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const results: string[] = [];
  let cursor = 0;

  while (cursor < body.length) {
    const start = upper.indexOf(open, cursor);
    if (start === -1) break;
    const contentStart = start + open.length;
    const end = upper.indexOf(close, contentStart);
    if (end === -1) break;
    results.push(body.slice(contentStart, end));
    cursor = end + close.length;
  }
  return results;
}

// ── Transaction parser ────────────────────────────────────────────────────────

function parseTransaction(block: string): OFXTransaction | null {
  const rawDate =
    extractLeaf(block, "DTPOSTED") ?? extractLeaf(block, "DTAVAIL");
  const rawAmount = extractLeaf(block, "TRNAMT");
  const fitid = extractLeaf(block, "FITID");
  const trnType = (extractLeaf(block, "TRNTYPE") ?? "DEBIT").toUpperCase();
  const memo =
    extractLeaf(block, "MEMO") ??
    extractLeaf(block, "NAME") ??
    extractLeaf(block, "PAYEE") ??
    "";

  if (!rawDate || !rawAmount || !fitid) return null;

  const amount = parseFloat(rawAmount.replace(",", "."));
  if (isNaN(amount)) return null;

  // Credit types per OFX spec
  const creditTypes = new Set(["CREDIT", "DEP", "INT", "DIV", "DIRECTDEP"]);
  const isCredit = amount > 0 || creditTypes.has(trnType);

  const result = OFXTransactionSchema.safeParse({
    fitid,
    date: parseOFXDate(rawDate),
    amount: Math.abs(amount),
    type: isCredit ? "credit" : "debit",
    description: memo,
    checkNum: extractLeaf(block, "CHECKNUM"),
    refNum: extractLeaf(block, "REFNUM"),
  });

  return result.success ? result.data : null;
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseOFX(content: string): OFXParseResult {
  try {
    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Separate header from body at <OFX>
    const ofxIdx = normalized.toUpperCase().indexOf("<OFX>");
    if (ofxIdx === -1) {
      return {
        success: false,
        error: {
          code: "INVALID_FORMAT",
          message: 'Tag <OFX> não encontrada no arquivo',
        },
      };
    }
    const body = normalized.slice(ofxIdx);

    // Account info
    const acctBlock =
      extractBlock(body, "BANKACCTFROM") ??
      extractBlock(body, "CCACCTFROM") ??
      "";
    const bankId =
      extractLeaf(acctBlock, "BANKID") ?? extractLeaf(body, "BANKID") ?? "";
    const agencyId = extractLeaf(acctBlock, "BRANCHID");
    const accountId = extractLeaf(acctBlock, "ACCTID") ?? "";
    const accountType = extractLeaf(acctBlock, "ACCTTYPE") ?? "CHECKING";
    const currency = extractLeaf(body, "CURDEF") ?? "BRL";

    // Date range
    const tranListBlock = extractBlock(body, "BANKTRANLIST") ?? body;
    const startDate = extractLeaf(tranListBlock, "DTSTART");
    const endDate = extractLeaf(tranListBlock, "DTEND");

    // Balance
    const balBlock = extractBlock(body, "LEDGERBAL") ?? "";
    const rawBalance = extractLeaf(balBlock, "BALAMT");
    const balance = rawBalance
      ? parseFloat(rawBalance.replace(",", "."))
      : undefined;

    // Transactions
    const txBlocks = extractAllBlocks(tranListBlock, "STMTTRN");
    const transactions = txBlocks
      .map(parseTransaction)
      .filter((t): t is OFXTransaction => t !== null);

    const today = new Date().toISOString().slice(0, 10);
    const statement = OFXStatementSchema.safeParse({
      bankId,
      agencyId: agencyId ?? undefined,
      accountId,
      accountType,
      currency,
      startDate: startDate ? parseOFXDate(startDate) : today,
      endDate: endDate ? parseOFXDate(endDate) : today,
      balance,
      transactions,
    });

    if (!statement.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: statement.error.issues.map((i) => i.message).join("; "),
        },
      };
    }

    return { success: true, data: statement.data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "INVALID_FORMAT",
        message: err instanceof Error ? err.message : "Erro desconhecido ao parsear OFX",
      },
    };
  }
}
