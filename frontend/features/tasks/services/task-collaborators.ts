import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// task_collaborators table is not in generated types yet — define locally
interface CollaboratorRow {
  task_id: string;
  user_id: string;
  added_at: string;
}

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
    .from("task_collaborators" as never)
    .select(PROFILE_JOIN as never)
    .eq("task_id" as never, taskId as never)
    .order("added_at" as never, { ascending: true } as never);

  if (error) throw error;

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => {
    const p = Array.isArray(row.profiles) ? (row.profiles as Record<string, unknown>[])[0] : row.profiles;
    return {
      task_id: row.task_id as string,
      user_id: row.user_id as string,
      added_at: row.added_at as string,
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
    .from("task_collaborators" as never)
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
    .from("task_collaborators" as never)
    .delete()
    .eq("task_id" as never, taskId as never)
    .eq("user_id" as never, userId as never);
  if (error) throw error;
}
