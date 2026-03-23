/**
 * Gera arquivos SQL de seed separados por BU para execução individual.
 * Uso: node scripts/generate-bu-seeds.mjs
 */

import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const SOP_ROOT = "C:/Users/marco/Desktop/SOPS TBO/tbo-sop-generator/output";
const OUTPUT_DIR = "scripts/seeds";
const TENANT_ID = "89080d1a-bc79-4c3f-8fce-20aabc561c0d";

const DIR_TO_BU = {
  "01_Digital-3D": "digital-3d",
  "02_Branding": "branding",
  "03_Marketing": "marketing",
  "04_Audiovisual": "audiovisual",
  "05_Gamificacao": "gamificacao",
  "06_Operacoes": "operacoes",
  "07_Atendimento": "atendimento",
  "08_Comercial": "comercial",
  "09_Financeiro": "financeiro",
  "10_Recursos-Humanos": "recursos-humanos",
  "11_Relacionamentos": "relacionamentos",
  "12_Politicas": "politicas",
};

function parseFilename(filename) {
  const base = filename.replace(".docx", "");
  const match = base.match(/^SOP_(TBO-[A-Za-z0-9]+-\d+)_(.+)$/);
  if (!match) return null;
  return { code: match[1], title: match[2].replace(/-/g, " ").replace(/\s+/g, " ").trim() };
}

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function esc(str) {
  if (!str) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

function detectCategory(title, content) {
  const l = (title + " " + content).toLowerCase();
  if (l.includes("checklist") || l.includes("controle de qualidade") || l.includes("qa")) return "checklist";
  if (l.includes("política") || l.includes("codigo de conduta") || l.includes("seguranca da informacao")) return "politicas";
  if (l.includes("guia") || l.includes("referência") || l.includes("gestão de assets")) return "referencia";
  return "processo";
}

function detectPriority(title) {
  const l = title.toLowerCase();
  if (l.includes("qualidade") || l.includes("segurança") || l.includes("código de conduta")) return "critical";
  if (l.includes("entrega") || l.includes("aprovação") || l.includes("controle")) return "high";
  return "medium";
}

function extractDescription(text) {
  const lines = text.split("\n").filter(l => l.trim().length > 20);
  for (const line of lines) {
    const c = line.trim();
    if (c.startsWith("#")) continue;
    if (c.match(/^(código|versão|data|autor|departamento|revisão)/i)) continue;
    if (c.length > 30 && c.length < 500) return c.substring(0, 300);
  }
  return null;
}

function extractTags(title, bu) {
  const tags = new Set();
  const buTags = {
    "digital-3d": ["3d", "render"], branding: ["marca", "design"], marketing: ["marketing", "campanha"],
    audiovisual: ["video", "filme"], gamificacao: ["interativo"], operacoes: ["operacoes", "gestao"],
    atendimento: ["atendimento", "cliente"], comercial: ["comercial", "vendas"],
    financeiro: ["financeiro"], "recursos-humanos": ["rh", "pessoas"],
    relacionamentos: ["relacionamento"], politicas: ["politica", "compliance"],
  };
  (buTags[bu] || []).forEach(t => tags.add(t));
  return Array.from(tags).slice(0, 4);
}

function extractSteps(html) {
  const steps = [];
  const pat = /<p><strong>\s*(\d+(?:\.\d+)?)\.\s*(.*?)<\/strong><\/p>/g;
  const matches = [...html.matchAll(pat)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const num = m[1];
    const rawTitle = m[2].replace(/<[^>]+>/g, "").trim();
    if (!rawTitle || rawTitle.length < 2) continue;
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const cHtml = html.substring(start, end).trim();
    const cText = cHtml.replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
    if (!cText) continue;
    let type = "step";
    const lt = rawTitle.toLowerCase();
    if (lt.includes("atenção") || lt.includes("cuidado") || lt.includes("risco")) type = "warning";
    else if (lt.includes("dica") || lt.includes("boas práticas") || lt.includes("melhoria")) type = "tip";
    else if (lt.includes("nota") || lt.includes("glossário") || lt.includes("definições")) type = "note";
    else if (lt.includes("check") || lt.includes("indicadores") || lt.includes("kpi")) type = "checkpoint";
    steps.push({ title: `${num}. ${rawTitle}`.substring(0, 200), content: cText.substring(0, 5000), step_type: type });
  }
  return steps;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const dirs = fs.readdirSync(SOP_ROOT).filter(d => fs.statSync(path.join(SOP_ROOT, d)).isDirectory() && DIR_TO_BU[d]).sort();

  for (const dir of dirs) {
    const bu = DIR_TO_BU[dir];
    const dirPath = path.join(SOP_ROOT, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".docx")).sort();

    let sql = `-- Seed: ${bu} (${files.length} SOPs)\nDO $$\nDECLARE v_sop_id UUID;\nBEGIN\n`;

    for (let i = 0; i < files.length; i++) {
      const parsed = parseFilename(files[i]);
      if (!parsed) continue;
      try {
        const { value: html } = await mammoth.convertToHtml({ path: path.join(dirPath, files[i]) });
        const { value: text } = await mammoth.extractRawText({ path: path.join(dirPath, files[i]) });
        const slug = slugify(parsed.code + "-" + parsed.title);
        const desc = extractDescription(text);
        const cat = detectCategory(parsed.title, text);
        const pri = detectPriority(parsed.title);
        const tags = extractTags(parsed.title, bu);
        const steps = extractSteps(html);
        const tagsArr = `ARRAY[${tags.map(t => `'${t}'`).join(",")}]::TEXT[]`;

        // Truncar content para manter SQL gerenciável
        const contentTrunc = text.substring(0, 15000);

        sql += `\n  -- ${parsed.code}\n`;
        sql += `  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)\n`;
        sql += `  VALUES ('${TENANT_ID}', ${esc(parsed.title)}, ${esc(slug)}, '${bu}', '${cat}', ${esc(desc)}, ${esc(contentTrunc)}, 'published', '${pri}', ${tagsArr}, ${i}, 1)\n`;
        sql += `  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()\n`;
        sql += `  RETURNING id INTO v_sop_id;\n`;

        // Steps
        if (steps.length > 0) {
          sql += `  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;\n`;
          for (let s = 0; s < steps.length; s++) {
            const st = steps[s];
            sql += `  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, ${esc(st.title)}, ${esc(st.content)}, ${s}, '${st.step_type}');\n`;
          }
        }
        console.log(`  ✅ ${parsed.code} (${steps.length} steps)`);
      } catch (e) {
        console.error(`  ❌ ${files[i]}: ${e.message}`);
      }
    }

    sql += `\nEND $$;\n`;
    const outPath = path.join(OUTPUT_DIR, `seed_${bu}.sql`);
    fs.writeFileSync(outPath, sql, "utf-8");
    const size = (fs.statSync(outPath).size / 1024).toFixed(0);
    console.log(`📦 ${bu}: ${files.length} SOPs → ${outPath} (${size} KB)\n`);
  }
}

main().catch(console.error);
