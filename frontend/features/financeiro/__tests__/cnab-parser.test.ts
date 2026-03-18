/**
 * Unit tests for the CNAB 240 return file parser.
 * Fixtures are based on Banco do Brasil CNAB 240 retorno layout (FEBRABAN standard).
 */

import { describe, it, expect } from "vitest";
import { parseCNAB240 } from "../services/cnab-parser";

// ── Fixture helpers ───────────────────────────────────────────────────────────

/** Pads a string to exactly `len` characters */
function pad(s: string, len: number): string {
  return s.slice(0, len).padEnd(len, " ");
}

/** Builds a CNAB 240 file header line (240 chars) */
function buildFileHeader(opts: {
  bankCode?: string;
  companyName?: string;
  direction?: "1" | "2";
  date?: string; // DDMMAAAA
} = {}): string {
  const bankCode = pad(opts.bankCode ?? "001", 3);
  const lot = "0000";
  const recordType = "0";
  const reserved1 = " ".repeat(9);
  const cnpjType = "2";
  const cnpj = pad("00000000000000", 14);
  const agreement = pad("CONV001", 20);
  const agency = pad("01234", 5);
  const dvAgency = "0";
  const account = pad("000012345", 12);
  const dvAccount = "6";
  const dvAgCt = " ";
  const companyName = pad(opts.companyName ?? "AGENCIA TBO LTDA", 30);
  const bankName = pad("BANCO DO BRASIL SA", 30);
  const reserved2 = " ".repeat(10);
  const direction = opts.direction ?? "2"; // 2=retorno
  const genDate = pad(opts.date ?? "15012024", 8);
  const genTime = "120000";
  const nsa = pad("000001", 6);
  const layoutVersion = "089";
  const density = "00000";
  const bankReserved = " ".repeat(20);
  const companyReserved = " ".repeat(20);
  const reserved3 = " ".repeat(29);

  const line =
    bankCode +
    lot +
    recordType +
    reserved1 +
    cnpjType +
    cnpj +
    agreement +
    agency +
    dvAgency +
    account +
    dvAccount +
    dvAgCt +
    companyName +
    bankName +
    reserved2 +
    direction +
    genDate +
    genTime +
    nsa +
    layoutVersion +
    density +
    bankReserved +
    companyReserved +
    reserved3;

  return line.slice(0, 240).padEnd(240, " ");
}

/** Builds a lot header line (240 chars) */
function buildLotHeader(lotNumber: string): string {
  const bankCode = "001";
  const lot = pad(lotNumber, 4);
  const recordType = "1";
  const rest = " ".repeat(232);
  return (bankCode + lot + recordType + rest).slice(0, 240).padEnd(240, " ");
}

/** Builds a Segment A detail line (240 chars) */
function buildSegmentA(opts: {
  lot?: string;
  sequence?: string;
  movementType?: string;
  returnCode?: string;
  recipientName?: string;
  documentNumber?: string;
  paymentDate?: string; // DDMMAAAA
  amount?: number; // BRL
}): string {
  const bankCode = "001";
  const lot = pad(opts.lot ?? "0001", 4);
  const recordType = "3";
  const sequence = pad(opts.sequence ?? "00001", 5);
  const segment = "A";
  const movType = opts.movementType ?? "0";
  const retCode = pad(opts.returnCode ?? "00", 2);
  // Positions 17-43: payment chamber + recipient bank/agency/account
  const paymentInfo = pad("018001012345" + "00012345-6  0 ", 27);
  const recipientName = pad(opts.recipientName ?? "NOME FAVORECIDO LTDA  ", 30);
  const docNumber = pad(opts.documentNumber ?? "DOC001", 20);
  const payDate = pad(opts.paymentDate ?? "05012024", 8); // DDMMAAAA at pos 93-101
  const currency = "BRL";
  // Amount as 15 digits, 2 implied decimal places
  const amountCents = Math.round((opts.amount ?? 1500) * 100);
  const amountStr = amountCents.toString().padStart(15, "0");
  // Remaining chars to fill to 240
  // Current length: 3+4+1+5+1+1+2+27+30+20+8+3+15 = 120
  const rest = " ".repeat(120);

  const line =
    bankCode +
    lot +
    recordType +
    sequence +
    segment +
    movType +
    retCode +
    paymentInfo +
    recipientName +
    docNumber +
    payDate +
    currency +
    amountStr +
    rest;

  return line.slice(0, 240).padEnd(240, " ");
}

