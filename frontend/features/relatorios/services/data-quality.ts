import type { SupabaseClient } from "@supabase/supabase-js";

// Tables not yet in generated Database types — use untyped client
type UntypedClient = SupabaseClient;

// ── Types ─────────────────────────────────────────────────────────────────────

export type QualityModule =
  | "projects"
  | "people"
  | "finance"
  | "commercial"
  | "okrs";

export interface CriticalFieldConfig {
  module: QualityModule;
  table: string;
  fields: { key: string; label: string }[];
}

export interface ModuleQualityResult {
  module: QualityModule;
  label: string;
  total_records: number;
  filled_fields: number;
  total_fields: number;
  completeness_pct: number;
  missing_critical: Array<{ field: string; label: string; missing_count: number }>;
}

export interface DataQualityScore {
  id: string;
  tenant_id: string;
  module: string;
  total_records: number;
  filled_fields: number;
  total_fields: number;
  completeness_pct: number;
  missing_critical: unknown[];
  computed_at: string;
}

export interface UpsertDataQualityInput {
  tenant_id: string;
  module: QualityModule;
  total_records: number;
  filled_fields: number;
  total_fields: number;
  missing_critical: Array<{ field: string; label: string; missing_count: number }>;
}

// ── Config ────────────────────────────────────────────────────────────────────

export function getCriticalFieldsConfig(): CriticalFieldConfig[] {
  return [
    {
      module: "projects",
      table: "os_tasks",
      fields: [
        { key: "title", label: "Nome" },
        { key: "status", label: "Status" },
        { key: "assignee_id", label: "Responsável" },
        { key: "due_date", label: "Data de Entrega" },
      ],
    },
    {
      module: "people",
      table: "profiles",
      fields: [
        { key: "full_name", label: "Nome Completo" },
        { key: "email", label: "E-mail" },
        { key: "role", label: "Função" },
        { key: "department", label: "Departamento" },
        { key: "manager_id", label: "Gestor" },
      ],
    },
    {
      module: "finance",
      table: "finance_transactions",
      fields: [
        { key: "description", label: "Descrição" },
        { key: "amount", label: "Valor" },
        { key: "date", label: "Data" },
        { key: "type", label: "Tipo" },
      ],
    },
    {
      module: "commercial",
      table: "crm_deals",
      fields: [
        { key: "name", label: "Nome" },
        { key: "company", label: "Empresa" },
        { key: "stage", label: "Etapa" },
        { key: "value", label: "Valor" },
        { key: "owner_id", label: "Responsável" },
      ],
    },
    {
      module: "okrs",
      table: "okr_objectives",
      fields: [
        { key: "title", label: "Título" },
        { key: "status", label: "Status" },
        { key: "owner_id", label: "Responsável" },
      ],
    },
  ];
}

const MODULE_LABELS: Record<QualityModule, string> = {
  projects: "Projetos",
  people: "Pessoas",
  finance: "Financeiro",
  commercial: "Comercial",
  okrs: "OKRs",
};

// ── Per-module quality ────────────────────────────────────────────────────────

export async function computeModuleQuality(
  supabase: UntypedClient,
  module: QualityModule
): Promise<ModuleQualityResult> {
  const config = getCriticalFieldsConfig().find((c) => c.module === module);
  if (!config) {
    return {
      module,
      label: MODULE_LABELS[module],
      total_records: 0,
      filled_fields: 0,
      total_fields: 0,
      completeness_pct: 0,
      missing_critical: [],
    };
  }

  // Fetch all records with critical fields
  const selectFields = config.fields.map((f) => f.key).join(", ");
  const { data, error } = await supabase
    .from(config.table as "os_tasks")
    .select(selectFields);

  if (error) throw error;

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const total_records = rows.length;
  const numFields = config.fields.length;
  const total_fields = total_records * numFields;

  let filled_fields = 0;
  const missingPerField: Record<string, number> = {};

  for (const row of rows) {
    for (const field of config.fields) {
      const val = row[field.key];
      const isFilled =
        val !== null &&
        val !== undefined &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0);

      if (isFilled) {
        filled_fields++;
      } else {
        missingPerField[field.key] = (missingPerField[field.key] ?? 0) + 1;
      }
    }
  }

  const completeness_pct =
    total_fields > 0 ? (filled_fields / total_fields) * 100 : 100;

  const missing_critical = config.fields
    .filter((f) => missingPerField[f.key] > 0)
    .map((f) => ({
      field: f.key,
      label: f.label,
      missing_count: missingPerField[f.key] ?? 0,
    }))
    .sort((a, b) => b.missing_count - a.missing_count);

  return {
    module,
    label: MODULE_LABELS[module],
    total_records,
    filled_fields,
    total_fields,
    completeness_pct: Math.round(completeness_pct * 100) / 100,
    missing_critical,
  };
}

// ── Full quality scan ─────────────────────────────────────────────────────────

export async function computeDataQuality(
  supabase: UntypedClient,
  tenantId: string
): Promise<ModuleQualityResult[]> {
  const modules: QualityModule[] = [
    "projects",
    "people",
    "finance",
    "commercial",
    "okrs",
  ];

  const results = await Promise.all(
    modules.map((m) => computeModuleQuality(supabase, m))
  );

  // Persist scores
  await Promise.allSettled(
    results.map((r) =>
      upsertDataQualityScore(supabase, {
        tenant_id: tenantId,
        module: r.module,
        total_records: r.total_records,
        filled_fields: r.filled_fields,
        total_fields: r.total_fields,
        missing_critical: r.missing_critical,
      })
    )
  );

  return results;
}

// ── DB read/write ─────────────────────────────────────────────────────────────

export async function getDataQualityScores(
  supabase: UntypedClient
): Promise<DataQualityScore[]> {
  const { data, error } = await supabase
    .from("data_quality_scores")
    .select("*")
    .order("computed_at", { ascending: false });

  if (error) throw error;

  // Return latest per module
  const seen = new Set<string>();
  const latest: DataQualityScore[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.module)) {
      seen.add(row.module);
      latest.push(row as DataQualityScore);
    }
  }
  return latest;
}

export async function upsertDataQualityScore(
  supabase: UntypedClient,
  score: UpsertDataQualityInput
): Promise<DataQualityScore> {
  const { data, error } = await supabase
    .from("data_quality_scores")
    .insert({
      tenant_id: score.tenant_id,
      module: score.module,
      total_records: score.total_records,
      filled_fields: score.filled_fields,
      total_fields: score.total_fields,
      missing_critical: score.missing_critical,
      computed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DataQualityScore;
}
