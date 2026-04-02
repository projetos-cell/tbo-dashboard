/**
 * Script one-shot para importar CSVs do Órulo no Supabase.
 * Uso: node scripts/import-orulo-csvs.mjs
 */
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(resolve(dirname(fileURLToPath(import.meta.url)), "../frontend/package.json"));
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../frontend/.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT_ID = "89080d1a-bc79-4c3f-8fce-20aabc561c0d";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CSV files to import
const FILES = [
  { path: resolve(__dirname, "../frontend/data/orulo/orulo_rj_completo.csv"), region: "rj" },
  { path: resolve(__dirname, "../frontend/data/orulo/orulo_sc_completo.csv"), region: "sc" },
  { path: resolve(__dirname, "../frontend/data/orulo/orulo_sp_completo.csv"), region: "sp" },
  { path: resolve(__dirname, "../frontend/data/orulo/orulo_curitiba_completo.csv"), region: "curitiba" },
  { path: resolve(__dirname, "../frontend/data/orulo/orulo_pr_completo.csv"), region: "pr" },
];

// ---------------------------------------------------------------------------
// CSV Parser
// ---------------------------------------------------------------------------

function parseCSVLine(line) {
  const fields = [];
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

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function parseNumeric(val) {
  if (!val || val.trim() === "") return null;
  const clean = val.replace(/[^\d.,\-]/g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

function parseDate(val) {
  if (!val || val.trim() === "") return null;
  const parts = val.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

function mapRow(row, region) {
  const documents = {};
  if (row.Apresentacoes?.trim()) documents.apresentacoes = row.Apresentacoes.split("|").map((s) => s.trim());
  if (row.Books?.trim()) documents.books = row.Books.split("|").map((s) => s.trim());
  if (row.Folders?.trim()) documents.folders = row.Folders.split("|").map((s) => s.trim());
  if (row.Tabelas?.trim()) documents.tabelas = row.Tabelas.split("|").map((s) => s.trim());

  return {
    tenant_id: TENANT_ID,
    orulo_id: row.ID,
    name: row.Nome || null,
    status: row.Status || null,
    description: row.Descricao || null,
    street: row.Endereco || null,
    area: row.Bairro || null,
    city: row.Cidade || null,
    state: row.UF || null,
    min_price: parseNumeric(row.Preco_Min),
    max_price: parseNumeric(row.Preco_Max),
    min_area: parseNumeric(row.Area_Min_m2),
    max_area: parseNumeric(row.Area_Max_m2),
    min_bedrooms: parseNumeric(row.Quartos),
    min_suites: parseNumeric(row.Suites),
    min_parking: parseNumeric(row.Vagas),
    total_units: parseNumeric(row.Total_Unidades),
    number_of_floors: parseNumeric(row.Andares),
    apts_per_floor: parseNumeric(row.Unid_por_Andar),
    stock: parseNumeric(row.Estoque),
    developer_name: row.Incorporadora || null,
    orulo_url: row.URL_Orulo || null,
    webpage: row.Website || null,
    contact_name: row.Contato_Nome?.trim() || null,
    contact_phone: row.Telefone?.trim() || null,
    contact_email: row.Email?.trim() || null,
    contact_whatsapp: row.WhatsApp?.trim() || null,
    commission_pj: parseNumeric(row["Comissao_PJ_%"]),
    commission_pf: parseNumeric(row["Comissao_PF_%"]),
    documents: Object.keys(documents).length > 0 ? documents : null,
    launch_date: parseDate(row.Data_Lancamento),
    data_source: "csv_import",
    import_region: region,
    available: true,
    synced_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let totalImported = 0;
  let totalErrors = 0;

  for (const { path, region } of FILES) {
    console.log(`\n📦 Importando ${region.toUpperCase()}...`);
    const text = readFileSync(path, "utf-8");
    const rows = parseCSV(text);
    const buildings = rows.filter((r) => r.ID && r.ID.trim()).map((r) => mapRow(r, region));

    console.log(`   ${buildings.length} empreendimentos parseados`);

    // Upsert in batches
    const BATCH = 50;
    let batchOk = 0;
    let batchErr = 0;

    for (let i = 0; i < buildings.length; i += BATCH) {
      const batch = buildings.slice(i, i + BATCH);
      const { error } = await supabase
        .from("orulo_buildings")
        .upsert(batch, { onConflict: "orulo_id,tenant_id", ignoreDuplicates: false });

      if (error) {
        console.error(`   ❌ Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
        batchErr += batch.length;
      } else {
        batchOk += batch.length;
      }
    }

    console.log(`   ✅ ${batchOk} importados, ${batchErr} erros`);
    totalImported += batchOk;
    totalErrors += batchErr;
  }

  console.log(`\n========================================`);
  console.log(`Total: ${totalImported} importados, ${totalErrors} erros`);
  console.log(`========================================`);
}

main().catch(console.error);
