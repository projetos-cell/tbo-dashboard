/**
 * parse-demands-csv.mjs
 *
 * Reads the Notion "BD Demandas TBO" CSV export and generates SQL INSERT
 * statements for the `demands` table, mapping projects via notion_page_id.
 *
 * Usage:  node scripts/parse-demands-csv.mjs <csv_path> > output.sql
 */
import { readFileSync } from 'fs';
import { parse } from 'path';

// ── Config ──────────────────────────────────────────────────────────────────
const TENANT_ID = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';

// ── Read CSV ────────────────────────────────────────────────────────────────
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/parse-demands-csv.mjs <csv_path>');
  process.exit(1);
}

const raw = readFileSync(csvPath, 'utf-8');

// ── Simple CSV parser that handles quoted fields with commas ────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Handle multi-line quoted fields
function parseCSV(text) {
  const rows = [];
  let currentLine = '';
  let inQuotes = false;

  for (const line of text.split('\n')) {
    if (!currentLine && !inQuotes) {
      // count quotes
      const quoteCount = (line.match(/"/g) || []).length;
      if (quoteCount % 2 === 1) {
        // odd number of quotes, field spans multiple lines
        currentLine = line;
        inQuotes = true;
        continue;
      }
      rows.push(line);
    } else {
      currentLine += '\n' + line;
      const quoteCount = (currentLine.match(/"/g) || []).length;
      if (quoteCount % 2 === 0) {
        rows.push(currentLine);
        currentLine = '';
        inQuotes = false;
      }
    }
  }
  if (currentLine) rows.push(currentLine);
  return rows.filter(r => r.trim());
}

const lines = parseCSV(raw);
const header = parseCSVLine(lines[0]);

// ── Parse each row ──────────────────────────────────────────────────────────
function extractNotionPageId(projectField) {
  // Extract notion_page_id from: "ProjectName (https://www.notion.so/ProjectName-<ID>?pvs=21)"
  // Can have multiple projects separated by comma
  // Handles project names with parentheses like "Reserva Tuiuti (PRC)"
  if (!projectField) return [];

  const results = [];
  // Match everything before "(https://" as the name, allowing nested parens
  const regex = /(.+?)\s*\(https:\/\/www\.notion\.so\/[^?]+-([a-f0-9]{32})\?/g;
  let match;
  while ((match = regex.exec(projectField)) !== null) {
    // Clean up project name: remove leading commas, "pvs=21)" residues, extra whitespace
    let name = match[1].trim()
      .replace(/^,\s*/, '')
      .replace(/pvs=\d+\)\s*,?\s*/g, '')
      .replace(/\?\s*$/, '')
      .trim();
    results.push({ name, notionPageId: match[2] });
  }
  return results;
}

function parseDateField(dateStr) {
  // Formats: DD/MM/YYYY, DD/MM/YYYY → DD/MM/YYYY, DD/MM/YYYY HH:MM (BRT) → ...
  if (!dateStr || !dateStr.trim()) return { start: null, end: null };

  // Remove time portions like " 0:00 (BRT)" or " 14:00 (BRT)"
  const cleaned = dateStr.replace(/\s+\d{1,2}:\d{2}\s*\([A-Z]+\)/g, '').trim();

  if (cleaned.includes('→')) {
    const parts = cleaned.split('→').map(s => s.trim());
    return {
      start: convertDate(parts[0]),
      end: convertDate(parts[1])
    };
  }
  return { start: convertDate(cleaned), end: null };
}

function convertDate(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function parseBUs(busStr) {
  if (!busStr || !busStr.trim()) return null;
  // Split by comma, trim each
  const items = busStr.split(',').map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return items;
}

function parseTipoMidia(str) {
  if (!str || !str.trim()) return null;
  const items = str.split(',').map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return items;
}

function escapeSQL(str) {
  if (str === null || str === undefined || str === '') return 'NULL';
  return "'" + str.replace(/'/g, "''").trim() + "'";
}

function sqlArray(arr) {
  if (!arr || arr.length === 0) return 'NULL';
  const escaped = arr.map(s => '"' + s.replace(/"/g, '\\"') + '"');
  return "'{" + escaped.join(',') + "}'";
}

function sqlDate(d) {
  if (!d) return 'NULL';
  return "'" + d + "'";
}

function sqlBool(str) {
  if (!str || !str.trim()) return 'FALSE';
  const lower = str.toLowerCase().trim();
  if (lower === 'true' || lower === 'yes' || lower === 'sim' || lower === '1') return 'TRUE';
  return 'FALSE';
}

// ── Generate SQL ────────────────────────────────────────────────────────────
const inserts = [];

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < 2) continue;

  const demanda = fields[0]?.trim();
  if (!demanda) continue;

  const projectField = fields[1] || '';
  const busEnvolvidas = fields[2] || '';
  const feito = fields[3] || '';
  const formalizacao = fields[4] || '';
  const info = fields[5] || '';
  const milestones = fields[6] || '';
  const prazo = fields[7] || '';
  const prioridade = fields[8] || '';
  const responsavel = fields[9] || '';
  const status = fields[10] || '';
  const subitem = fields[11] || '';
  const tipoMidia = fields[12] || '';
  const itemPrincipal = fields[13] || '';

  const projects = extractNotionPageId(projectField);
  const dates = parseDateField(prazo);
  const bus = parseBUs(busEnvolvidas);
  const tipoMidiaArr = parseTipoMidia(tipoMidia);

  // For demands linked to multiple projects, create one row per project
  // For demands with no project, create one row with project_id = NULL
  const projectList = projects.length > 0 ? projects : [{ name: null, notionPageId: null }];

  for (const proj of projectList) {
    const projectSubquery = proj.notionPageId
      ? `(SELECT id FROM projects WHERE notion_page_id = '${proj.notionPageId}' AND tenant_id = '${TENANT_ID}' LIMIT 1)`
      : 'NULL';

    const values = [
      `'${TENANT_ID}'`,                              // tenant_id
      projectSubquery,                                 // project_id
      escapeSQL(demanda),                              // title
      escapeSQL(status || 'A fazer'),                  // status
      escapeSQL(responsavel || null),                  // responsible
      sqlDate(dates.start),                            // due_date
      sqlDate(dates.end),                              // due_date_end
      sqlArray(bus),                                   // bus
      escapeSQL(info || null),                         // info
      escapeSQL(prioridade || null),                   // prioridade
      escapeSQL(formalizacao || null),                 // formalizacao
      sqlArray(tipoMidiaArr),                          // tipo_midia
      escapeSQL(subitem || null),                      // subitem
      escapeSQL(itemPrincipal || null),                // item_principal
      sqlBool(feito),                                  // feito
      escapeSQL(milestones || null),                   // milestones
      escapeSQL(proj.name),                            // notion_project_name
      proj.notionPageId ? escapeSQL(proj.notionPageId) : 'NULL' // notion_page_id
    ];

    inserts.push(`(${values.join(', ')})`);
  }
}

// ── Output SQL ──────────────────────────────────────────────────────────────
console.log(`-- Auto-generated seed: demands`);
console.log(`-- Generated at: ${new Date().toISOString()}`);
console.log(`-- Total rows: ${inserts.length}`);
console.log('');
console.log(`-- Step 1: Clear existing demands (optional, remove if you want to append)`);
console.log(`DELETE FROM demands WHERE tenant_id = '${TENANT_ID}';`);
console.log('');
console.log(`INSERT INTO demands (`);
console.log(`  tenant_id, project_id, title, status, responsible,`);
console.log(`  due_date, due_date_end, bus, info, prioridade,`);
console.log(`  formalizacao, tipo_midia, subitem, item_principal,`);
console.log(`  feito, milestones, notion_project_name, notion_page_id`);
console.log(`) VALUES`);

// Split into batches of 50 for safety
const BATCH_SIZE = 50;
for (let b = 0; b < inserts.length; b += BATCH_SIZE) {
  const batch = inserts.slice(b, b + BATCH_SIZE);
  if (b > 0) {
    console.log('');
    console.log(`INSERT INTO demands (`);
    console.log(`  tenant_id, project_id, title, status, responsible,`);
    console.log(`  due_date, due_date_end, bus, info, prioridade,`);
    console.log(`  formalizacao, tipo_midia, subitem, item_principal,`);
    console.log(`  feito, milestones, notion_project_name, notion_page_id`);
    console.log(`) VALUES`);
  }
  console.log(batch.join(',\n') + ';');
}

console.log('');
console.log(`-- Verify count`);
console.log(`SELECT COUNT(*) as total_demands FROM demands WHERE tenant_id = '${TENANT_ID}';`);
