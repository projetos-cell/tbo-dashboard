// ── Boleto Generator — CNAB 400 / Banco do Brasil ─────────────────────────────
// Geração de boletos (barcode, linha digitável) e arquivos CNAB 400
// remessa/retorno no padrão FEBRABAN para Banco do Brasil (carteira 17).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type {
  BoletoGenerateParams,
  CnabRetornoResult,
  CnabRetornoRecord,
  BoletoStatus,
} from "@/lib/supabase/types/boletos";

// ── Validation schemas ────────────────────────────────────────────────────────

export const BoletoParamsSchema = z.object({
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD"),
  payerName: z.string().min(1).max(60),
  payerDocument: z.string().min(11).max(14).regex(/^\d+$/),
  payerAddress: z.string().min(1).max(80),
  instructions: z.string().max(80).optional(),
  bankConvenio: z.string().length(7).regex(/^\d+$/),
  bankAgency: z.string().min(4).max(4).regex(/^\d+$/),
  bankAccount: z.string().min(8).max(8).regex(/^\d+$/),
  bankCarteira: z.string().default("017"),
  beneficiaryName: z.string().min(1).max(30),
  nossoNumero: z.string().min(1).max(10).regex(/^\d+$/).optional(),
});

// ── Constants ─────────────────────────────────────────────────────────────────

const BANK_CODE = "001"; // Banco do Brasil
const CURRENCY_CODE = "9"; // Real (BRL)
// Base date for due factor: 07/10/1997
const DUE_FACTOR_BASE = new Date("1997-10-07").getTime();
const MS_PER_DAY = 86_400_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function padLeft(value: string | number, length: number, char = "0"): string {
  return String(value).padStart(length, char);
}

function padRight(value: string | number, length: number, char = " "): string {
  return String(value).padEnd(length, char);
}

/** Mod 10 check digit — used for digitable line blocks */
function mod10(num: string): number {
  let sum = 0;
  let multiplier = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    const digit = parseInt(num[i] ?? "0", 10);
    let result = digit * multiplier;
    if (result > 9) result -= 9;
    sum += result;
    multiplier = multiplier === 2 ? 1 : 2;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/** Mod 11 check digit — used for barcode overall check digit */
function mod11(num: string): number {
  const weights = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  const weightIndex = { current: 0 };
  for (let i = num.length - 1; i >= 0; i--) {
    const digit = parseInt(num[i] ?? "0", 10);
    const weight = weights[weightIndex.current % weights.length] ?? 2;
    sum += digit * weight;
    weightIndex.current++;
  }
  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) return 1;
  return 11 - remainder;
}

/** Convert YYYY-MM-DD to due factor (days since 07/10/1997) */
function dueDateToFactor(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  const factor = Math.round((date.getTime() - DUE_FACTOR_BASE) / MS_PER_DAY);
  if (factor < 1 || factor > 9999) return "0000"; // sem vencimento
  return padLeft(factor, 4);
}

/** Convert factor back to date string DDMMAA */
function factorToDateDDMMAA(factor: string): string | null {
  const days = parseInt(factor, 10);
  if (days === 0) return null;
  const date = new Date(DUE_FACTOR_BASE + days * MS_PER_DAY);
  const dd = padLeft(date.getUTCDate(), 2);
  const mm = padLeft(date.getUTCMonth() + 1, 2);
  const aa = String(date.getUTCFullYear()).slice(-2);
  return `${dd}${mm}${aa}`;
}

// ── Barcode generation ────────────────────────────────────────────────────────

/**
 * Generates a FEBRABAN barcode (44 digits) for BB Convênio 7 dígitos, carteira 17.
 * Campo livre (25 digits): 0 + convenio(7) + nossoNumero(10) + carteira(3) + 000 + 1
 */
export function generateBarcode(params: {
  convenio: string;
  nossoNumero: string;
  carteira: string;
  dueDate: string;
  amount: number;
}): string {
  const { convenio, nossoNumero, carteira, dueDate, amount } = params;

  const campoLivre =
    "0" +
    padLeft(convenio, 7) +
    padLeft(nossoNumero, 10) +
    padLeft(carteira, 3) +
    "0001";

  const dueFactor = dueDateToFactor(dueDate);
  const amountStr = padLeft(Math.round(amount * 100), 10);

  // Barcode without check digit (position 5 = placeholder '0')
  const barcodeWithout =
    BANK_CODE + CURRENCY_CODE + dueFactor + amountStr + campoLivre;

  const checkDigit = mod11(barcodeWithout);

  // Insert check digit at position 5 (index 4)
  return (
    barcodeWithout.slice(0, 4) + checkDigit + barcodeWithout.slice(4)
  );
}

/**
 * Converts a 44-digit barcode into the formatted digitable line.
 * Format: AAAAA.BBBBB CCCCC.CCCCCC DDDDD.DDDDDD E FFFFFFFFF GGGGGGGGGG
 */
