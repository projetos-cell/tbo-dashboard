/**
 * auto-categorize.ts
 * Engine de auto-categorização e auto-vinculação a centros de custo.
 *
 * Estratégia (calibrada para dados reais OMIE da TBO):
 * 1. Match direto: descrição da transação === nome da categoria (OMIE usa mesma nomenclatura)
 * 2. Match por omie_id: prefixo OMIE da categoria casa com prefixo da descrição
 * 3. Keyword fallback: regras genéricas para transações manuais
 * 4. Centro de custo: inferido a partir do prefixo da categoria matched
 *
 * Centros de custo reais: ADM, COM, MKT, PROJ, RH, TI, Sua Empresa
 */

import type { FinanceCategory, FinanceCostCenter } from "./finance-types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AutoCategorizeResult {
  category_id: string | null;
  category_name: string | null;
  cost_center_id: string | null;
  cost_center_name: string | null;
  confidence: "high" | "medium" | "low";
  matched_rule: string;
}

// ── Normalization ──────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Handle OMIE broken encoding: "ServiAos" → "servicaos" → match "servicos"
    // Remove stray uppercase-turned-lowercase chars from broken UTF-8
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Aggressive normalization that strips ALL non-alphanumeric chars.
 * Used for fuzzy matching where OMIE encoding is broken
 * (e.g. "Serviços" stored as "ServiAos", "Mão" as "MAo").
 */
