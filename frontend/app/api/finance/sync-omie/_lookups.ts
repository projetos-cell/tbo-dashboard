import type {
  SupabaseClient,
  LookupMap,
  CostCenterInfo,
  CostCenterInfoMap,
  ClientNameInfo,
  ClientNameMap,
} from "./_shared";

// ── Lookup map builders ──────────────────────────────────────────────────────

export async function buildCategoryLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
    .from("finance_categories")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

export async function buildCostCenterLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
    .from("finance_cost_centers")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

export async function buildCostCenterInfoLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<CostCenterInfoMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ omie_id: string; name: string; business_unit_override: string | null }> | null }> } } } })
    .from("finance_cost_centers")
    .select("omie_id, name, business_unit_override")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, CostCenterInfo>();
  for (const row of (data ?? []) as Array<{ omie_id: string; name: string; business_unit_override: string | null }>) {
    map.set(String(row.omie_id), {
      name: row.name,
      override: row.business_unit_override,
    });
  }
  return map;
}

export async function buildBankAccountLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
    .from("finance_bank_accounts")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

export async function buildClientNameLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<ClientNameMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ omie_id: string; name: string; cnpj: string | null }> | null }> } } } })
    .from("finance_clients")
    .select("omie_id, name, cnpj")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, ClientNameInfo>();
  for (const row of (data ?? []) as Array<{ omie_id: string; name: string; cnpj: string | null }>) {
    map.set(String(row.omie_id), { name: row.name, cnpj: row.cnpj });
  }
  return map;
}

// ── FK resolvers ─────────────────────────────────────────────────────────────

export function resolveCategoryId(
  conta: Record<string, unknown>,
  catLookup: LookupMap
): string | null {
  const codigoCat = conta.codigo_categoria || conta.codigo_categoria_str;
  if (codigoCat) {
    const resolved = catLookup.get(String(codigoCat));
    if (resolved) return resolved;
  }
  const categorias = conta.categorias as
    | Array<{ codigo_categoria?: string }>
    | undefined;
  if (categorias?.length) {
    const firstCat = categorias[0]?.codigo_categoria;
    if (firstCat) {
      const resolved = catLookup.get(String(firstCat));
      if (resolved) return resolved;
    }
  }
  return null;
}

export function resolveCostCenterId(
  conta: Record<string, unknown>,
  ccLookup: LookupMap
): string | null {
  const departamentos = conta.departamentos as
    | Array<{ codigo_departamento?: string }>
    | undefined;
  if (departamentos?.length) {
    const firstDep = departamentos[0]?.codigo_departamento;
    if (firstDep) {
      const resolved = ccLookup.get(String(firstDep));
      if (resolved) return resolved;
    }
  }
  const codigoDep = conta.codigo_departamento;
  if (codigoDep) {
    const resolved = ccLookup.get(String(codigoDep));
    if (resolved) return resolved;
  }
  return null;
}

// ── BU derivation ────────────────────────────────────────────────────────────

export const BU_NAME_PATTERNS: Array<{ pattern: RegExp; bu: string }> = [
  { pattern: /branding/i, bu: "Branding" },
  { pattern: /digital\s*3d|3d/i, bu: "Digital 3D" },
  { pattern: /performance|trafego|tr[áa]fego/i, bu: "Performance" },
  { pattern: /social|redes|conteudo|conte[úu]do/i, bu: "Social & Conteúdo" },
  { pattern: /audiovisual|video|v[íi]deo|filme/i, bu: "Audiovisual" },
  { pattern: /design|criacao|cria[çc][ãa]o/i, bu: "Design" },
  { pattern: /administrativo|admin|financeiro|rh|dp/i, bu: "Administrativo" },
  { pattern: /comercial|vendas/i, bu: "Comercial" },
  { pattern: /tecnologia|tech|dev/i, bu: "Tecnologia" },
];

export function deriveBUFromCostCenter(
  conta: Record<string, unknown>,
  ccInfoLookup: CostCenterInfoMap
): string | null {
  const departamentos = conta.departamentos as
    | Array<{ codigo_departamento?: string }>
    | undefined;

  let omieDepId: string | null = null;
  if (departamentos?.length) {
    omieDepId = departamentos[0]?.codigo_departamento
      ? String(departamentos[0].codigo_departamento)
      : null;
  }
  if (!omieDepId && conta.codigo_departamento) {
    omieDepId = String(conta.codigo_departamento);
  }

  if (!omieDepId) return null;

  const info = ccInfoLookup.get(omieDepId);
  if (!info) return null;

  if (info.override) return info.override;

  for (const { pattern, bu } of BU_NAME_PATTERNS) {
    if (pattern.test(info.name)) return bu;
  }

  return null;
}
