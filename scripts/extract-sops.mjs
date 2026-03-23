/**
 * Extrai conteúdo dos .docx de SOPs e gera seed SQL para knowledge_sops e knowledge_sop_steps.
 *
 * Uso: node scripts/extract-sops.mjs
 */

import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const SOP_ROOT = "C:/Users/marco/Desktop/SOPS TBO/tbo-sop-generator/output";
const OUTPUT_FILE = "supabase/migrations/20260322_seed_knowledge_sops.sql";

// Mapeamento de diretório → bu slug
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

// Extrair código e título do nome do arquivo
function parseFilename(filename) {
  // SOP_TBO-3D-001_Modelagem-3D.docx
  const base = filename.replace(".docx", "");
  const match = base.match(/^SOP_(TBO-[A-Za-z0-9]+-\d+)_(.+)$/);
  if (!match) return null;
  const code = match[1];
  const titleRaw = match[2].replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return { code, title: titleRaw };
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeSQL(str) {
  if (!str) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

// Detectar categoria baseada no conteúdo/título
function detectCategory(title, content) {
  const lower = (title + " " + content).toLowerCase();
  if (lower.includes("checklist") || lower.includes("controle de qualidade") || lower.includes("qa")) return "checklist";
  if (lower.includes("política") || lower.includes("codigo de conduta") || lower.includes("seguranca da informacao")) return "politicas";
  if (lower.includes("guia") || lower.includes("referência") || lower.includes("gestão de assets")) return "referencia";
  return "processo";
}

// Detectar prioridade
function detectPriority(title, code) {
  const lower = title.toLowerCase();
  if (lower.includes("qualidade") || lower.includes("segurança") || lower.includes("código de conduta")) return "critical";
  if (lower.includes("entrega") || lower.includes("aprovação") || lower.includes("controle")) return "high";
  return "medium";
}

// Extrair steps do conteúdo HTML
// Os docx usam <p><strong>N. Título</strong></p> como headers de seção
function extractSteps(html) {
  const steps = [];

  // Pattern: <p><strong> N. Título</strong></p>  (com possível espaço antes do número)
  // Split no padrão de seção numerada em bold
  const sectionPattern = /<p><strong>\s*(\d+(?:\.\d+)?)\.\s*(.*?)<\/strong><\/p>/g;

  const matches = [...html.matchAll(sectionPattern)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionNum = match[1];
    const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();

    // Pular seções de metadata (geralmente 1-4 são objetivo, escopo, RACI, pré-requisitos)
    // Manter apenas seções de conteúdo principal (tipicamente 5+)
    // Mas incluir todas como steps para completude

    if (!rawTitle || rawTitle.length < 2) continue;

    // Pegar conteúdo entre esta seção e a próxima
    const startIdx = match.index + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const contentHtml = html.substring(startIdx, endIdx).trim();

    // Texto limpo
    const textContent = contentHtml
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!textContent) continue;

    // Detectar tipo de step
    let stepType = "step";
    const lowerTitle = rawTitle.toLowerCase();
    if (lowerTitle.includes("atenção") || lowerTitle.includes("cuidado") || lowerTitle.includes("risco")) {
      stepType = "warning";
    } else if (lowerTitle.includes("dica") || lowerTitle.includes("boas práticas") || lowerTitle.includes("recomend") || lowerTitle.includes("melhoria")) {
      stepType = "tip";
    } else if (lowerTitle.includes("nota") || lowerTitle.includes("observ") || lowerTitle.includes("referência") || lowerTitle.includes("glossário") || lowerTitle.includes("definições")) {
      stepType = "note";
    } else if (lowerTitle.includes("check") || lowerTitle.includes("validação") || lowerTitle.includes("entrega") || lowerTitle.includes("indicadores") || lowerTitle.includes("kpi")) {
      stepType = "checkpoint";
    }

    steps.push({
      title: `${sectionNum}. ${rawTitle}`.substring(0, 200),
      content: textContent.substring(0, 5000),
      content_html: contentHtml.substring(0, 10000),
      step_type: stepType,
    });
  }

  return steps;
}

// Extrair descrição do conteúdo (primeiro parágrafo significativo)
function extractDescription(text) {
  const lines = text.split("\n").filter(l => l.trim().length > 20);
  // Pular linhas que parecem ser headers ou metadata
  for (const line of lines) {
    const clean = line.trim();
    if (clean.startsWith("#")) continue;
    if (clean.match(/^(código|versão|data|autor|departamento|revisão)/i)) continue;
    if (clean.length > 30 && clean.length < 500) {
      return clean.substring(0, 300);
    }
  }
  return null;
}

// Tags baseadas no conteúdo
function extractTags(title, bu, content) {
  const tags = new Set();
  const lower = (title + " " + content).toLowerCase();

  // Tags por BU
  const buTags = {
    "digital-3d": ["3d", "render", "archviz"],
    "branding": ["marca", "identidade", "design"],
    "marketing": ["marketing", "campanha", "digital"],
    "audiovisual": ["video", "filme", "audiovisual"],
    "gamificacao": ["interativo", "gamificacao"],
    "operacoes": ["operacoes", "processo", "gestao"],
    "atendimento": ["atendimento", "cliente"],
    "comercial": ["comercial", "vendas"],
    "financeiro": ["financeiro", "fiscal"],
    "recursos-humanos": ["rh", "pessoas"],
    "relacionamentos": ["relacionamento", "parceria"],
    "politicas": ["politica", "compliance"],
  };

  (buTags[bu] || []).forEach(t => tags.add(t));

  // Tags por conteúdo
  if (lower.includes("entrega")) tags.add("entrega");
  if (lower.includes("qualidade") || lower.includes("qa")) tags.add("qualidade");
  if (lower.includes("cliente")) tags.add("cliente");
  if (lower.includes("aprovação") || lower.includes("revisão")) tags.add("aprovacao");

  return Array.from(tags).slice(0, 6);
}

async function main() {
  const dirs = fs.readdirSync(SOP_ROOT).filter(d => {
    return fs.statSync(path.join(SOP_ROOT, d)).isDirectory() && DIR_TO_BU[d];
  });

  const allSops = [];
  let totalFiles = 0;

  for (const dir of dirs.sort()) {
    const bu = DIR_TO_BU[dir];
    const dirPath = path.join(SOP_ROOT, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".docx")).sort();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dirPath, file);
      const parsed = parseFilename(file);

      if (!parsed) {
        console.warn(`⚠ Skipping unparseable file: ${file}`);
        continue;
      }

      try {
        const result = await mammoth.convertToHtml({ path: filePath });
        const html = result.value;

        const textResult = await mammoth.extractRawText({ path: filePath });
        const text = textResult.value;

        const description = extractDescription(text);
        const category = detectCategory(parsed.title, text);
        const priority = detectPriority(parsed.title, parsed.code);
        const tags = extractTags(parsed.title, bu, text);
        const steps = extractSteps(html);
        const slug = slugify(parsed.code + "-" + parsed.title);

        allSops.push({
          code: parsed.code,
          title: parsed.title,
          slug,
          bu,
          category,
          description,
          content: text.substring(0, 50000),
          content_html: html.substring(0, 100000),
          priority,
          tags,
          order_index: i,
          steps,
        });

        totalFiles++;
        console.log(`✅ ${parsed.code} — ${parsed.title} (${steps.length} steps)`);
      } catch (err) {
        console.error(`❌ Error processing ${file}: ${err.message}`);
      }
    }
  }

  console.log(`\n📊 Total: ${totalFiles} SOPs processados\n`);

  // Gerar SQL
  let sql = `-- ─── Seed: Knowledge SOPs ─────────────────────────────────────────
-- Gerado automaticamente a partir dos .docx de SOPs da TBO
-- Total: ${totalFiles} SOPs
-- Data: ${new Date().toISOString().split("T")[0]}

-- Usar um tenant_id placeholder — será substituído na aplicação
-- Em produção, o insert será feito via aplicação com tenant_id real

DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  -- Pegar o primeiro tenant disponível
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado. Abortando seed.';
    RETURN;
  END IF;

`;

  for (const sop of allSops) {
    const tagsArray = `ARRAY[${sop.tags.map(t => `'${t}'`).join(",")}]::TEXT[]`;

    sql += `
  -- ── ${sop.code}: ${sop.title} ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    ${escapeSQL(sop.title)},
    ${escapeSQL(sop.slug)},
    ${escapeSQL(sop.bu)},
    ${escapeSQL(sop.category)},
    ${escapeSQL(sop.description)},
    ${escapeSQL(sop.content)},
    ${escapeSQL(sop.content_html)},
    'published',
    ${escapeSQL(sop.priority)},
    ${tagsArray},
    ${sop.order_index},
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;
`;

    // Steps
    if (sop.steps.length > 0) {
      sql += `\n  -- Steps for ${sop.code}\n`;
      sql += `  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;\n`;

      for (let s = 0; s < sop.steps.length; s++) {
        const step = sop.steps[s];
        sql += `  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, ${escapeSQL(step.title)}, ${escapeSQL(step.content)}, ${escapeSQL(step.content_html)}, ${s}, ${escapeSQL(step.step_type)});\n`;
      }
    }
  }

  sql += `
  RAISE NOTICE 'Seed completo: ${totalFiles} SOPs inseridos.';
END $$;
`;

  fs.writeFileSync(OUTPUT_FILE, sql, "utf-8");
  console.log(`💾 SQL gerado em: ${OUTPUT_FILE}`);
  console.log(`📏 Tamanho: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(0)} KB`);
}

main().catch(console.error);