/** Builds a Segment J detail line (240 chars) */
function buildSegmentJ(opts: {
  lot?: string;
  sequence?: string;
  returnCode?: string;
  beneficiaryName?: string;
  paymentDate?: string; // DDMMAAAA at position 99-107
  amount?: number; // BRL
}): string {
  const bankCode = "001";
  const lot = pad(opts.lot ?? "0001", 4);
  const recordType = "3";
  const sequence = pad(opts.sequence ?? "00002", 5);
  const segment = "J";
  const movType = "0";
  const retCode = pad(opts.returnCode ?? "00", 2);
  const barcode = pad("34191090020000000000310003900003500000000015000", 40);
  // Position 57-90: beneficiary name (34 chars)
  const benefName = pad(opts.beneficiaryName ?? "FORNECEDOR SERVICOS LTDA  ", 34);
  // Position 91-98: due date DDMMAAAA (8)
  const dueDate = pad("31012024", 8);
  // Position 99-106: payment date DDMMAAAA (8)
  const payDate = pad(opts.paymentDate ?? "05012024", 8);
  // Position 107-121: amount (15 digits)
  const amountCents = Math.round((opts.amount ?? 500) * 100);
  const amountStr = amountCents.toString().padStart(15, "0");
  // Fill remaining chars
  // Current: 3+4+1+5+1+1+2+40+34+8+8+15 = 122
  const rest = " ".repeat(118);

  const line =
    bankCode +
    lot +
    recordType +
    sequence +
    segment +
    movType +
    retCode +
    barcode +
    benefName +
    dueDate +
    payDate +
    amountStr +
    rest;

  return line.slice(0, 240).padEnd(240, " ");
}

/** Builds a lot trailer line (240 chars) */
function buildLotTrailer(lotNumber: string, recordCount: number): string {
  const bankCode = "001";
  const lot = pad(lotNumber, 4);
  const recordType = "5";
  const reserved = " ".repeat(9);
  const count = recordCount.toString().padStart(6, "0");
  const rest = " ".repeat(218);
  return (bankCode + lot + recordType + reserved + count + rest)
    .slice(0, 240)
    .padEnd(240, " ");
}

/** Builds a file trailer line (240 chars) */
function buildFileTrailer(totalLots: number, totalRecords: number): string {
  const bankCode = "001";
  const lot = "9999";
  const recordType = "9";
  const reserved = " ".repeat(9);
  const lots = totalLots.toString().padStart(6, "0");
  const records = totalRecords.toString().padStart(6, "0");
  const rest = " ".repeat(211);
  return (bankCode + lot + recordType + reserved + lots + records + rest)
    .slice(0, 240)
    .padEnd(240, " ");
}

// ── Complete fixture: 1 lot with 2 transactions (A + J) ──────────────────────

