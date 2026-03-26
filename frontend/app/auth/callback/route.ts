import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Ensures the user has a profile and tenant_member record.
 * Called after first Google OAuth login to bootstrap the user.
 */
async function ensureProfileExists(userId: string, userEmail: string, fullName: string | null, avatarUrl: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check if profile already exists
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) return; // Profile exists, nothing to do

  // Find the first active tenant (TBO)
  const { data: tenant } = await admin
    .from("tenants")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!tenant) return; // No tenant found — skip (admin must create one)

  // Find the 'colaborador' role for this tenant
  const { data: role } = await admin
    .from("roles")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("slug", "colaborador")
    .single();

  // Create profile
  await admin.from("profiles").insert({
    id: userId,
    tenant_id: tenant.id,
    full_name: fullName ?? userEmail.split("@")[0],
    username: userEmail.split("@")[0],
    email: userEmail,
    avatar_url: avatarUrl,
    role: "colaborador",
    status: "onboarding",
    is_active: true,
    first_login_completed: false,
    onboarding_wizard_completed: false,
  } as never);

  // Create tenant_member
  if (role) {
    await admin.from("tenant_members").insert({
      tenant_id: tenant.id,
      user_id: userId,
      role_id: role.id,
      is_active: true,
    } as never);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/projetos";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile exists for first-time OAuth users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        await ensureProfileExists(
          user.id,
          user.email ?? "",
          (meta?.full_name as string) ?? (meta?.name as string) ?? null,
          (meta?.avatar_url as string) ?? (meta?.picture as string) ?? null,
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