function normalizeAggressive(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Strip OMIE prefix markers like (+), (-) and leading/trailing whitespace */
function stripOmiePrefix(name: string): string {
  return name.replace(/^\s*\([+-]\)\s*/, "").trim();
}

// ── Category prefix → Cost Center code mapping ───────────────────────────
// CCs = BUs da TBO: BRD, D3D, MKT, AV, INT + ADM (overhead) + CORP
// Despesas de pessoal são alocadas por BU quando possível (ex: Lucca/Rafa → MKT).
// Custos genéricos (impostos, financeiro, admin) → ADM.

const CATEGORY_PREFIX_TO_CC: Array<{ prefixes: string[]; ccCode: string }> = [
  // Administrativas, Serviços Terceiros, Outros → ADM
  { prefixes: ["administrativas", "servicos terceiros", "serviços terceiros", "outros custos"], ccCode: "ADM" },
  // Impostos → ADM
  { prefixes: ["impostos"], ccCode: "ADM" },
  // Financeira → ADM
  { prefixes: ["financeira", "atividade de financiamento"], ccCode: "ADM" },
  // Pessoal → ADM (default; overridden by counterpart-based rules below)
  { prefixes: ["pessoal"], ccCode: "ADM" },
  // Custos - Comercial → MKT (comercial é parte do marketing na TBO)
  { prefixes: ["custos - comercial", "custos comercial"], ccCode: "MKT" },
  // Custos de produção (freelancers, fornecedores) → inferido por BU keywords abaixo
  { prefixes: ["custos - mao de obra", "custos mao de obra", "custos - fornecedor", "custos fornecedor"], ccCode: "ADM" },
  // Custos genéricos → ADM
  { prefixes: ["custos"], ccCode: "ADM" },
  // Marketing
  { prefixes: ["marketing", "midia"], ccCode: "MKT" },
  // Tecnologia / Software → ADM (overhead)
  { prefixes: ["tecnologia", "software", "hosting"], ccCode: "ADM" },
  // Receitas → inferido por BU keywords abaixo
  { prefixes: ["receitas"], ccCode: "ADM" },
];

// ── Counterpart → CC (despesas de pessoal por BU) ───────────────────────
// Colaboradores conhecidos da TBO e suas BUs

const COUNTERPART_CC_MAP: Array<{ patterns: string[]; ccCode: string }> = [
  // Marketing / Comercial
  { patterns: ["lucca", "lucca nonato"], ccCode: "MKT" },
  { patterns: ["rafaela oltramari"], ccCode: "MKT" },
  { patterns: ["gustavo henrique bientinez", "gustavo bientinez"], ccCode: "MKT" },
  { patterns: ["m&n performance", "m&n"], ccCode: "MKT" },
  // Branding
  { patterns: ["celso fernando"], ccCode: "BRD" },
  { patterns: ["nelson mozart"], ccCode: "BRD" },
  // Digital 3D
  { patterns: ["arqfreelas", "nathalia"], ccCode: "D3D" },
  { patterns: ["eduarda monique"], ccCode: "D3D" },
  { patterns: ["mariane borges"], ccCode: "D3D" },
  { patterns: ["lucio tiago", "maurilo torres"], ccCode: "D3D" },
  // Corporativo (sócios)
  { patterns: ["marco andolfato"], ccCode: "CORP" },
  { patterns: ["ruy luiz"], ccCode: "CORP" },
];

function inferCCFromCategoryName(
  categoryName: string,
  costCenters: FinanceCostCenter[]
): FinanceCostCenter | null {
  const stripped = normalize(stripOmiePrefix(categoryName));
  const strippedAgg = normalizeAggressive(stripOmiePrefix(categoryName));

  for (const { prefixes, ccCode } of CATEGORY_PREFIX_TO_CC) {
    const matches = prefixes.some(
      (p) => stripped.startsWith(normalize(p)) || strippedAgg.startsWith(normalizeAggressive(p))
    );
    if (matches) {
      return costCenters.find((cc) => cc.code === ccCode) ?? null;
    }
  }

  return null;
}

/**
 * Infer cost center directly from transaction description prefix.
 * Handles cases where no category match was found but the description
 * still contains recognizable OMIE prefixes like "(-) Pessoal", "(-) Administrativas".
 */
function inferCCFromDescription(
  description: string,
  costCenters: FinanceCostCenter[]
): FinanceCostCenter | null {
  const stripped = normalize(stripOmiePrefix(description));
  const strippedAgg = normalizeAggressive(stripOmiePrefix(description));

  for (const { prefixes, ccCode } of CATEGORY_PREFIX_TO_CC) {
    const matches = prefixes.some(
      (p) => stripped.startsWith(normalize(p)) || strippedAgg.startsWith(normalizeAggressive(p))
    );
    if (matches) {
      return costCenters.find((cc) => cc.code === ccCode) ?? null;
    }
  }

  return null;
}

// ── Direct matching: description ↔ category name ──────────────────────────

function matchCategoryByName(
  description: string,
  categories: FinanceCategory[]
): FinanceCategory | null {
  const normalizedDesc = normalize(description);

  // 1. Exact match (description === category name)
  const exact = categories.find((c) => normalize(c.name) === normalizedDesc);
  if (exact) return exact;

  // 2. Description starts with category name (after stripping prefix)
  // e.g., description "(-) Pessoal - Salários" matches category "(-) Pessoal - Salários"
  const startsWith = categories.find((c) => {
    const catNorm = normalize(c.name);
    return catNorm.length > 5 && normalizedDesc.startsWith(catNorm);
  });
  if (startsWith) return startsWith;

  // 3. Category name starts with description
  const catStartsWith = categories.find((c) => {
    const catNorm = normalize(c.name);
    return normalizedDesc.length > 5 && catNorm.startsWith(normalizedDesc);
  });
  if (catStartsWith) return catStartsWith;

  // 4. Substantial overlap: stripped category name contained in description
  // Sort by name length descending to prefer more specific matches
  const sorted = [...categories].sort((a, b) => b.name.length - a.name.length);
  for (const cat of sorted) {
    const catStripped = normalize(stripOmiePrefix(cat.name));
    if (catStripped.length < 5) continue; // skip too-short names
    if (normalizedDesc.includes(catStripped)) return cat;
  }

  // 5. Description stripped text contained in category name
  const descStripped = normalize(stripOmiePrefix(description));
  if (descStripped.length >= 5) {
    for (const cat of sorted) {
      const catNorm = normalize(cat.name);
      if (catNorm.includes(descStripped)) return cat;
    }
  }

  // 6. Aggressive fuzzy match (handles OMIE broken encoding like "ServiAos" vs "Serviços")
  const aggressiveDesc = normalizeAggressive(description);
  if (aggressiveDesc.length >= 6) {
    // Try aggressive match: strip everything non-alphanumeric
    for (const cat of sorted) {
      const aggressiveCat = normalizeAggressive(cat.name);
      if (aggressiveCat.length < 6) continue;
      if (aggressiveDesc === aggressiveCat) return cat;
    }
    // Partial aggressive match (description contains category or vice versa)
    for (const cat of sorted) {
      const aggressiveCat = normalizeAggressive(stripOmiePrefix(cat.name));
      if (aggressiveCat.length < 5) continue;
      if (aggressiveDesc.includes(aggressiveCat) || aggressiveCat.includes(aggressiveDesc)) {
        return cat;
      }
    }
  }

  return null;
}

// ── OMIE code matching ─────────────────────────────────────────────────────
// Categories have omie_id like "2.01.01", "1.01.36", etc.
// Transaction descriptions often contain the category's OMIE subcategory name.

function matchCategoryByOmieHierarchy(
  description: string,
  type: "receita" | "despesa" | "transferencia",
  categories: FinanceCategory[]
): FinanceCategory | null {
  // Filter by type
  const filtered = categories.filter(
    (c) => c.type === type || type === "transferencia"
  );

  const normalizedDesc = normalize(description);

  // Try to find the most specific category whose stripped name appears in the description
  const candidates = filtered
    .filter((c) => {
      const stripped = normalize(stripOmiePrefix(c.name));
      return stripped.length >= 4 && normalizedDesc.includes(stripped);
    })
    .sort((a, b) => {
      // Prefer longer (more specific) matches
      const aLen = stripOmiePrefix(a.name).length;
      const bLen = stripOmiePrefix(b.name).length;
      return bLen - aLen;
    });

  return candidates[0] ?? null;
}

// ── Keyword fallback rules ─────────────────────────────────────────────────
// For manual transactions that don't follow OMIE naming

interface FallbackRule {
  keywords: string[];
  categorySearch: string;
  ccCode: string | null;
}

const FALLBACK_RULES: FallbackRule[] = [
  // Pessoal
  { keywords: ["salario", "salarios", "folha", "holerite", "pro labore"], categorySearch: "pessoal", ccCode: "ADM" },
  { keywords: ["inss", "fgts", "encargo"], categorySearch: "pessoal", ccCode: "ADM" },
  { keywords: ["vale transporte", "vale refeicao", "vale alimentacao", "beneficio", "plano saude", "unimed"], categorySearch: "pessoal", ccCode: "ADM" },
  // Freelancer / Produção
  { keywords: ["freelancer", "freela", "terceirizado"], categorySearch: "custos - mao de obra", ccCode: "ADM" },
  // Administrativo
  { keywords: ["contabilidade", "contador", "bpo"], categorySearch: "servicos terceiros - contabilidade", ccCode: "ADM" },
  { keywords: ["aluguel", "condominio", "iptu"], categorySearch: "administrativas", ccCode: "ADM" },
  // Financeiro
  { keywords: ["tarifa bancaria", "tarifas bancarias"], categorySearch: "financeira - tarifas", ccCode: "ADM" },
  { keywords: ["juros", "multa bancaria"], categorySearch: "financeira - juros", ccCode: "ADM" },
  { keywords: ["emprestimo", "financiamento", "consorcio"], categorySearch: "financiamento", ccCode: "ADM" },
  // Impostos
  { keywords: ["simples nacional", "das", "iss", "pis", "cofins"], categorySearch: "impostos", ccCode: "ADM" },
  // Comercial → MKT (na TBO, comercial é parte do marketing)
  { keywords: ["comissao", "comercial"], categorySearch: "custos - comercial", ccCode: "MKT" },
  // Software → ADM (overhead)
  { keywords: ["adobe", "figma", "canva", "notion", "slack", "google workspace", "software", "licenca"], categorySearch: "tecnologia", ccCode: "ADM" },
];

function matchByKeywordFallback(
  description: string,
  counterpart: string | null,
  type: "receita" | "despesa" | "transferencia",
  categories: FinanceCategory[],
  costCenters: FinanceCostCenter[]
): { category: FinanceCategory | null; cc: FinanceCostCenter | null; rule: string } | null {
  const text = normalize(`${description} ${counterpart ?? ""}`);

  for (const rule of FALLBACK_RULES) {
    const matchedKw = rule.keywords.find((kw) => text.includes(kw));
    if (!matchedKw) continue;

    const searchNorm = normalize(rule.categorySearch);
    const filtered = categories.filter((c) => c.type === type || type === "transferencia");

    // Find category by search pattern in stripped name
    const cat = filtered.find((c) => {
      const stripped = normalize(stripOmiePrefix(c.name));
      return stripped.includes(searchNorm) || searchNorm.includes(stripped);
    });

    const cc = rule.ccCode
      ? costCenters.find((c) => c.code === rule.ccCode) ?? null
      : null;

    if (cat || cc) {
      return { category: cat ?? null, cc, rule: `keyword: "${matchedKw}"` };
    }
  }

  return null;
}

// ── BU → Cost Center ─────────────────────────────────────────────────────

const BU_TO_CC: Record<string, string> = {
  branding: "BRD",
  "digital 3d": "D3D",
  marketing: "MKT",
  audiovisual: "AV",
  interiores: "INT",
};

function inferCCFromBusinessUnit(
  businessUnit: string | null,
  costCenters: FinanceCostCenter[]
): FinanceCostCenter | null {
  if (!businessUnit) return null;
  const ccCode = BU_TO_CC[normalize(businessUnit)];
  if (!ccCode) return null;
  return costCenters.find((cc) => cc.code === ccCode) ?? null;
}

// ── Main engine ────────────────────────────────────────────────────────────

export function autoCategorize(
  description: string,
  type: "receita" | "despesa" | "transferencia",
  counterpart: string | null,
  businessUnit: string | null,
  categories: FinanceCategory[],
  costCenters: FinanceCostCenter[]
): AutoCategorizeResult | null {
  if (!description.trim()) return null;

  let matchedCategory: FinanceCategory | null = null;
  let matchedCC: FinanceCostCenter | null = null;
  let confidence: "high" | "medium" | "low" = "low";
  let matchedRule = "";

  // ── Step 1: Direct name match (highest confidence) ──────────────────
  // OMIE categories and transaction descriptions share the same naming.
  matchedCategory = matchCategoryByName(description, categories);
  if (matchedCategory) {
    confidence = "high";
    matchedRule = "nome direto";

    // Infer CC from the matched category's prefix
    matchedCC = inferCCFromCategoryName(matchedCategory.name, costCenters);
  }

  // ── Step 2: OMIE hierarchy match ────────────────────────────────────
  if (!matchedCategory) {
    matchedCategory = matchCategoryByOmieHierarchy(description, type, categories);
    if (matchedCategory) {
      confidence = "medium";
      matchedRule = "hierarquia OMIE";
      matchedCC = inferCCFromCategoryName(matchedCategory.name, costCenters);
    }
  }

  // ── Step 3: Keyword fallback ────────────────────────────────────────
  if (!matchedCategory) {
    const fallback = matchByKeywordFallback(
      description, counterpart, type, categories, costCenters
    );
    if (fallback) {
      matchedCategory = fallback.category;
      matchedCC = fallback.cc;
      confidence = "medium";
      matchedRule = fallback.rule;
    }
  }

  // ── Step 4: CC from counterpart (collaborators → their BU)
  // Counterpart overrides category-prefix default for personnel/labor costs
  if (counterpart) {
    const cpNorm = normalize(counterpart);
    for (const { patterns, ccCode } of COUNTERPART_CC_MAP) {
      if (patterns.some((p) => cpNorm.includes(p))) {
        const ccFromCounterpart = costCenters.find((cc) => cc.code === ccCode) ?? null;
        if (ccFromCounterpart) {
          matchedCC = ccFromCounterpart;
          break;
        }
      }
    }
  }

  // ── Step 5: Cost center from BU field (if still missing)
  if (!matchedCC) {
    matchedCC = inferCCFromBusinessUnit(businessUnit, costCenters);
  }

  // ── Step 6: CC from BU keywords in description (receitas de serviço → BU)
  if (!matchedCC) {
    const descNorm = normalize(description);
    const BU_KEYWORDS_CC: Array<{ keywords: string[]; ccCode: string }> = [
      { keywords: ["branding", "marca", "identidade visual", "logo", "naming"], ccCode: "BRD" },
      { keywords: ["3d", "render", "maquete", "modelagem", "vray", "lumion", "archviz", "planta humanizada"], ccCode: "D3D" },
      { keywords: ["marketing", "social", "redes sociais", "conteudo", "seo", "performance", "trafego", "midia"], ccCode: "MKT" },
      { keywords: ["audiovisual", "video", "filmagem", "edicao", "motion", "animacao", "som", "audio", "drone", "camera"], ccCode: "AV" },
      { keywords: ["interiores", "interior", "arquitetura", "decoracao", "mobiliario", "fachada"], ccCode: "INT" },
    ];
    for (const { keywords, ccCode } of BU_KEYWORDS_CC) {
      if (keywords.some((kw) => descNorm.includes(kw))) {
        matchedCC = costCenters.find((cc) => cc.code === ccCode) ?? null;
        if (matchedCC) break;
      }
    }
  }

  // ── Step 7: Fallback CC from description prefix
  if (!matchedCC) {
    matchedCC = inferCCFromDescription(description, costCenters);
  }

  if (!matchedCategory && !matchedCC) return null;

  return {
    category_id: matchedCategory?.id ?? null,
    category_name: matchedCategory?.name ?? null,
    cost_center_id: matchedCC?.id ?? null,
    cost_center_name: matchedCC ? `${matchedCC.code} - ${matchedCC.name}` : null,
    confidence,
    matched_rule: matchedRule,
  };
}

// ── Batch ──────────────────────────────────────────────────────────────────

export function batchAutoCategorize(
  transactions: Array<{
    id: string;
    description: string;
    type: "receita" | "despesa" | "transferencia";
    counterpart: string | null;
    business_unit: string | null;
    category_id: string | null;
    cost_center_id: string | null;
  }>,
  categories: FinanceCategory[],
  costCenters: FinanceCostCenter[]
): Array<{
  id: string;
  category_id: string | null;
  cost_center_id: string | null;
  confidence: "high" | "medium" | "low";
  matched_rule: string;
}> {
  const results: Array<{
    id: string;
    category_id: string | null;
    cost_center_id: string | null;
    confidence: "high" | "medium" | "low";
    matched_rule: string;
  }> = [];

  for (const tx of transactions) {
    if (tx.category_id && tx.cost_center_id) continue;

    const suggestion = autoCategorize(
      tx.description,
      tx.type,
      tx.counterpart,
      tx.business_unit,
      categories,
      costCenters
    );

    if (!suggestion) continue;

    const update = {
      id: tx.id,
      category_id: !tx.category_id ? suggestion.category_id : null,
      cost_center_id: !tx.cost_center_id ? suggestion.cost_center_id : null,
      confidence: suggestion.confidence,
      matched_rule: suggestion.matched_rule,
    };

    if (update.category_id || update.cost_center_id) {
      results.push(update);
    }
  }

  return results;
}
