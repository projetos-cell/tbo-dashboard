import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// project_rules table not in generated types — define manually
export interface ProjectRuleRow {
  id: string;
  project_id: string;
  tenant_id: string;
  name: string;
  trigger_type: string;
  trigger_config: unknown;
  conditions_json: unknown;
  actions_json: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProjectRuleInsert = Partial<ProjectRuleRow> & {
  project_id: string;
  tenant_id: string;
  name: string;
  trigger_type: string;
};
export type ProjectRuleUpdate = Partial<ProjectRuleRow>;

// Use untyped client to bypass missing table in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

export interface RuleAction {
  type: "set_status" | "set_priority" | "set_assignee" | "add_tag" | "notify";
  value: string;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export const TRIGGER_TYPES = {
  task_moved_to_section: { label: "Tarefa movida para seção", icon: "IconArrowRight" },
  task_status_changed: { label: "Status da tarefa alterado", icon: "IconRefresh" },
  task_overdue: { label: "Tarefa atrasou", icon: "IconAlertTriangle" },
  task_assigned: { label: "Tarefa atribuída", icon: "IconUser" },
  task_created: { label: "Tarefa criada", icon: "IconPlus" },
} as const;

export type TriggerType = keyof typeof TRIGGER_TYPES;

export const ACTION_TYPES = {
  set_status: { label: "Definir status" },
  set_priority: { label: "Definir prioridade" },
  set_assignee: { label: "Atribuir responsável" },
  notify: { label: "Enviar notificação" },
} as const;

const COLS =
  "id,project_id,tenant_id,name,trigger_type,trigger_config,conditions_json,actions_json,is_active,created_at,updated_at";

export async function getProjectRules(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<ProjectRuleRow[]> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("project_rules")
    .select(COLS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProjectRuleRow[];
}

export async function createProjectRule(
  supabase: SupabaseClient<Database>,
  rule: ProjectRuleInsert
): Promise<ProjectRuleRow> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("project_rules")
    .insert(rule)
    .select(COLS)
    .single();

  if (error) throw error;
  return data as ProjectRuleRow;
}

export async function updateProjectRule(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: ProjectRuleUpdate
): Promise<ProjectRuleRow> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("project_rules")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return data as ProjectRuleRow;
}

export async function deleteProjectRule(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const db = supabase as unknown as UntypedClient;
  const { error } = await db
    .from("project_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
