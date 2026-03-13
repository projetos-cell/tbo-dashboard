import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export interface TaskProject {
  task_id: string;
  project_id: string;
  added_at: string;
  project: ProjectRow;
}

const supabase = () => createClient();

export async function fetchTaskProjects(taskId: string): Promise<TaskProject[]> {
  const { data, error } = await supabase()
    .from("task_projects" as never)
    .select("task_id, project_id, added_at, project:projects(*)")
    .eq("task_id", taskId);

  if (error) throw error;
  return (data ?? []) as unknown as TaskProject[];
}

export async function addTaskToProject(
  taskId: string,
  projectId: string
): Promise<void> {
  const { error } = await supabase()
    .from("task_projects" as never)
    .insert({ task_id: taskId, project_id: projectId } as never);

  if (error) throw error;
}

export async function removeTaskFromProject(
  taskId: string,
  projectId: string
): Promise<void> {
  const { error } = await supabase()
    .from("task_projects" as never)
    .delete()
    .eq("task_id", taskId)
    .eq("project_id", projectId);

  if (error) throw error;
}