export function generateDigitableLine(barcode: string): string {
  if (barcode.length !== 44) throw new Error("Barcode must be 44 digits");

  // Block 1: positions 1-3 + 20-24 (barcode indices 0-2 + 19-23) + check mod10
  const block1 = barcode.slice(0, 3) + barcode.slice(19, 24);
  const check1 = mod10(block1);
  const field1 = `${block1.slice(0, 5)}.${block1.slice(5)}${check1}`;

  // Block 2: positions 25-34 (barcode indices 24-33) + check mod10
  const block2 = barcode.slice(24, 34);
  const check2 = mod10(block2);
  const field2 = `${block2.slice(0, 5)}.${block2.slice(5)}${check2}`;

  // Block 3: positions 35-44 (barcode indices 34-43) + check mod10
  const block3 = barcode.slice(34, 44);
  const check3 = mod10(block3);
  const field3 = `${block3.slice(0, 5)}.${block3.slice(5)}${check3}`;

  // Check digit (position 5, barcode index 4)
  const checkDigit = barcode[4];

  // Due factor + amount (positions 6-19, barcode indices 5-18)
  const dueFactor = barcode.slice(5, 9);
  const amount = barcode.slice(9, 19);

  return `${field1} ${field2} ${field3} ${checkDigit} ${dueFactor}${amount}`;
}

/**
 * Generates a sequential nosso número (10 digits) based on timestamp.
 * In production, should be a DB-sequence-based value.
 */
export function generateNossoNumero(seed?: number): string {
  const base = seed ?? Date.now() % 10_000_000_000;
  return padLeft(base, 10);
}

// ── CNAB 400 Remessa ──────────────────────────────────────────────────────────

interface RemessaBoletoParams {
  boleto: {
    nossoNumero: string;
    barcode: string;
    dueDate: string;
    amount: number;
    payerName: string;
    payerDocument: string;
    payerAddress: string;
    instructions?: string | null;
  };
  bankConfig: {
    convenio: string;
    agency: string;
    account: string;
    carteira: string;
    beneficiaryName: string;
  };
  sequencial: number;
}

function buildRemessaHeader(config: {
  agency: string;
  account: string;
  beneficiaryName: string;
  date: string; // DDMMAA
  sequencial: number;
}): string {
  const { agency, account, beneficiaryName, date, sequencial } = config;
  return (
    "0" +                                        // tipo (1)
    "01" +                                       // operação remessa (2-3)
    "REMESSA" +                                  // literal (4-10)
    "01" +                                       // cod serviço cobrança (11-12)
    padRight("", 15) +                           // nome beneficiário abrev (13-27)
    padLeft(agency, 4) +                         // agência (28-31)
    " " +                                        // espaço (32)
    padLeft(account, 8) +                        // conta (33-40)
    padRight("", 7) +                            // brancos (41-47)
    padRight(beneficiaryName.toUpperCase(), 30) + // nome completo (48-77)
    BANK_CODE +                                  // código banco (78-80)
    padRight("BANCO DO BRASIL", 15) +            // nome banco (81-95)
    date +                                       // data gravação (96-101)
    padRight("", 294) +                          // brancos (102-395)
    padLeft(sequencial, 6)                       // sequencial (396-400) — corrected to be at end but within 400
  );
}

function buildRemessaDetail(params: RemessaBoletoParams): string {
  const { boleto, bankConfig, sequencial } = params;
  const { nossoNumero, dueDate, amount, payerName, payerDocument, payerAddress, instructions } = boleto;
  const { agency, account, carteira, convenio } = bankConfig;

  const dueFormatted =
    padLeft(new Date(dueDate + "T12:00:00Z").getUTCDate(), 2) +
    padLeft(new Date(dueDate + "T12:00:00Z").getUTCMonth() + 1, 2) +
    String(new Date(dueDate + "T12:00:00Z").getUTCFullYear()).slice(-2);

  const amountStr = padLeft(Math.round(amount * 100), 13);
  const instrStr = padRight((instructions ?? "").slice(0, 40), 40);

  return (
    "1" +                                              // tipo (1)
    padLeft(agency, 4) +                               // agência (2-5)
    " " +                                              // espaço (6)
    padLeft(account, 8) +                              // conta (7-14)
    " " +                                              // espaço (15)
    padRight("", 25) +                                 // campo livre uso banco (16-40)
    padLeft(carteira, 2) +                             // carteira (41-42)
    padLeft(nossoNumero, 10) +                         // nosso número (43-52)
    padRight("", 20) +                                 // complemento (53-72)
    "N" +                                              // tipo impressão (73)
    padRight("", 10) +                                 // brancos (74-83)
    "01" +                                             // cod ocorrência (84-85): 01=entrada de título
    padLeft(convenio.slice(0, 10), 10) +               // número do documento (86-95)
    dueFormatted +                                     // vencimento DDMMAA (96-101)
    amountStr +                                        // valor nominal (102-114)
    padLeft(BANK_CODE, 3) +                            // banco cobrador (115-117)
    padRight("", 5) +                                  // agência cobrador (118-122)
    "17" +                                             // espécie: 17=outros (123-124)
    "N" +                                              // aceite (125)
    String(new Date().getUTCFullYear()).slice(-2) +
    padLeft(new Date().getUTCMonth() + 1, 2) +
    padLeft(new Date().getUTCDate(), 2) +              // emissão AAMMDD (126-131)
    "00" +                                             // 1ª instrução (132-133)
    "00" +                                             // 2ª instrução (134-135)
    padLeft(0, 13) +                                   // juros mora (136-148)
    padLeft(0, 6) +                                    // data limite desconto (149-154)
    padLeft(0, 13) +                                   // valor desconto (155-167)
    padLeft(0, 13) +                                   // valor IOF (168-180)
    padLeft(0, 13) +                                   // abatimento (181-193)
    padLeft(payerDocument.replace(/\D/g, "").slice(0, 14), 14) + // documento pagador (194-207)
    "01" +                                             // tipo inscrição pagador (208-209)
    padRight(payerName.slice(0, 40), 40) +             // nome pagador (210-249)
    padRight(payerAddress.slice(0, 40), 40) +          // endereço pagador (250-289)
    padRight("", 12) +                                 // complemento (290-301)
    padRight("", 8) +                                  // CEP (302-309)
    padRight("", 15) +                                 // cidade (310-324)
    padRight("", 2) +                                  // UF (325-326)
    instrStr +                                         // observações (327-366)
    padRight("", 33) +                                 // brancos (367-399) — adjusted
    padLeft(sequencial, 1)                             // sequencial (400)
  );
}

