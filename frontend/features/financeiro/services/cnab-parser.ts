/**
 * TBO OS — CNAB 240 Parser (FEBRABAN standard)
 *
 * Parses payment return files (retorno) in CNAB 240 format from Banco do Brasil.
 * Each line is exactly 240 characters wide.
 *
 * Record types:
 *   0 — Header arquivo
 *   1 — Header lote
 *   3 — Detalhe (segments A, B, J, O, N, W)
 *   5 — Trailer lote
 *   9 — Trailer arquivo
 *
 * Field positions are 0-indexed (JavaScript string slice convention).
 *
 * Reference: FEBRABAN CNAB 240 — Pagamentos (Remessa/Retorno)
 * BB specific layout: https://www.bb.com.br/docs/pub/corp/cnab240/
 */

import { z } from "zod";

// ── Constants ─────────────────────────────────────────────────────────────────

const CNAB240_LINE_LENGTH = 240;

// Record type identifiers (position 7, 0-indexed)
const RecordType = {
  HEADER_FILE: "0",
  HEADER_LOT: "1",
  DETAIL: "3",
  TRAILER_LOT: "5",
  TRAILER_FILE: "9",
} as const;

// Segment identifiers for detail records (position 13, 0-indexed)
const Segment = {
  A: "A", // Transferência entre bancos (TED/DOC/PIX)
  B: "B", // Dados do favorecido (complemento do A)
  J: "J", // Pagamento de boleto
  O: "O", // Pagamento de concessionárias
  N: "N", // Tributos com código de barras
  W: "W", // Tributos sem código de barras
} as const;

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const CNAB240TransactionSchema = z.object({
  lot: z.string(),
  sequence: z.string(),
  segment: z.string(),
  /** Movement type: '0'=inclusão, '5'=cancelamento, '9'=retorno */
  movementType: z.string(),
  /** Return code: '00'=success, others=error */
  returnCode: z.string(),
  returnDescription: z.string().optional(),
  /** Recipient or payer info */
  name: z.string(),
  /** Document/reference number from the company */
  documentNumber: z.string().optional(),
  /** Payment/processing date as YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Amount in BRL */
  amount: z.number().nonnegative(),
  type: z.enum(["credit", "debit"]),
  /** Original barcode (Segmento J only) */
  barcode: z.string().optional(),
});

export const CNAB240FileHeaderSchema = z.object({
  bankCode: z.string().length(3),
  companyName: z.string(),
  /** '1'=remessa, '2'=retorno */
  direction: z.enum(["1", "2"]),
  generationDate: z.string(),
});

export const CNAB240FileSchema = z.object({
  header: CNAB240FileHeaderSchema,
  transactions: z.array(CNAB240TransactionSchema),
  totalLots: z.number().int().nonnegative(),
  totalRecords: z.number().int().nonnegative(),
});

export type CNAB240Transaction = z.infer<typeof CNAB240TransactionSchema>;
export type CNAB240FileHeader = z.infer<typeof CNAB240FileHeaderSchema>;
export type CNAB240File = z.infer<typeof CNAB240FileSchema>;

export interface CNAB240ParseError {
  code: "INVALID_FORMAT" | "INVALID_LINE_LENGTH" | "VALIDATION_ERROR";
  message: string;
  line?: number;
}

export type CNAB240ParseResult =
  | { success: true; data: CNAB240File }
  | { success: false; error: CNAB240ParseError };

// ── Date utilities ────────────────────────────────────────────────────────────

/** Converts DDMMAAAA or AAAAMMDD to YYYY-MM-DD */
function parseCNABDate(raw: string): string {
  const s = raw.trim();
  if (s.length < 8 || s === "00000000") {
    return new Date().toISOString().slice(0, 10);
  }
  // DDMMAAAA format (most common in CNAB 240)
  const day = s.slice(0, 2);
  const month = s.slice(2, 4);
  const year = s.slice(4, 8);
  return `${year}-${month}-${day}`;
}

