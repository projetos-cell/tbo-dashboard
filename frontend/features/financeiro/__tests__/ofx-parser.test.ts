/**
 * Unit tests for the OFX 1.x (SGML) bank statement parser.
 * Fixtures are based on real Banco do Brasil OFX export format.
 */

import { describe, it, expect } from "vitest";
import { parseOFX } from "../services/ofx-parser";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const OFX_BB_VALID = `OFXHEADER:100
DATA:OFXSGML
VERSION:151
SECURITY:NONE
ENCODING:UTF-8
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>20240115120000[-03:00]
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1001
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>001
<BRANCHID>1234-5
<ACCTID>00012345-6
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240101
<DTEND>20240115
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240101120000[-03:00]
<TRNAMT>-1500.00
<FITID>20240101001
<MEMO>PAGAMENTO FORNECEDOR ABC
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240105120000[-03:00]
<TRNAMT>5000.00
<FITID>20240105001
<MEMO>RECEBIMENTO CLIENTE XYZ LTDA
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240110120000[-03:00]
<TRNAMT>-250.50
<FITID>20240110001
<MEMO>TARIFA BANCARIA TED
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>15000.00
<DTASOF>20240115120000[-03:00]
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const OFX_CREDIT_CARD = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>BRL
<CCACCTFROM>
<ACCTID>4111111111111111
<ACCTTYPE>CREDITLINE
</CCACCTFROM>
<BANKTRANLIST>
<DTSTART>20240201
<DTEND>20240229
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240205
<TRNAMT>-320.00
<FITID>CC20240205001
<MEMO>SUPERMERCADO EXTRA
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240210
<TRNAMT>50.00
<FITID>CC20240210001
<MEMO>ESTORNO COMPRA
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const OFX_MISSING_OFX_TAG = `OFXHEADER:100
DATA:OFXSGML
<BANKMSGSRSV1>
</BANKMSGSRSV1>`;

const OFX_EMPTY_TRANSACTIONS = `OFXHEADER:100
DATA:OFXSGML
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>001
<ACCTID>12345-6
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240101
<DTEND>20240115
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const OFX_MIXED_CREDIT_TYPES = `OFXHEADER:100
DATA:OFXSGML
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>033
<ACCTID>99999-0
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240301
<DTEND>20240331
<STMTTRN>
<TRNTYPE>DEP
<DTPOSTED>20240301
<TRNAMT>2000.00
<FITID>DEP001
<MEMO>DEPOSITO EM DINHEIRO
</STMTTRN>
<STMTTRN>
<TRNTYPE>INT
<DTPOSTED>20240315
<TRNAMT>45.00
<FITID>INT001
<MEMO>RENDIMENTO CONTA INVESTIMENTO
</STMTTRN>
<STMTTRN>
<TRNTYPE>CHECK
<DTPOSTED>20240320
<TRNAMT>-800.00
<FITID>CHK001
<CHECKNUM>001234
<MEMO>CHEQUE EMITIDO
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("parseOFX", () => {
  describe("valid Banco do Brasil OFX 1.x", () => {
    it("parses successfully and returns success: true", () => {
      const result = parseOFX(OFX_BB_VALID);
      expect(result.success).toBe(true);
    });

    it("extracts bank account info correctly", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.bankId).toBe("001");
      expect(result.data.agencyId).toBe("1234-5");
      expect(result.data.accountId).toBe("00012345-6");
      expect(result.data.accountType).toBe("CHECKING");
      expect(result.data.currency).toBe("BRL");
    });

    it("parses 3 transactions", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(3);
    });

    it("parses debit transaction correctly", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      const tx = result.data.transactions[0];
      expect(tx.fitid).toBe("20240101001");
      expect(tx.date).toBe("2024-01-01");
      expect(tx.amount).toBe(1500.0);
      expect(tx.type).toBe("debit");
      expect(tx.description).toBe("PAGAMENTO FORNECEDOR ABC");
    });

    it("parses credit transaction correctly", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      const tx = result.data.transactions[1];
      expect(tx.fitid).toBe("20240105001");
      expect(tx.date).toBe("2024-01-05");
      expect(tx.amount).toBe(5000.0);
      expect(tx.type).toBe("credit");
    });

    it("parses decimal amounts correctly", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      const tx = result.data.transactions[2];
      expect(tx.amount).toBe(250.5);
      expect(tx.type).toBe("debit");
    });

    it("parses date range", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.startDate).toBe("2024-01-01");
      expect(result.data.endDate).toBe("2024-01-15");
    });

    it("parses balance", () => {
      const result = parseOFX(OFX_BB_VALID);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.balance).toBe(15000.0);
    });
  });

  describe("credit card OFX (CCACCTFROM)", () => {
    it("parses credit card account", () => {
      const result = parseOFX(OFX_CREDIT_CARD);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.accountId).toBe("4111111111111111");
      expect(result.data.accountType).toBe("CREDITLINE");
    });

    it("parses 2 transactions", () => {
      const result = parseOFX(OFX_CREDIT_CARD);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(2);
    });
  });

  describe("mixed credit type codes", () => {
    it("DEP type is treated as credit", () => {
      const result = parseOFX(OFX_MIXED_CREDIT_TYPES);
      if (!result.success) throw new Error("Expected success");
      const dep = result.data.transactions.find((t) => t.fitid === "DEP001");
      expect(dep?.type).toBe("credit");
      expect(dep?.amount).toBe(2000.0);
    });

    it("INT (interest) type is treated as credit", () => {
      const result = parseOFX(OFX_MIXED_CREDIT_TYPES);
      if (!result.success) throw new Error("Expected success");
      const int = result.data.transactions.find((t) => t.fitid === "INT001");
      expect(int?.type).toBe("credit");
    });

    it("CHECK type is treated as debit", () => {
      const result = parseOFX(OFX_MIXED_CREDIT_TYPES);
      if (!result.success) throw new Error("Expected success");
      const chk = result.data.transactions.find((t) => t.fitid === "CHK001");
      expect(chk?.type).toBe("debit");
      expect(chk?.checkNum).toBe("001234");
    });
  });

  describe("error cases", () => {
    it("returns error when <OFX> tag is missing", () => {
      const result = parseOFX(OFX_MISSING_OFX_TAG);
      expect(result.success).toBe(false);
      if (result.success) throw new Error("Expected error");
      expect(result.error.code).toBe("INVALID_FORMAT");
    });

    it("returns empty transactions for file with no STMTTRN blocks", () => {
      const result = parseOFX(OFX_EMPTY_TRANSACTIONS);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions).toHaveLength(0);
    });

    it("returns error for empty string", () => {
      const result = parseOFX("");
      expect(result.success).toBe(false);
    });
  });

  describe("date parsing", () => {
    it("parses YYYYMMDDHHMMSS[offset] format", () => {
      const content = OFX_BB_VALID.replace(
        "<DTPOSTED>20240101120000[-03:00]",
        "<DTPOSTED>20240101120000[-03:00]"
      );
      const result = parseOFX(content);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions[0].date).toBe("2024-01-01");
    });

    it("parses YYYYMMDD format (no time)", () => {
      const result = parseOFX(OFX_CREDIT_CARD);
      if (!result.success) throw new Error("Expected success");
      expect(result.data.transactions[0].date).toBe("2024-02-05");
    });
  });
});
