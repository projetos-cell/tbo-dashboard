import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CollaboratorRow =
  Database["public"]["Tables"]["task_collaborators"]["Row"];

export interface CollaboratorWithProfile extends CollaboratorRow {
  full_name: string;
  avatar_url: string | null;
  role: string;
}

const PROFILE_JOIN =
  "task_id, user_id, added_at, profiles:user_id ( full_name, avatar_url, role )";

export async function getCollaborators(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<CollaboratorWithProfile[]> {
  const { data, error } = await supabase
    .from("task_collaborators")
    .select(PROFILE_JOIN)
    .eq("task_id", taskId)
    .order("added_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      task_id: row.task_id,
      user_id: row.user_id,
      added_at: row.added_at,
      full_name: (p as { full_name?: string } | null)?.full_name ?? "?",
      avatar_url: (p as { avatar_url?: string | null } | null)?.avatar_url ?? null,
      role: (p as { role?: string } | null)?.role ?? "colaborador",
    };
  });
}

export async function addCollaborator(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("task_collaborators")
    .upsert({ task_id: taskId, user_id: userId } as never, {
      onConflict: "task_id,user_id",
      ignoreDuplicates: true,
    });
  if (error) throw error;
}

export async function removeCollaborator(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("task_collaborators")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId);
  if (error) throw error;
}