function buildValidCNAB240(): string {
  const lines = [
    buildFileHeader({ direction: "2", date: "15012024" }),
    buildLotHeader("0001"),
    buildSegmentA({
      lot: "0001",
      sequence: "00001",
      returnCode: "00",
      recipientName: "EMPRESA ALPHA LTDA",
      paymentDate: "05012024",
      amount: 1500.0,
    }),
    buildSegmentJ({
      lot: "0001",
      sequence: "00002",
      returnCode: "00",
      beneficiaryName: "FORNECEDOR BETA LTDA",
      paymentDate: "05012024",
      amount: 750.5,
    }),
    buildLotTrailer("0001", 4), // 2 detail + 1 header + 1 trailer
    buildFileTrailer(1, 6),
  ];
  return lines.join("\n");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("parseCNAB240", () => {
  describe("valid return file (retorno)", () => {
    it("parses successfully and returns success: true", () => {
      const result = parseCNAB240(buildValidCNAB240());
      expect(result.success).toBe(true);
    });

    it("extracts file header info", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      expect(result.data.header.bankCode).toBe("001");
      expect(result.data.header.direction).toBe("2");
    });

    it("parses 2 transactions (1 Segment A + 1 Segment J)", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(2);
    });

    it("parses Segment A transaction correctly", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      const tx = result.data.transactions.find((t) => t.segment === "A");
      expect(tx).toBeDefined();
      expect(tx?.segment).toBe("A");
      expect(tx?.returnCode).toBe("00");
      expect(tx?.amount).toBe(1500.0);
      expect(tx?.type).toBe("debit");
      expect(tx?.date).toBe("2024-01-05");
    });

    it("parses Segment J (boleto) transaction correctly", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      const tx = result.data.transactions.find((t) => t.segment === "J");
      expect(tx).toBeDefined();
      expect(tx?.segment).toBe("J");
      expect(tx?.returnCode).toBe("00");
      expect(tx?.amount).toBe(750.5);
      expect(tx?.type).toBe("debit");
    });

    it("includes lot and sequence on each transaction", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions[0].lot).toBe("0001");
      expect(result.data.transactions[0].sequence).toBeTruthy();
    });
  });

  describe("return code filtering", () => {
    it("skips Segment A transactions with non-zero return code", () => {
      const lines = [
        buildFileHeader(),
        buildLotHeader("0001"),
        buildSegmentA({ returnCode: "01", amount: 999 }), // rejected
        buildSegmentA({ returnCode: "00", amount: 500 }), // accepted
        buildLotTrailer("0001", 4),
        buildFileTrailer(1, 6),
      ];
      const result = parseCNAB240(lines.join("\n"));
      if (!result.success) throw new Error("Expected success");
      // Only the "00" transaction should be parsed
      expect(result.data.transactions).toHaveLength(1);
      expect(result.data.transactions[0].amount).toBe(500);
    });

    it("skips Segment J transactions with non-zero return code", () => {
      const lines = [
        buildFileHeader(),
        buildLotHeader("0001"),
        buildSegmentJ({ returnCode: "02", amount: 999 }), // rejected
        buildSegmentJ({ returnCode: "00", amount: 300 }), // accepted
        buildLotTrailer("0001", 4),
        buildFileTrailer(1, 6),
      ];
      const result = parseCNAB240(lines.join("\n"));
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(1);
      expect(result.data.transactions[0].amount).toBe(300);
    });
  });

  describe("date parsing", () => {
    it("converts DDMMAAAA to YYYY-MM-DD for segment A", () => {
      const lines = [
        buildFileHeader(),
        buildLotHeader("0001"),
        buildSegmentA({ paymentDate: "25122023", amount: 100 }),
        buildLotTrailer("0001", 3),
        buildFileTrailer(1, 5),
      ];
      const result = parseCNAB240(lines.join("\n"));
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions[0].date).toBe("2023-12-25");
    });
  });

  describe("amount parsing", () => {
    it("correctly converts cents to BRL (2 decimal places)", () => {
      const lines = [
        buildFileHeader(),
        buildLotHeader("0001"),
        buildSegmentA({ amount: 1234.56 }),
        buildLotTrailer("0001", 3),
        buildFileTrailer(1, 5),
      ];
      const result = parseCNAB240(lines.join("\n"));
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions[0].amount).toBeCloseTo(1234.56, 2);
    });
  });

  describe("error cases", () => {
    it("returns error for empty content", () => {
      const result = parseCNAB240("");
      expect(result.success).toBe(false);
      if (result.success) throw new Error("Expected error");
      expect(result.error.code).toBe("INVALID_FORMAT");
    });

    it("returns error when first line is not 240 chars", () => {
      const result = parseCNAB240("linha curta");
      expect(result.success).toBe(false);
      if (result.success) throw new Error("Expected error");
      expect(result.error.code).toBe("INVALID_LINE_LENGTH");
    });

    it("returns empty transactions when file has only headers/trailers", () => {
      const lines = [
        buildFileHeader(),
        buildLotHeader("0001"),
        buildLotTrailer("0001", 2),
        buildFileTrailer(1, 4),
      ];
      const result = parseCNAB240(lines.join("\n"));
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(0);
    });
  });

  describe("trailer data", () => {
    it("reads total lots and records from file trailer", () => {
      const result = parseCNAB240(buildValidCNAB240());
      if (!result.success) throw new Error("Expected success");
      expect(result.data.totalLots).toBe(1);
      expect(result.data.totalRecords).toBe(6);
    });
  });
});
