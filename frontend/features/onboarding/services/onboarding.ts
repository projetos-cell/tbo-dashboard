import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getOnboardingStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ firstLoginCompleted: boolean; wizardCompleted: boolean }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("first_login_completed, onboarding_wizard_completed")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return {
    firstLoginCompleted: data?.first_login_completed ?? false,
    wizardCompleted: data?.onboarding_wizard_completed ?? false,
  };
}

export async function skipOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ first_login_completed: true, updated_at: new Date().toISOString() } as never)
    .eq("id", userId);
  if (error) throw error;
}

export async function completeOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
  profileUpdates: Pick<ProfileUpdate, "full_name" | "cargo" | "avatar_url">,
): Promise<void> {
  // Build update payload — only include fields with actual values
  const payload: Record<string, unknown> = {
    first_login_completed: true,
    onboarding_wizard_completed: true,
    updated_at: new Date().toISOString(),
  };
  if (profileUpdates.full_name) payload.full_name = profileUpdates.full_name;
  if (profileUpdates.cargo) payload.cargo = profileUpdates.cargo;
  if (profileUpdates.avatar_url) payload.avatar_url = profileUpdates.avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", userId);
  if (error) throw error;
}

// ── Onboarding Checklist (auto-onboarding) ──────────────────────────────────

export type ChecklistProgress = Record<
  string,
  { completed: boolean; completed_at: string }
>;

export async function getOnboardingChecklist(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ChecklistProgress> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_checklist" as never)
    .eq("id", userId)
    .single();
  // Graceful fallback if column doesn't exist yet (migration not applied)
  if (error) {
    console.warn("onboarding_checklist fetch error:", error.message);
    return {};
  }
  const row = data as unknown as { onboarding_checklist?: ChecklistProgress };
  return row?.onboarding_checklist ?? {};
}

export async function toggleChecklistTask(
  supabase: SupabaseClient<Database>,
  userId: string,
  taskId: string,
  currentChecklist: ChecklistProgress,
): Promise<ChecklistProgress> {
  const isCompleted = currentChecklist[taskId]?.completed;
  const updated = { ...currentChecklist };

  if (isCompleted) {
    delete updated[taskId];
  } else {
    updated[taskId] = {
      completed: true,
      completed_at: new Date().toISOString(),
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_checklist: updated,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);
  if (error) throw error;

  return updated;
}

// ── Onboarding Quiz ─────────────────────────────────────────────────────────

export interface QuizDayResult {
  answers: Record<string, string>; // questionId -> selectedOptionId
  score: number;
  total: number;
  passed: boolean;
  completed_at: string;
}

export type QuizProgress = Record<string, QuizDayResult>; // "day_1" -> result

export async function getQuizProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<QuizProgress> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_quiz" as never)
    .eq("id", userId)
    .single();
  if (error) {
    console.warn("onboarding_quiz fetch error:", error.message);
    return {};
  }
  const row = data as unknown as { onboarding_quiz?: QuizProgress };
  return row?.onboarding_quiz ?? {};
}

export async function submitQuizDay(
  supabase: SupabaseClient<Database>,
  userId: string,
  dayKey: string,
  result: QuizDayResult,
  currentProgress: QuizProgress,
): Promise<QuizProgress> {
  const updated = { ...currentProgress, [dayKey]: result };

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_quiz: updated,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);
  if (error) throw error;

  return updated;
}
