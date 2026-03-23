/**
 * Executa os seed SQL por BU via Supabase Management API (execute_sql).
 * Como os arquivos são grandes, quebra cada BU em SOPs individuais.
 *
 * Uso: node scripts/run-seeds.mjs
 */

import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const SOP_ROOT = "C:/Users/marco/Desktop/SOPS TBO/tbo-sop-generator/output";
const TENANT_ID = "89080d1a-bc79-4c3f-8fce-20aabc561c0d";
const SUPABASE_URL = "https://olnndpultyllyhzxuyxh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU";

// Ler service role key do .env.local se existir, senão usar abordagem alternativa
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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

function detectCategory(title, content) {
  const l = (title + " " + content).toLowerCase();
  if (l.includes("checklist") || l.includes("controle de qualidade") || l.includes("qa")) return "checklist";
  if (l.includes("referência") || l.includes("gestão de assets")) return "referencia";
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
    if (c.match(/^(código|versão|data|autor|departamento|revisão|standard)/i)) continue;
    if (c.length > 30 && c.length < 500) return c.substring(0, 300);
  }
  return null;
}

function extractTags(title, bu) {
  const tags = [];
  const buTags = {
    "digital-3d": ["3d", "render"], branding: ["marca", "design"], marketing: ["marketing", "campanha"],
    audiovisual: ["video", "filme"], gamificacao: ["interativo"], operacoes: ["operacoes", "gestao"],
    atendimento: ["atendimento", "cliente"], comercial: ["comercial", "vendas"],
    financeiro: ["financeiro"], "recursos-humanos": ["rh", "pessoas"],
    relacionamentos: ["relacionamento"], politicas: ["politica", "compliance"],
  };
  return buTags[bu] || [];
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
    steps.push({ title: `${num}. ${rawTitle}`.substring(0, 200), content: cText.substring(0, 3000), step_type: type });
  }
  return steps;
}

// Insert via Supabase REST API (bypasses RLS with service key, or uses anon key)
async function insertSop(sop) {
  const key = SERVICE_KEY || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_sops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(sop),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insert SOP failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data[0];
}

async function insertSteps(steps) {
  if (steps.length === 0) return;
  const key = SERVICE_KEY || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_sop_steps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(steps),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insert steps failed: ${res.status} ${text}`);
  }
}

async function deleteStepsForSop(sopId) {
  const key = SERVICE_KEY || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_sop_steps?sop_id=eq.${sopId}`, {
    method: "DELETE",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
    },
  });
  // Ignore errors on delete (may not exist)
}

async function main() {
  const dirs = fs.readdirSync(SOP_ROOT).filter(d => fs.statSync(path.join(SOP_ROOT, d)).isDirectory() && DIR_TO_BU[d]).sort();

  let totalSops = 0;
  let totalSteps = 0;
  let errors = 0;

  for (const dir of dirs) {
    const bu = DIR_TO_BU[dir];
    const dirPath = path.join(SOP_ROOT, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".docx")).sort();
    console.log(`\n📁 ${bu} (${files.length} files)`);

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

        const sopData = {
          tenant_id: TENANT_ID,
          title: parsed.title,
          slug,
          bu,
          category: cat,
          description: desc,
          content: text.substring(0, 15000),
          status: "published",
          priority: pri,
          tags,
          order_index: i,
          version: 1,
        };

        const inserted = await insertSop(sopData);
        const sopId = inserted.id;

        // Delete existing steps then insert new ones
        await deleteStepsForSop(sopId);

        if (steps.length > 0) {
          const stepsData = steps.map((s, idx) => ({
            sop_id: sopId,
            title: s.title,
            content: s.content,
            order_index: idx,
            step_type: s.step_type,
          }));

          // Insert in batches of 20 to avoid payload limits
          for (let b = 0; b < stepsData.length; b += 20) {
            await insertSteps(stepsData.slice(b, b + 20));
          }
        }

        totalSops++;
        totalSteps += steps.length;
        console.log(`  ✅ ${parsed.code} — ${parsed.title} (${steps.length} steps)`);
      } catch (e) {
        errors++;
        console.error(`  ❌ ${parsed.code}: ${e.message.substring(0, 200)}`);
      }
    }
  }

  console.log(`\n════════════════════════════════`);
  console.log(`📊 Total: ${totalSops} SOPs, ${totalSteps} steps`);
  if (errors > 0) console.log(`❌ Erros: ${errors}`);
  console.log(`════════════════════════════════`);
}

main().catch(console.error);