/** Converts packed numeric string to BRL amount.
 *  CNAB 240 stores values as integer with 2 implied decimal places.
 *  e.g., "000000000150000" = 1500.00
 */
function parseCNABAmount(raw: string): number {
  const digits = raw.trim().replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

// ── Record parsers ────────────────────────────────────────────────────────────

function parseFileHeader(line: string): CNAB240FileHeader {
  return {
    bankCode: line.slice(0, 3).trim(),
    companyName: line.slice(72, 102).trim(),
    direction: (line[142] === "2" ? "2" : "1") as "1" | "2",
    generationDate: parseCNABDate(line.slice(143, 151)),
  };
}

/**
 * Parses Segmento A — transferência entre bancos (TED/DOC/PIX/Crédito em conta)
 *
 * Key field positions (0-indexed):
 * 14: movement type (1)
 * 15-16: return code (2)
 * 44-73: recipient name (30)
 * 74-93: document number (20)
 * 93-100: payment date DDMMAAAA (8) — note: some BB layouts use 94-101
 * 105-119: payment amount (15)
 */
function parseSegmentA(
  line: string,
  lot: string,
  sequence: string
): CNAB240Transaction | null {
  const movementType = line[14] ?? "0";
  const returnCode = line.slice(15, 17).trim();

  // Only process confirmed (returnCode "00") and remessa (empty code) transactions
  if (returnCode !== "00" && returnCode !== "") return null;

  const name = line.slice(44, 74).trim();
  const documentNumber = line.slice(74, 94).trim();
  const rawDate = line.slice(94, 102); // DDMMAAAA at positions 94-101 (0-indexed)
  const rawAmount = line.slice(105, 120); // 15 digits at positions 105-119 (0-indexed)

  const date = parseCNABDate(rawDate);
  const amount = parseCNABAmount(rawAmount);

  const result = CNAB240TransactionSchema.safeParse({
    lot,
    sequence,
    segment: Segment.A,
    movementType,
    returnCode,
    returnDescription: getReturnDescription(returnCode),
    name,
    documentNumber: documentNumber || undefined,
    date,
    amount,
    type: "debit", // Segment A is always outgoing payment
  });

  return result.success ? result.data : null;
}

/**
 * Parses Segmento J — pagamento de boleto bancário
 *
 * Key field positions (0-indexed):
 * 14: movement type (1)
 * 15-16: return code (2)
 * 17-56: barcode / linha digitável (40)
 * 57-90: beneficiary name (34)
 * 91-98: due date DDMMAAAA (8)
 * 99-106: payment date DDMMAAAA (8)
 * 107-121: payment amount (15)
 */
function parseSegmentJ(
  line: string,
  lot: string,
  sequence: string
): CNAB240Transaction | null {
  const movementType = line[14] ?? "0";
  const returnCode = line.slice(15, 17).trim();

  // Only process confirmed (returnCode "00") and remessa (empty code) transactions
  if (returnCode !== "00" && returnCode !== "") return null;

  const barcode = line.slice(17, 57).trim();
  const name = line.slice(57, 91).trim();
  const rawDate = line.slice(99, 107); // payment date DDMMAAAA at positions 99-106 (0-indexed)
  const rawAmount = line.slice(107, 122); // 15 digits at positions 107-121 (0-indexed)

  const date = parseCNABDate(rawDate);
  const amount = parseCNABAmount(rawAmount);

  const result = CNAB240TransactionSchema.safeParse({
    lot,
    sequence,
    segment: Segment.J,
    movementType,
    returnCode,
    returnDescription: getReturnDescription(returnCode),
    name,
    barcode: barcode || undefined,
    date,
    amount,
    type: "debit", // Boleto payment is always outgoing
  });

  return result.success ? result.data : null;
}

// ── Return code descriptions ──────────────────────────────────────────────────

const RETURN_CODES: Record<string, string> = {
  "00": "Crédito ou Débito Efetivado",
  "01": "Insuficiência de Fundos",
  "02": "Crédito ou Débito Cancelado pelo Pagador / Credor",
  "03": "Débito Autorizado pela Agência - Efetuado",
  AA: "Controle Inválido",
  AB: "Tipo de Operação Inválido",
  AC: "Tipo de Serviço Inválido",
  AD: "Forma de Lançamento Inválida",
  AE: "Tipo e Número de Inscrição Inválidos",
  AF: "Código de Convênio Inválido",
  AG: "Agência/Conta Corrente do Debitado Inválidas",
  AH: "Número Sequencial do Registro no Lote Inválido",
  AI: "Código de Segmento de Detalhe Inválido",
  BD: "Banco Não Habilitado para Serviço CIP",
  BE: "Agência Favorecida Não Habilitada",
  BF: "Empresa não pagou convênio",
};

function getReturnDescription(code: string): string {
  return RETURN_CODES[code] ?? `Código de retorno: ${code}`;
}

// ── Trailer parsers ───────────────────────────────────────────────────────────

interface LotTrailerData {
  totalRecords: number;
}

function parseLotTrailer(line: string): LotTrailerData {
  const rawCount = line.slice(17, 23).trim();
  return { totalRecords: parseInt(rawCount, 10) || 0 };
}

interface FileTrailerData {
  totalLots: number;
  totalRecords: number;
}

function parseFileTrailer(line: string): FileTrailerData {
  const rawLots = line.slice(17, 23).trim();
  const rawRecords = line.slice(23, 29).trim();
  return {
    totalLots: parseInt(rawLots, 10) || 0,
    totalRecords: parseInt(rawRecords, 10) || 0,
  };
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseCNAB240(content: string): CNAB240ParseResult {
  try {
    const lines = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        error: { code: "INVALID_FORMAT", message: "Arquivo CNAB vazio" },
      };
    }

    // Validate first line is a file header with correct length
    if (lines[0].length !== CNAB240_LINE_LENGTH) {
      return {
        success: false,
        error: {
          code: "INVALID_LINE_LENGTH",
          message: `Linha 1 tem ${lines[0].length} caracteres (esperado ${CNAB240_LINE_LENGTH})`,
          line: 1,
        },
      };
    }

    const header = parseFileHeader(lines[0]);
    const transactions: CNAB240Transaction[] = [];
    let trailerData: FileTrailerData = { totalLots: 0, totalRecords: 0 };

    let currentLot = "0000";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pad line to 240 chars if shorter (some files have trailing space trimmed)
      const paddedLine = line.padEnd(CNAB240_LINE_LENGTH, " ");
      const recordType = paddedLine[7];

      if (recordType === RecordType.HEADER_LOT) {
        currentLot = paddedLine.slice(3, 7);
      } else if (recordType === RecordType.DETAIL) {
        const sequence = paddedLine.slice(8, 13).trim();
        const segment = paddedLine[13]?.toUpperCase();

        let tx: CNAB240Transaction | null = null;

        if (segment === Segment.A) {
          tx = parseSegmentA(paddedLine, currentLot, sequence);
        } else if (segment === Segment.J) {
          tx = parseSegmentJ(paddedLine, currentLot, sequence);
        }
        // Segments B, O, N, W — complementary data, skip for now

        if (tx) {
          transactions.push(tx);
        }
      } else if (recordType === RecordType.TRAILER_LOT) {
        const lotData = parseLotTrailer(paddedLine);
        trailerData.totalRecords += lotData.totalRecords;
      } else if (recordType === RecordType.TRAILER_FILE) {
        trailerData = parseFileTrailer(paddedLine);
      }
    }

    const fileResult = CNAB240FileSchema.safeParse({
      header,
      transactions,
      totalLots: trailerData.totalLots,
      totalRecords: trailerData.totalRecords,
    });

    if (!fileResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: fileResult.error.issues.map((i) => i.message).join("; "),
        },
      };
    }

    return { success: true, data: fileResult.data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "INVALID_FORMAT",
        message: err instanceof Error ? err.message : "Erro desconhecido ao parsear CNAB 240",
      },
    };
  }
}
