// ============================================================================
// TBO OS — Edge Function: Manage Team Member
// Handles deactivate, reactivate, and permanent delete of team members.
// Requires auth — caller must be founder or diretoria.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "deactivate" | "reactivate" | "delete";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // 1. Auth — validate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Token ausente.", 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !caller) {
      return jsonError("Sessao invalida.", 401);
    }

    // 2. Check caller role
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", caller.id)
      .single();

    if (!callerProfile || !["founder", "diretoria"].includes(callerProfile.role)) {
      return jsonError("Permissao negada.", 403);
    }

    // 3. Parse body
    const { action, target_id } = (await req.json()) as {
      action: Action;
      target_id: string;
    };

    if (!action || !target_id) {
      return jsonError("Campos action e target_id obrigatorios.", 400);
    }

    if (!["deactivate", "reactivate", "delete"].includes(action)) {
      return jsonError("Action invalida. Use: deactivate, reactivate, delete.", 400);
    }

    // 4. Prevent self-action
    if (target_id === caller.id) {
      return jsonError("Voce nao pode executar esta acao em si mesmo.", 400);
    }

    // 5. Check target exists and caller has hierarchy
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, tenant_id")
      .eq("id", target_id)
      .single();

    if (!targetProfile) {
      return jsonError("Membro nao encontrado.", 404);
    }

    const HIERARCHY: Record<string, number> = {
      founder: 4,
      diretoria: 3,
      lider: 2,
      colaborador: 1,
    };

    if ((HIERARCHY[callerProfile.role] ?? 0) <= (HIERARCHY[targetProfile.role] ?? 0)) {
      return jsonError("Voce nao pode gerenciar membros de nivel igual ou superior.", 403);
    }

    // 6. Execute action
    if (action === "deactivate") {
      return await handleDeactivate(supabaseAdmin, target_id, caller.id, callerProfile.tenant_id);
    }

    if (action === "reactivate") {
      return await handleReactivate(supabaseAdmin, target_id, caller.id, callerProfile.tenant_id);
    }

    if (action === "delete") {
      // Only founder can delete
      if (callerProfile.role !== "founder") {
        return jsonError("Apenas founder pode excluir membros.", 403);
      }
      return await handleDelete(supabaseAdmin, target_id, caller.id, callerProfile.tenant_id);
    }

    return jsonError("Action nao reconhecida.", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return jsonError(message, 500);
  }
});

// ────────────────────────────────────────────────────────────────
// Deactivate: remove access, keep records
// ────────────────────────────────────────────────────────────────

async function handleDeactivate(
  supabase: ReturnType<typeof createClient>,
  targetId: string,
  callerId: string,
  tenantId: string,
) {
  // Ban auth user (prevents login)
  const { error: banError } = await supabase.auth.admin.updateUserById(targetId, {
    ban_duration: "876000h", // ~100 years
  });
  if (banError) {
    return jsonError(`Erro ao banir usuario: ${banError.message}`, 500);
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      status: "suspended",
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);
  if (profileError) {
    return jsonError(`Erro ao atualizar profile: ${profileError.message}`, 500);
  }

  // Deactivate tenant_members
  await supabase
    .from("tenant_members")
    .update({ is_active: false })
    .eq("user_id", targetId);

  // Audit log
  await logAudit(supabase, tenantId, callerId, "team_member.deactivated", targetId);

  return jsonSuccess({ message: "Membro desativado com sucesso." });
}

// ────────────────────────────────────────────────────────────────
// Reactivate: restore access
// ────────────────────────────────────────────────────────────────

async function handleReactivate(
  supabase: ReturnType<typeof createClient>,
  targetId: string,
  callerId: string,
  tenantId: string,
) {
  // Unban auth user
  const { error: unbanError } = await supabase.auth.admin.updateUserById(targetId, {
    ban_duration: "none",
  });
  if (unbanError) {
    return jsonError(`Erro ao desbanir usuario: ${unbanError.message}`, 500);
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_active: true,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);
  if (profileError) {
    return jsonError(`Erro ao atualizar profile: ${profileError.message}`, 500);
  }

  // Reactivate tenant_members
  await supabase
    .from("tenant_members")
    .update({ is_active: true })
    .eq("user_id", targetId);

  // Audit log
  await logAudit(supabase, tenantId, callerId, "team_member.reactivated", targetId);

  return jsonSuccess({ message: "Membro reativado com sucesso." });
}

// ────────────────────────────────────────────────────────────────
// Delete: permanent removal from all tables + auth
// ────────────────────────────────────────────────────────────────

async function handleDelete(
  supabase: ReturnType<typeof createClient>,
  targetId: string,
  callerId: string,
  tenantId: string,
) {
  // Log before deleting (so we have the audit trail of the deletion itself)
  await logAudit(supabase, tenantId, callerId, "team_member.deleted", targetId);

  // Remove from related tables (order matters — FK constraints)
  // These have ON DELETE CASCADE from auth.users, but we clean explicitly for clarity

  // Project memberships
  await supabase.from("project_memberships").delete().eq("user_id", targetId);

  // Tenant members
  await supabase.from("tenant_members").delete().eq("user_id", targetId);

  // Chat channel members
  await supabase.from("chat_channel_members").delete().eq("user_id", targetId);

  // Collaborator history
  await supabase.from("collaborator_history").delete().eq("user_id", targetId);

  // Audit logs (remove history of this user's actions)
  await supabase.from("audit_logs").delete().eq("user_id", targetId);

  // Sidebar user state
  await supabase.from("sidebar_user_state").delete().eq("user_id", targetId);

  // User preferences
  await supabase.from("user_table_preferences").delete().eq("user_id", targetId);
  await supabase.from("user_view_state").delete().eq("user_id", targetId);

  // Profile (must be before auth.users deletion since it refs auth.users)
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", targetId);
  if (profileError) {
    return jsonError(`Erro ao excluir profile: ${profileError.message}`, 500);
  }

  // Delete auth user (final step)
  const { error: authError } = await supabase.auth.admin.deleteUser(targetId);
  if (authError) {
    return jsonError(`Erro ao excluir auth user: ${authError.message}`, 500);
  }

  return jsonSuccess({ message: "Membro excluido permanentemente." });
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

async function logAudit(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  userId: string,
  action: string,
  targetId: string,
) {
  await supabase.from("audit_logs").insert({
    tenant_id: tenantId,
    user_id: userId,
    action,
    resource_type: "team_member",
    resource_id: targetId,
    details: { target_id: targetId },
    created_at: new Date().toISOString(),
  });
}

function jsonSuccess(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify({ data }), {
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
