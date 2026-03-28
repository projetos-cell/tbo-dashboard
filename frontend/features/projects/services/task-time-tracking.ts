import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface TimeEntry {
  id: string;
  tenant_id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  description: string | null;
  is_running: boolean;
  created_at: string;
}

export interface TimeStats {
  totalMinutes: number;
  totalHours: number;
  byTask: Record<string, { minutes: number; taskTitle: string }>;
  byUser: Record<string, { minutes: number; userName: string }>;
}

export async function getTimeEntries(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("task_time_entries" as never)
    .select("*")
    .eq("task_id", taskId)
    .order("started_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntry[];
}

export async function getProjectTimeEntries(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<TimeEntry[]> {
  // Get all task IDs for project
  const { data: tasks, error: tasksError } = await supabase
    .from("os_tasks")
    .select("id")
    .eq("project_id", projectId);

  if (tasksError) throw tasksError;
  if (!tasks || tasks.length === 0) return [];

  const taskIds = tasks.map((t) => t.id);

  const { data, error } = await supabase
    .from("task_time_entries" as never)
    .select("*")
    .in("task_id", taskIds)
    .order("started_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntry[];
}

export async function startTimer(
  supabase: SupabaseClient<Database>,
  params: { tenant_id: string; task_id: string; user_id: string },
): Promise<TimeEntry> {
  // Stop any running timer for this user first
  const running = await getRunningTimer(supabase, params.user_id);
  if (running) {
    await stopTimer(supabase, running.id);
  }

  const { data, error } = await supabase
    .from("task_time_entries" as never)
    .insert({
      tenant_id: params.tenant_id,
      task_id: params.task_id,
      user_id: params.user_id,
      started_at: new Date().toISOString(),
      is_running: true,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as TimeEntry;
}

export async function stopTimer(
  supabase: SupabaseClient<Database>,
  entryId: string,
): Promise<TimeEntry> {
  const endedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("task_time_entries" as never)
    .update({
      ended_at: endedAt,
      is_running: false,
    } as never)
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;
  const entry = data as TimeEntry;

  // Update logged_hours on os_tasks
  const { data: allEntries } = await supabase
    .from("task_time_entries" as never)
    .select("duration_minutes")
    .eq("task_id", entry.task_id)
    .not("duration_minutes", "is", null);

  const totalMinutes = (allEntries ?? []).reduce(
    (sum: number, e: { duration_minutes: number | null }) => sum + (e.duration_minutes ?? 0),
    0,
  );

  await supabase
    .from("os_tasks")
    .update({ logged_hours: totalMinutes / 60 } as never)
    .eq("id", entry.task_id);

  return entry;
}

export async function getRunningTimer(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from("task_time_entries" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("is_running", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as TimeEntry) ?? null;
}

export async function getTimeStats(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<TimeStats> {
  const [entriesRes, tasksRes, profilesRes] = await Promise.all([
    getProjectTimeEntries(supabase, projectId),
    supabase.from("os_tasks").select("id,title").eq("project_id", projectId),
    supabase.from("profiles").select("id,full_name"),
  ]);

  const entries = entriesRes;
  const taskMap = new Map((tasksRes.data ?? []).map((t) => [t.id, t.title]));
  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name ?? p.id]));

  let totalMinutes = 0;
  const byTask: TimeStats["byTask"] = {};
  const byUser: TimeStats["byUser"] = {};

  for (const entry of entries) {
    const mins = entry.duration_minutes ?? 0;
    totalMinutes += mins;

    if (!byTask[entry.task_id]) {
      byTask[entry.task_id] = { minutes: 0, taskTitle: taskMap.get(entry.task_id) ?? entry.task_id };
    }
    byTask[entry.task_id].minutes += mins;

    if (!byUser[entry.user_id]) {
      byUser[entry.user_id] = { minutes: 0, userName: profileMap.get(entry.user_id) ?? entry.user_id };
    }
    byUser[entry.user_id].minutes += mins;
  }

  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    byTask,
    byUser,
  };
}
