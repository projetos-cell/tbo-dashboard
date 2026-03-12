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
  const { error } = await supabase
    .from("profiles")
    .update({
      ...profileUpdates,
      first_login_completed: true,
      onboarding_wizard_completed: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);
  if (error) throw error;
}
