// ============================================================================
// TBO OS — Edge Function: import-bank-statement
//
// Receives an OFX or CNAB 240 bank statement file and imports transactions
// into finance_bank_transactions.
//
// Request: POST multipart/form-data
//   - file:            File (OFX or CNAB 240)
//   - bank_account_id: string (UUID)
//   - tenant_id:       string (UUID)
//   - file_type:       "ofx" | "cnab240" (optional, auto-detected if omitted)
//
// Response: { inserted, skipped, errors, totalParsed }
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ── OFX SGML parser (inline — Edge Functions can't import from frontend/) ────

interface ParsedTransaction {
  fitid: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
}

interface ParsedStatement {
  bankId: string;
  accountId: string;
  transactions: ParsedTransaction[];
}

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
  const end = upper.indexOf(close, start + open.length);
  if (end === -1) return undefined;
  return body.slice(start + open.length, end);
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
    const end = upper.indexOf(close, start + open.length);
    if (end === -1) break;
    results.push(body.slice(start + open.length, end));
    cursor = end + close.length;
  }
  return results;
}

function ofxDate(raw: string): string {
  const digits = raw.replace(/\[.*\]/, "").replace(/\..+$/, "").trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function parseOFXContent(content: string): ParsedStatement {
  const body = content.slice(
    Math.max(0, content.toUpperCase().indexOf("<OFX>"))
  );
  const acctBlock =
    extractBlock(body, "BANKACCTFROM") ??
    extractBlock(body, "CCACCTFROM") ??
    "";
  const bankId =
    extractLeaf(acctBlock, "BANKID") ?? extractLeaf(body, "BANKID") ?? "";
  const accountId = extractLeaf(acctBlock, "ACCTID") ?? "";
  const tranList = extractBlock(body, "BANKTRANLIST") ?? body;
  const txBlocks = extractAllBlocks(tranList, "STMTTRN");

  const creditTypes = new Set(["CREDIT", "DEP", "INT", "DIV", "DIRECTDEP"]);

  const transactions: ParsedTransaction[] = txBlocks.flatMap((block) => {
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

    if (!rawDate || !rawAmount || !fitid) return [];

    const amount = parseFloat(rawAmount.replace(",", "."));
    if (isNaN(amount)) return [];

    const isCredit = amount > 0 || creditTypes.has(trnType);

    return [
      {
        fitid,
        date: ofxDate(rawDate),
        amount: Math.abs(amount),
        type: isCredit ? "credit" : "debit",
        description: memo,
      } satisfies ParsedTransaction,
    ];
  });

  return { bankId, accountId, transactions };
}

// ── CNAB 240 parser (inline) ──────────────────────────────────────────────────

function cnabDate(raw: string): string {
  const s = raw.trim();
  if (s.length < 8 || s === "00000000") {
    return new Date().toISOString().slice(0, 10);
  }
  return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
}

function cnabAmount(raw: string): number {
  const digits = raw.trim().replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
}

function parseCNAB240Content(content: string): ParsedStatement {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);

  const header = lines[0]?.padEnd(240, " ") ?? "";
  const bankId = header.slice(0, 3).trim();
  const transactions: ParsedTransaction[] = [];

  for (const rawLine of lines) {
    const line = rawLine.padEnd(240, " ");
    if (line[7] !== "3") continue; // only detail records

    const segment = line[13]?.toUpperCase();
    let tx: ParsedTransaction | null = null;

    if (segment === "A") {
      const name = line.slice(44, 74).trim();
      const date = cnabDate(line.slice(93, 101));
      const amount = cnabAmount(line.slice(119, 134));
      const fitid = `${line.slice(3, 7)}-${line.slice(8, 13)}-A`;
      const returnCode = line.slice(15, 17).trim();
      if (returnCode === "00" || returnCode === "") {
        tx = { fitid, date, amount, type: "debit", description: name };
      }
    } else if (segment === "J") {
      const name = line.slice(57, 91).trim();
      const date = cnabDate(line.slice(99, 107));
      const amount = cnabAmount(line.slice(107, 122));
      const fitid = `${line.slice(3, 7)}-${line.slice(8, 13)}-J`;
      const returnCode = line.slice(15, 17).trim();
      if (returnCode === "00" || returnCode === "") {
        tx = { fitid, date, amount, type: "debit", description: name };
      }
    }

    if (tx) transactions.push(tx);
  }

  return { bankId, accountId: "", transactions };
}

// ── File type detection ───────────────────────────────────────────────────────

function detectFileType(content: string): "ofx" | "cnab240" | "unknown" {
  const upper = content.slice(0, 100).toUpperCase();
  if (upper.includes("OFXHEADER") || upper.includes("<OFX>")) return "ofx";
  // CNAB 240: first line should be exactly 240 chars with record type '0' at pos 7
  const firstLine = content.split(/\r?\n/)[0] ?? "";
  if (firstLine.length >= 240 && firstLine[7] === "0") return "cnab240";
  return "unknown";
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido" }, 405);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bankAccountId = formData.get("bank_account_id") as string | null;
    const tenantId = formData.get("tenant_id") as string | null;
    const fileTypeHint = formData.get("file_type") as string | null;

    if (!file || !bankAccountId || !tenantId) {
      return json(
        { error: "Parâmetros obrigatórios: file, bank_account_id, tenant_id" },
        400
      );
    }

    const content = await file.text();
    const fileType =
      fileTypeHint === "cnab240"
        ? "cnab240"
        : fileTypeHint === "ofx"
          ? "ofx"
          : detectFileType(content);

    if (fileType === "unknown") {
      return json({ error: "Tipo de arquivo não reconhecido (esperado OFX ou CNAB 240)" }, 400);
    }

    const parsed =
      fileType === "ofx"
        ? parseOFXContent(content)
        : parseCNAB240Content(content);

    if (parsed.transactions.length === 0) {
      return json({ inserted: 0, skipped: 0, errors: [], totalParsed: 0 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify bank_account belongs to tenant
    const { data: account, error: acctErr } = await supabase
      .from("finance_bank_accounts")
      .select("id, tenant_id")
      .eq("id", bankAccountId)
      .eq("tenant_id", tenantId)
      .single();

    if (acctErr || !account) {
      return json({ error: "Conta bancária não encontrada para o tenant informado" }, 404);
    }

    // Build insert payload
    const rows = parsed.transactions.map((tx) => ({
      tenant_id: tenantId,
      bank_account_id: bankAccountId,
      transaction_date: tx.date,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      ofx_id: tx.fitid,
      reconciled: false,
    }));

    // Upsert (ignore duplicates by ofx_id)
    const { data: inserted, error: insertErr } = await supabase
      .from("finance_bank_transactions")
      .upsert(rows, { onConflict: "bank_account_id,ofx_id", ignoreDuplicates: true })
      .select("id");

    if (insertErr) {
      console.error("[import-bank-statement] insert error:", insertErr.message);
      return json({ error: `Erro ao inserir transações: ${insertErr.message}` }, 500);
    }

    const insertedCount = inserted?.length ?? 0;
    const skippedCount = rows.length - insertedCount;

    // Update last_sync_at on the bank account
    await supabase
      .from("finance_bank_accounts")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", bankAccountId);

    return json({
      inserted: insertedCount,
      skipped: skippedCount,
      errors: [],
      totalParsed: parsed.transactions.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    console.error("[import-bank-statement] unhandled error:", msg);
    return json({ error: msg }, 500);
  }
});
