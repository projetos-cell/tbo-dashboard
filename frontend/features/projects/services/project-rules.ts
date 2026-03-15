import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ProjectRuleRow = Database["public"]["Tables"]["project_rules"]["Row"];
type ProjectRuleInsert = Database["public"]["Tables"]["project_rules"]["Insert"];
type ProjectRuleUpdate = Database["public"]["Tables"]["project_rules"]["Update"];

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
  const { data, error } = await supabase
    .from("project_rules")
    .select(COLS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createProjectRule(
  supabase: SupabaseClient<Database>,
  rule: ProjectRuleInsert
): Promise<ProjectRuleRow> {
  const { data, error } = await supabase
    .from("project_rules")
    .insert(rule as never)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectRule(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: ProjectRuleUpdate
): Promise<ProjectRuleRow> {
  const { data, error } = await supabase
    .from("project_rules")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectRule(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("project_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
