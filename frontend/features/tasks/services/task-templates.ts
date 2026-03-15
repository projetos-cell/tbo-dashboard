import { createClient } from "@/lib/supabase/client";

export interface TaskTemplate {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  subtasks_json: { title: string; priority?: string }[];
  priority: string | null;
  estimated_hours: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

type TaskTemplateInsert = {
  tenant_id: string;
  title: string;
  description?: string | null;
  subtasks_json?: { title: string; priority?: string }[];
  priority?: string | null;
  estimated_hours?: number | null;
  created_by?: string | null;
};

export async function getTaskTemplates(tenantId: string): Promise<TaskTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TaskTemplate[];
}

export async function createTaskTemplate(template: TaskTemplateInsert): Promise<TaskTemplate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_templates")
    .insert(template as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as TaskTemplate;
}

export async function deleteTaskTemplate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("task_templates").delete().eq("id", id);
  if (error) throw error;
}
