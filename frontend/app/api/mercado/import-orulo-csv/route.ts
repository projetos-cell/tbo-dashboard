// ---------------------------------------------------------------------------
// POST /api/mercado/import-orulo-csv
// ---------------------------------------------------------------------------
// Importa dados de empreendimentos a partir de CSV exportado do Órulo.
// Faz upsert na tabela orulo_buildings por (orulo_id, tenant_id).
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ---------------------------------------------------------------------------
// CSV Parser (semicolon-delimited, double-quoted)
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Mapping CSV → orulo_buildings columns
// ---------------------------------------------------------------------------

function parseNumeric(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const clean = val.replace(/[^\d.,\-]/g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

function parseDate(val: string): string | null {
  if (!val || val.trim() === "") return null;
  // Format: dd/mm/yyyy
  const parts = val.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

function detectRegion(uf: string, cidade: string, filePath: string): string {
  const fp = filePath.toLowerCase();
  if (fp.includes("curitiba")) return "curitiba";
  if (fp.includes("_pr")) return "pr";
  if (fp.includes("_rj")) return "rj";
  if (fp.includes("_sc")) return "sc";
  if (fp.includes("_sp")) return "sp";

  // Fallback by UF
  if (uf === "PR" && cidade?.toLowerCase().includes("curitiba")) return "curitiba";
  if (uf === "PR") return "pr";
  if (uf === "RJ") return "rj";
  if (uf === "SC") return "sc";
  if (uf === "SP") return "sp";
  return uf?.toLowerCase() || "other";
}

interface CSVRow {
  [key: string]: string;
}

function mapRowToBuilding(row: CSVRow, tenantId: string, region: string) {
  const documents: Record<string, string[]> = {};

  if (row.Apresentacoes?.trim()) {
    documents.apresentacoes = row.Apresentacoes.split("|").map((s) => s.trim());
  }
  if (row.Books?.trim()) {
    documents.books = row.Books.split("|").map((s) => s.trim());
  }
  if (row.Folders?.trim()) {
    documents.folders = row.Folders.split("|").map((s) => s.trim());
  }
  if (row.Tabelas?.trim()) {
    documents.tabelas = row.Tabelas.split("|").map((s) => s.trim());
  }

  return {
    tenant_id: tenantId,
    orulo_id: row.ID,
    name: row.Nome || null,
    status: row.Status || null,
    description: row.Descricao || null,

    // Endereço
    street: row.Endereco || null,
    area: row.Bairro || null,
    city: row.Cidade || null,
    state: row.UF || null,

    // Preços
    min_price: parseNumeric(row.Preco_Min),
    max_price: parseNumeric(row.Preco_Max),

    // Specs
    min_area: parseNumeric(row.Area_Min_m2),
    max_area: parseNumeric(row.Area_Max_m2),
    min_bedrooms: parseNumeric(row.Quartos) as number | null,
    min_suites: parseNumeric(row.Suites) as number | null,
    min_parking: parseNumeric(row.Vagas) as number | null,
    total_units: parseNumeric(row.Total_Unidades) as number | null,
    number_of_floors: parseNumeric(row.Andares) as number | null,
    apts_per_floor: parseNumeric(row.Unid_por_Andar) as number | null,
    stock: parseNumeric(row.Estoque) as number | null,

    // Developer
    developer_name: row.Incorporadora || null,

    // URLs
    orulo_url: row.URL_Orulo || null,
    webpage: row.Website || null,

    // Contato
    contact_name: row.Contato_Nome?.trim() || null,
    contact_phone: row.Telefone?.trim() || null,
    contact_email: row.Email?.trim() || null,
    contact_whatsapp: row.WhatsApp?.trim() || null,

    // Comissões
    commission_pj: parseNumeric(row["Comissao_PJ_%"]),
    commission_pf: parseNumeric(row["Comissao_PF_%"]),

    // Documentos
    documents: Object.keys(documents).length > 0 ? documents : null,

    // Datas
    launch_date: parseDate(row.Data_Lancamento),

    // Controle
    data_source: "csv_import",
    import_region: region,
    available: true,
    synced_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csv_data, region, tenant_id } = body as {
      csv_data: string;
      region: string;
      tenant_id: string;
    };

    if (!csv_data || !tenant_id) {
      return NextResponse.json(
        { error: "csv_data e tenant_id são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse CSV
    const rows = parseCSV(csv_data);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "CSV vazio ou formato inválido" },
        { status: 400 },
      );
    }

    // Map rows
    const buildings = rows
      .filter((r) => r.ID && r.ID.trim())
      .map((r) => mapRowToBuilding(r, tenant_id, region || detectRegion(r.UF, r.Cidade, "")));

    // Upsert in batches of 50
    const BATCH = 50;
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < buildings.length; i += BATCH) {
      const batch = buildings.slice(i, i + BATCH);

      const { error, count } = await supabase
        .from("orulo_buildings")
        .upsert(batch, {
          onConflict: "orulo_id,tenant_id",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    }

    // Log sync
    await supabase.from("orulo_sync_log").insert({
      tenant_id,
      status: errors > 0 ? "partial" : "success",
      buildings_synced: inserted,
      buildings_removed: 0,
      typologies_synced: 0,
      errors: errors > 0 ? { csv_import_errors: errors } : null,
      completed_at: new Date().toISOString(),
      duration_ms: 0,
    });

    return NextResponse.json({
      status: errors > 0 ? "partial" : "success",
      total_rows: rows.length,
      imported: inserted,
      updated,
      errors,
      region,
    });
  } catch (err) {
    console.error("Import CSV error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 },
    );
  }
}
