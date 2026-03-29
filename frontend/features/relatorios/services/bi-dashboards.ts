import type { SupabaseClient } from "@supabase/supabase-js";

// bi_dashboards/bi_widgets are not yet in generated Database types — use untyped
// client to avoid "Type instantiation is excessively deep" errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

// ── Types ─────────────────────────────────────────────────────────────────────

export type WidgetType =
  | "kpi_card"
  | "bar_chart"
  | "line_chart"
  | "pie_chart"
  | "donut_chart"
  | "area_chart"
  | "table"
  | "metric"
  | "gauge"
  | "heatmap"
  | "funnel"
  | "number";

export type DataSource =
  | "projects"
  | "finance"
  | "commercial"
  | "people"
  | "okrs";

export interface BIDashboard {
  id: string;
  tenant_id: string;
  created_by: string;
  name: string;
  description: string | null;
  layout: unknown[];
  filters: Record<string, unknown>;
  is_shared: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BIWidget {
  id: string;
  tenant_id: string;
  dashboard_id: string;
  widget_type: WidgetType;
  title: string;
  data_source: string;
  query_config: Record<string, unknown>;
  display_config: Record<string, unknown>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBIDashboardInput {
  tenant_id: string;
  created_by: string;
  name: string;
  description?: string;
  layout?: unknown[];
  is_shared?: boolean;
  is_default?: boolean;
}

export interface CreateBIWidgetInput {
  tenant_id: string;
  dashboard_id: string;
  widget_type: WidgetType;
  title: string;
  data_source: string;
  query_config?: Record<string, unknown>;
  display_config?: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  sort_order?: number;
}

export interface WidgetDataPoint {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface WidgetData {
  points: WidgetDataPoint[];
  total?: number;
  label?: string;
  meta?: Record<string, unknown>;
}

// ── Dashboard CRUD ─────────────────────────────────────────────────────────────

export async function getBIDashboards(
  supabase: UntypedClient
): Promise<BIDashboard[]> {
  const { data, error } = await supabase
    .from("bi_dashboards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BIDashboard[];
}

export async function getBIDashboard(
  supabase: UntypedClient,
  id: string
): Promise<BIDashboard> {
  const { data, error } = await supabase
    .from("bi_dashboards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as BIDashboard;
}

export async function createBIDashboard(
  supabase: UntypedClient,
  input: CreateBIDashboardInput
): Promise<BIDashboard> {
  const { data, error } = await supabase
    .from("bi_dashboards")
    .insert({
      tenant_id: input.tenant_id,
      created_by: input.created_by,
      name: input.name,
      description: input.description ?? null,
      layout: input.layout ?? [],
      is_shared: input.is_shared ?? false,
      is_default: input.is_default ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as BIDashboard;
}

export async function updateBIDashboard(
  supabase: UntypedClient,
  id: string,
  updates: Partial<Pick<BIDashboard, "name" | "description" | "layout" | "filters" | "is_shared" | "is_default">>
): Promise<BIDashboard> {
  const { data, error } = await supabase
    .from("bi_dashboards")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as BIDashboard;
}

export async function deleteBIDashboard(
  supabase: UntypedClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("bi_dashboards")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── Widget CRUD ───────────────────────────────────────────────────────────────

export async function getBIWidgets(
  supabase: UntypedClient,
  dashboardId: string
): Promise<BIWidget[]> {
  const { data, error } = await supabase
    .from("bi_widgets")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BIWidget[];
}

export async function createBIWidget(
  supabase: UntypedClient,
  widget: CreateBIWidgetInput
): Promise<BIWidget> {
  const { data, error } = await supabase
    .from("bi_widgets")
    .insert({
      tenant_id: widget.tenant_id,
      dashboard_id: widget.dashboard_id,
      widget_type: widget.widget_type,
      title: widget.title,
      data_source: widget.data_source,
      query_config: widget.query_config ?? {},
      display_config: widget.display_config ?? {},
      position_x: widget.position_x ?? 0,
      position_y: widget.position_y ?? 0,
      width: widget.width ?? 4,
      height: widget.height ?? 3,
      sort_order: widget.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as BIWidget;
}

export async function updateBIWidget(
  supabase: UntypedClient,
  id: string,
  updates: Partial<Omit<BIWidget, "id" | "tenant_id" | "dashboard_id" | "created_at" | "updated_at">>
): Promise<BIWidget> {
  const { data, error } = await supabase
    .from("bi_widgets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as BIWidget;
}

export async function deleteBIWidget(
  supabase: UntypedClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("bi_widgets")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── Widget Data Execution ─────────────────────────────────────────────────────

/**
 * Executes a widget's data query based on its data_source and query_config.
 * Returns a normalized WidgetData object for rendering.
 */
export async function getWidgetData(
  supabase: UntypedClient,
  widget: Pick<BIWidget, "data_source" | "query_config" | "widget_type">
): Promise<WidgetData> {
  const { data_source, query_config } = widget;

  switch (data_source) {
    case "projects":
      return getProjectsWidgetData(supabase, query_config);
    case "finance":
      return getFinanceWidgetData(supabase, query_config);
    case "commercial":
      return getCommercialWidgetData(supabase, query_config);
    case "people":
      return getPeopleWidgetData(supabase, query_config);
    case "okrs":
      return getOKRsWidgetData(supabase, query_config);
    default:
      return { points: [], total: 0 };
  }
}

async function getProjectsWidgetData(
  supabase: UntypedClient,
  config: Record<string, unknown>
): Promise<WidgetData> {
  const metric = (config.metric as string) ?? "tasks_by_status";

  if (metric === "tasks_by_status") {
    const { data, error } = await supabase
      .from("os_tasks")
      .select("status")
      .not("status", "is", null);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const s = String(row.status ?? "sem_status");
      counts[s] = (counts[s] ?? 0) + 1;
    }

    return {
      points: Object.entries(counts).map(([label, value]) => ({ label, value })),
      total: (data ?? []).length,
      label: "Tarefas por Status",
    };
  }

  if (metric === "projects_by_status") {
    const { data, error } = await supabase
      .from("os_sections")
      .select("name")
      .not("name", "is", null);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const s = String(row.name ?? "Sem Nome");
      counts[s] = (counts[s] ?? 0) + 1;
    }

    return {
      points: Object.entries(counts).map(([label, value]) => ({ label, value })),
      total: (data ?? []).length,
      label: "Seções de Projetos",
    };
  }

  return { points: [], total: 0 };
}

async function getFinanceWidgetData(
  supabase: UntypedClient,
  config: Record<string, unknown>
): Promise<WidgetData> {
  const metric = (config.metric as string) ?? "revenue_by_month";
  const year = (config.year as number) ?? new Date().getFullYear();

  const { data, error } = await supabase
    .from("finance_transactions")
    .select("amount, type, date")
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`);

  if (error) throw error;

  const rows = data ?? [];
  const monthlyMap: Record<number, { income: number; expense: number }> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyMap[m] = { income: 0, expense: 0 };
  }

  for (const row of rows) {
    const month = new Date(String(row.date)).getMonth() + 1;
    if (!monthlyMap[month]) continue;
    if (row.type === "income") {
      monthlyMap[month].income += Number(row.amount ?? 0);
    } else {
      monthlyMap[month].expense += Number(row.amount ?? 0);
    }
  }

  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  if (metric === "revenue_by_month") {
    return {
      points: Object.entries(monthlyMap).map(([m, v]) => ({
        label: MONTHS[Number(m) - 1],
        value: v.income,
        expense: v.expense,
        month: Number(m),
      })),
      total: rows.reduce((s, r) => r.type === "income" ? s + Number(r.amount ?? 0) : s, 0),
      label: "Receita Mensal",
    };
  }

  if (metric === "balance_by_month") {
    return {
      points: Object.entries(monthlyMap).map(([m, v]) => ({
        label: MONTHS[Number(m) - 1],
        value: v.income - v.expense,
        month: Number(m),
      })),
      label: "Resultado Mensal",
    };
  }

  return { points: [], total: 0 };
}

async function getCommercialWidgetData(
  supabase: UntypedClient,
  config: Record<string, unknown>
): Promise<WidgetData> {
  const metric = (config.metric as string) ?? "deals_by_stage";

  if (metric === "deals_by_stage") {
    const { data, error } = await supabase
      .from("crm_deals")
      .select("stage, value");

    if (error) throw error;

    const stages: Record<string, { count: number; value: number }> = {};
    for (const row of data ?? []) {
      const s = String(row.stage ?? "Sem Etapa");
      if (!stages[s]) stages[s] = { count: 0, value: 0 };
      stages[s].count += 1;
      stages[s].value += Number(row.value ?? 0);
    }

    return {
      points: Object.entries(stages).map(([label, v]) => ({
        label,
        value: v.count,
        total_value: v.value,
      })),
      total: (data ?? []).length,
      label: "Negócios por Etapa",
    };
  }

  if (metric === "pipeline_value") {
    const { data, error } = await supabase
      .from("crm_deals")
      .select("stage, value")
      .not("stage", "in", '("won","lost")');

    if (error) throw error;

    const total = (data ?? []).reduce((s, r) => s + Number(r.value ?? 0), 0);
    return {
      points: [{ label: "Pipeline Ativo", value: total }],
      total,
      label: "Valor do Pipeline",
    };
  }

  return { points: [], total: 0 };
}

async function getPeopleWidgetData(
  supabase: UntypedClient,
  config: Record<string, unknown>
): Promise<WidgetData> {
  const metric = (config.metric as string) ?? "headcount_by_department";

  const { data, error } = await supabase
    .from("profiles")
    .select("department, role")
    .eq("is_active", true);

  if (error) throw error;

  if (metric === "headcount_by_department") {
    const depts: Record<string, number> = {};
    for (const row of data ?? []) {
      const d = String(row.department ?? "Sem Departamento");
      depts[d] = (depts[d] ?? 0) + 1;
    }

    return {
      points: Object.entries(depts).map(([label, value]) => ({ label, value })),
      total: (data ?? []).length,
      label: "Headcount por Departamento",
    };
  }

  if (metric === "headcount_total") {
    return {
      points: [{ label: "Colaboradores Ativos", value: (data ?? []).length }],
      total: (data ?? []).length,
      label: "Total de Pessoas",
    };
  }

  return { points: [], total: 0 };
}

async function getOKRsWidgetData(
  supabase: UntypedClient,
  config: Record<string, unknown>
): Promise<WidgetData> {
  const metric = (config.metric as string) ?? "progress_by_objective";

  const { data, error } = await supabase
    .from("okr_objectives")
    .select("title, status");

  if (error) throw error;

  if (metric === "progress_by_objective") {
    const statusCounts: Record<string, number> = {};
    for (const row of data ?? []) {
      const s = String(row.status ?? "no_status");
      statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    }

    return {
      points: Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
      total: (data ?? []).length,
      label: "OKRs por Status",
    };
  }

  return { points: [], total: 0 };
}
