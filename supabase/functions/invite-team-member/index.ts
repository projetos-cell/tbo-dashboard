// ============================================================================
// TBO OS — Edge Function: Invite Team Member
// Creates a new user via Supabase auth.admin.inviteUserByEmail,
// then inserts a profile and tenant_members record.
// Requires auth — caller must be founder or diretoria.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RoleSlug = "founder" | "diretoria" | "lider" | "colaborador";

const HIERARCHY: Record<RoleSlug, number> = {
  founder: 4,
  diretoria: 3,
  lider: 2,
  colaborador: 1,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // 1. Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Token ausente.", 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 2. Get caller from token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return jsonError("Sessao invalida.", 401);
    }

    // 3. Check caller role — must be founder or diretoria
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", caller.id)
      .single();

    if (
      !callerProfile ||
      !["founder", "diretoria"].includes(callerProfile.role)
    ) {
      return jsonError("Permissao negada. Apenas founder ou diretoria podem convidar membros.", 403);
    }

    // 4. Parse and validate body
    const body = await req.json();
    const { email, full_name, role, department } = body as {
      email?: string;
      full_name?: string;
      role?: string;
      department?: string | null;
    };

    if (!email || !full_name || !role) {
      return jsonError("Campos email, full_name e role sao obrigatorios.", 400);
    }

    if (!["founder", "diretoria", "lider", "colaborador"].includes(role)) {
      return jsonError("Role invalida. Use: founder, diretoria, lider, colaborador.", 400);
    }

    // 5. Caller can only assign roles below their own level
    const callerLevel = HIERARCHY[callerProfile.role as RoleSlug] ?? 0;
    const targetLevel = HIERARCHY[role as RoleSlug] ?? 0;

    if (callerProfile.role !== "founder" && targetLevel >= callerLevel) {
      return jsonError("Voce nao pode atribuir um nivel de acesso igual ou superior ao seu.", 403);
    }

    // 6. Check if email is already registered
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return jsonError("Este e-mail ja esta cadastrado no sistema.", 409);
    }

    // 7. Invite user via Supabase Auth (sends magic link email)
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
          role,
          tenant_id: callerProfile.tenant_id,
        },
      });

    if (inviteError || !inviteData?.user) {
      return jsonError(
        `Erro ao enviar convite: ${inviteError?.message ?? "Erro desconhecido"}`,
        500
      );
    }

    const newUserId = inviteData.user.id;

    // 8. Insert profile record
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        email,
        full_name,
        role,
        department: department ?? null,
        is_active: true,
        status: "invited",
        tenant_id: callerProfile.tenant_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return jsonError(`Erro ao criar perfil: ${profileError.message}`, 500);
    }

    // 9. Insert tenant_members record
    const { error: memberError } = await supabaseAdmin
      .from("tenant_members")
      .insert({
        tenant_id: callerProfile.tenant_id,
        user_id: newUserId,
        role,
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      // Non-fatal: profile was created, just log
      console.error("tenant_members insert failed:", memberError.message);
    }

    // 10. Audit log
    await supabaseAdmin.from("audit_logs").insert({
      tenant_id: callerProfile.tenant_id,
      user_id: caller.id,
      action: "team_member.invited",
      resource_type: "team_member",
      resource_id: newUserId,
      details: { email, full_name, role, department: department ?? null },
      created_at: new Date().toISOString(),
    });

    return jsonSuccess({ data: newProfile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return jsonError(message, 500);
  }
});

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function jsonSuccess(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
