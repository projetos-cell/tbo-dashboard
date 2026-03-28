import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ApprovalStep {
  id: string;
  tenant_id: string;
  task_id: string;
  step_order: number;
  role_label: "revisor" | "aprovador" | "cliente";
  assignee_id: string | null;
  status: "pending" | "approved" | "rejected" | "skipped";
  decided_at: string | null;
  feedback: string | null;
  created_at: string;
  assignee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export async function getApprovalSteps(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<ApprovalStep[]> {
  const { data, error } = await supabase
    .from("task_approval_steps" as never)
    .select("*")
    .eq("task_id", taskId)
    .order("step_order", { ascending: true });

  if (error) throw error;
  const steps = (data ?? []) as ApprovalStep[];

  if (steps.length === 0) return steps;

  // Enrich with assignee profiles
  const assigneeIds = [...new Set(steps.map((s) => s.assignee_id).filter(Boolean))] as string[];
  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name,avatar_url")
      .in("id", assigneeIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    return steps.map((s) => ({
      ...s,
      assignee: s.assignee_id ? profileMap.get(s.assignee_id) ?? undefined : undefined,
    }));
  }

  return steps;
}

export async function createApprovalWorkflow(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tenantId: string,
  steps: Array<{
    role_label: "revisor" | "aprovador" | "cliente";
    assignee_id?: string | null;
    step_order: number;
  }>,
): Promise<ApprovalStep[]> {
  // Delete existing steps first
  await supabase
    .from("task_approval_steps" as never)
    .delete()
    .eq("task_id", taskId);

  const inserts = steps.map((s) => ({
    tenant_id: tenantId,
    task_id: taskId,
    step_order: s.step_order,
    role_label: s.role_label,
    assignee_id: s.assignee_id ?? null,
    status: "pending" as const,
  }));

  const { data, error } = await supabase
    .from("task_approval_steps" as never)
    .insert(inserts as never)
    .select();

  if (error) throw error;
  return (data ?? []) as ApprovalStep[];
}

export async function updateApprovalStep(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: { status: "approved" | "rejected" | "skipped"; feedback?: string },
): Promise<ApprovalStep> {
  const { data, error } = await supabase
    .from("task_approval_steps" as never)
    .update({
      status: updates.status,
      feedback: updates.feedback ?? null,
      decided_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ApprovalStep;
}

export async function getNextPendingStep(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<ApprovalStep | null> {
  const { data, error } = await supabase
    .from("task_approval_steps" as never)
    .select("*")
    .eq("task_id", taskId)
    .eq("status", "pending")
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as ApprovalStep) ?? null;
}
