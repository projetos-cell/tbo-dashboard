import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TeamMember,
  TeamFilters,
  InviteUserInput,
  UpdateUserInput,
  ChangeRoleInput,
} from "@/schemas/team";

// ────────────────────────────────────────────────────
// Queries — read from profiles table
// ────────────────────────────────────────────────────

export async function fetchTeamMembers(
  supabase: SupabaseClient,
  filters?: TeamFilters
): Promise<TeamMember[]> {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchTeamMember(
  supabase: SupabaseClient,
  id: string
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as TeamMember;
}

// ────────────────────────────────────────────────────
// Mutations — write to profiles table
// ────────────────────────────────────────────────────

export async function inviteTeamMember(
  supabase: SupabaseClient,
  input: InviteUserInput
): Promise<TeamMember> {
  // Calls Edge Function that uses auth.admin.inviteUserByEmail()
  // to create the auth.users record first, then inserts profile.
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL nao configurada.");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/invite-team-member`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: input.email,
        full_name: input.full_name,
        role: input.role,
        department: input.department || null,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Erro ${response.status}`);
  }

  return result.data as TeamMember;
}

export async function updateTeamMember(
  supabase: SupabaseClient,
  input: UpdateUserInput
): Promise<TeamMember> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function changeUserRole(
  supabase: SupabaseClient,
  input: ChangeRoleInput
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: input.role } as never)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

// ────────────────────────────────────────────────────
// Edge Function calls — manage-team-member
// ────────────────────────────────────────────────────

async function callManageTeamMember(
  supabase: SupabaseClient,
  action: "deactivate" | "reactivate" | "delete",
  targetId: string
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL nao configurada.");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/manage-team-member`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, target_id: targetId }),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Erro ${response.status}`);
  }
}

export async function toggleUserActive(
  supabase: SupabaseClient,
  id: string,
  is_active: boolean
): Promise<TeamMember> {
  // Call Edge Function to ban/unban auth user + update profile + tenant_members
  await callManageTeamMember(supabase, is_active ? "reactivate" : "deactivate", id);

  // Fetch updated profile to return
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function deleteTeamMember(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  // Call Edge Function to delete from all tables + auth
  await callManageTeamMember(supabase, "delete", id);
}
