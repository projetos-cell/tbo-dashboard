// ============================================================================
// TBO OS — Edge Function: process-bank-return
//
// Receives a CNAB 400 retorno file from Banco do Brasil and updates
// finance_boletos status accordingly.
//
// Request: POST multipart/form-data
//   - file:      File (.ret — CNAB 400 retorno)
//   - tenant_id: string (UUID)
//
// Response: { totalRecords, paid, errors, updated, skipped }
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

// ── CNAB 400 return code → boleto status mapping ──────────────────────────────

type BoletoStatus = "emitido" | "pago" | "vencido" | "cancelado" | "substituido";

const RETURN_CODE_STATUS: Record<string, BoletoStatus> = {
  "06": "pago",       // Liquidação normal
  "17": "pago",       // Liquidação após baixa
  "09": "cancelado",  // Baixa por decurso de prazo
  "10": "cancelado",  // Baixa solicitada pelo beneficiário
  "02": "emitido",    // Entrada confirmada
  "05": "vencido",    // Vencimento alterado
};

interface RetornoRecord {
  nossoNumero: string;
  returnCode: string;
  paymentDate: string | null;
  creditDate: string | null;
  paidAmount: number | null;
  status: BoletoStatus;
}

// ── CNAB 400 Parser ───────────────────────────────────────────────────────────

function parseLine(line: string): RetornoRecord | null {
  if (line.length < 400 || line[0] === "0" || line[0] === "9") return null;

  const nossoNumero = line.slice(62, 72).trim();
  const returnCode  = line.slice(108, 110).trim();
  const occDate     = line.slice(110, 116).trim();    // DDMMAA
  const creditDate  = line.slice(116, 122).trim();    // DDMMAA
  const paidRaw     = line.slice(152, 165).replace(/\D/g, "");

  if (!nossoNumero) return null;

  const paidAmount = paidRaw ? parseInt(paidRaw, 10) / 100 : null;
  const status: BoletoStatus = RETURN_CODE_STATUS[returnCode] ?? "emitido";

  return {
    nossoNumero,
    returnCode,
    paymentDate: occDate || null,
    creditDate: creditDate || null,
    paidAmount,
    status,
  };
}

function parseCNAB400(content: string): RetornoRecord[] {
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseLine)
    .filter((r): r is RetornoRecord => r !== null);
}

/** Convert DDMMAA → ISO date or null */
function ddmmaaToISO(ddmmaa: string | null): string | null {
  if (!ddmmaa || ddmmaa.length !== 6) return null;
  const dd = ddmmaa.slice(0, 2);
  const mm = ddmmaa.slice(2, 4);
  const aa = ddmmaa.slice(4, 6);
  const year = parseInt(aa, 10) < 50 ? `20${aa}` : `19${aa}`;
  return `${year}-${mm}-${dd}T00:00:00Z`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let tenantId: string;
  let fileContent: string;

  try {
    const formData = await req.formData();
    tenantId = (formData.get("tenant_id") as string | null) ?? "";
    const file = formData.get("file") as File | null;

    if (!tenantId) return json({ error: "tenant_id is required" }, 400);
    if (!file) return json({ error: "file is required" }, 400);

    fileContent = await file.text();
  } catch (err) {
    return json({ error: `Failed to parse request: ${String(err)}` }, 400);
  }

  const records = parseCNAB400(fileContent);

  if (records.length === 0) {
    return json({ totalRecords: 0, paid: 0, errors: 0, updated: 0, skipped: 0 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of records) {
    try {
      const updatePayload: Record<string, unknown> = {
        status: record.status,
        bank_return_code: record.returnCode,
        updated_at: new Date().toISOString(),
      };

      if (record.status === "pago") {
        updatePayload.paid_at = ddmmaaToISO(record.paymentDate);
        if (record.paidAmount !== null) {
          updatePayload.paid_amount = record.paidAmount;
        }
      }

      const { data, error } = await supabase
        .from("finance_boletos")
        .update(updatePayload)
        .eq("tenant_id", tenantId)
        .eq("nosso_numero", record.nossoNumero)
        .neq("status", "cancelado")       // never overwrite cancelled boletos
        .select("id");

      if (error) {
        console.error(`[process-bank-return] update error: ${error.message}`);
        errors++;
      } else if (!data || data.length === 0) {
        skipped++; // nosso_numero not found
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`[process-bank-return] unexpected error: ${String(err)}`);
      errors++;
    }
  }

  return json({
    totalRecords: records.length,
    paid: records.filter((r) => r.status === "pago").length,
    errors,
    updated,
    skipped,
  });
});