function buildRemessaTrailer(totalRecords: number, sequencial: number): string {
  return (
    "9" +                           // tipo (1)
    padRight("", 393) +             // brancos (2-394) — adjusted
    padLeft(totalRecords, 6) +      // total de títulos (395-400... simplified)
    padLeft(sequencial, 6)
  );
}

export function generateRemessaFile(
  boletos: RemessaBoletoParams["boleto"][],
  bankConfig: RemessaBoletoParams["bankConfig"]
): string {
  const now = new Date();
  const date =
    padLeft(now.getUTCDate(), 2) +
    padLeft(now.getUTCMonth() + 1, 2) +
    String(now.getUTCFullYear()).slice(-2);

  const lines: string[] = [];
  lines.push(buildRemessaHeader({ ...bankConfig, date, sequencial: 1 }));

  boletos.forEach((boleto, idx) => {
    lines.push(buildRemessaDetail({ boleto, bankConfig, sequencial: idx + 2 }));
  });

  lines.push(buildRemessaTrailer(boletos.length, boletos.length + 2));
  return lines.map((l) => l.slice(0, 400).padEnd(400)).join("\r\n");
}

// ── CNAB 400 Retorno Parser ───────────────────────────────────────────────────

/** BB return codes mapped to boleto status */
const RETURN_CODE_STATUS: Record<string, BoletoStatus> = {
  "06": "pago",
  "17": "pago",
  "09": "cancelado",
  "10": "cancelado",
  "02": "emitido", // entrada confirmada
  "03": "emitido", // entrada rejeitada (mantém emitido para revisão)
};

export function parseCNAB400Retorno(content: string): CnabRetornoResult {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const records: CnabRetornoRecord[] = [];
  let errors = 0;
  let paid = 0;

  for (const line of lines) {
    if (line.length < 400) continue;
    const tipo = line[0];
    if (tipo === "0" || tipo === "9") continue; // header / trailer

    try {
      // BB CNAB 400 retorno detail positions (1-indexed):
      // 63-72: Nosso número (10 digits)
      // 109-110: Código de ocorrência
      // 111-116: Data de ocorrência DDMMAA
      // 117-122: Data de crédito DDMMAA
      // 153-165: Valor pago (13 digits, last 2 = cents)
      const nossoNumero = line.slice(62, 72).trim();
      const returnCode = line.slice(108, 110).trim();
      const occurrenceDate = line.slice(110, 116).trim();
      const creditDate = line.slice(116, 122).trim();
      const paidAmountRaw = line.slice(152, 165).trim();

      const paidAmountNum = parseInt(paidAmountRaw, 10);
      const paidAmount = isNaN(paidAmountNum) ? null : paidAmountNum / 100;
      const status: BoletoStatus =
        RETURN_CODE_STATUS[returnCode] ?? "emitido";

      if (status === "pago") paid++;

      records.push({
        nossoNumero,
        returnCode,
        paymentDate: occurrenceDate || null,
        paidAmount,
        creditDate: creditDate || null,
        status,
      });
    } catch {
      errors++;
    }
  }

  return {
    totalRecords: records.length,
    paid,
    errors,
    records,
  };
}

// ── Full boleto generation ────────────────────────────────────────────────────

export function createBoletoData(params: BoletoGenerateParams): {
  nossoNumero: string;
  barcode: string;
  digitableLine: string;
} {
  const validated = BoletoParamsSchema.parse(params);
  const nossoNumero = validated.nossoNumero ?? generateNossoNumero();

  const barcode = generateBarcode({
    convenio: validated.bankConvenio,
    nossoNumero,
    carteira: validated.bankCarteira,
    dueDate: validated.dueDate,
    amount: validated.amount,
  });

  const digitableLine = generateDigitableLine(barcode);

  return { nossoNumero, barcode, digitableLine };
}

export { factorToDateDDMMAA };
