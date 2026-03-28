import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ChecklistItem {
  id: string;
  tenant_id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
  created_at: string;
}

export async function getChecklistItems(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from("task_checklist_items" as never)
    .select("*")
    .eq("task_id", taskId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChecklistItem[];
}

export async function addChecklistItem(
  supabase: SupabaseClient<Database>,
  params: { tenant_id: string; task_id: string; title: string; sort_order: number },
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from("task_checklist_items" as never)
    .insert({
      tenant_id: params.tenant_id,
      task_id: params.task_id,
      title: params.title,
      sort_order: params.sort_order,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function updateChecklistItem(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<Pick<ChecklistItem, "title" | "sort_order">>,
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from("task_checklist_items" as never)
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function toggleChecklistItem(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string,
): Promise<ChecklistItem> {
  // Get current state first
  const { data: current, error: getError } = await supabase
    .from("task_checklist_items" as never)
    .select("is_completed")
    .eq("id", id)
    .single();

  if (getError) throw getError;
  const currentItem = current as { is_completed: boolean };
  const nowCompleted = !currentItem.is_completed;

  const { data, error } = await supabase
    .from("task_checklist_items" as never)
    .update({
      is_completed: nowCompleted,
      completed_at: nowCompleted ? new Date().toISOString() : null,
      completed_by: nowCompleted ? userId : null,
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function deleteChecklistItem(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("task_checklist_items" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderChecklistItems(
  supabase: SupabaseClient<Database>,
  items: { id: string; sort_order: number }[],
): Promise<void> {
  for (const item of items) {
    const { error } = await supabase
      .from("task_checklist_items" as never)
      .update({ sort_order: item.sort_order } as never)
      .eq("id", item.id);

    if (error) throw error;
  }
}
