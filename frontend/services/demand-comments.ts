import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DemandCommentRow =
  Database["public"]["Tables"]["demand_comments"]["Row"];

const COMMENT_COLS =
  "id,tenant_id,demand_id,author_id,content,mentions,created_at,updated_at";

export async function getDemandComments(
  supabase: SupabaseClient<Database>,
  demandId: string,
  tenantId: string
): Promise<DemandCommentRow[]> {
  const { data, error } = await supabase
    .from("demand_comments")
    .select(COMMENT_COLS)
    .eq("demand_id", demandId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createDemandComment(
  supabase: SupabaseClient<Database>,
  comment: Database["public"]["Tables"]["demand_comments"]["Insert"]
): Promise<DemandCommentRow> {
  const { data, error } = await supabase
    .from("demand_comments")
    .insert(comment as never)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDemandComment(
  supabase: SupabaseClient<Database>,
  id: string,
  content: string
): Promise<DemandCommentRow> {
  const { data, error } = await supabase
    .from("demand_comments")
    .update({ content, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDemandComment(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("demand_comments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
