// ============================================================================
// TBO OS — Edge Function: Daily/Weekly Digest
// Gera resumo diario ou semanal para cada usuario
// Trigger: pg_cron ou chamada manual
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const digestType = url.searchParams.get("type") || "daily";
    const targetUserId = url.searchParams.get("user_id"); // Opcional: especificar usuario
    const interval = digestType === "weekly" ? "7 days" : "1 day";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Buscar usuarios ativos (founders e project_owners)
    let profilesQuery = supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["founder", "project_owner"]);

    if (targetUserId) {
      profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", targetUserId);
    }

    const { data: profiles } = await profilesQuery;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum perfil encontrado" }), { status: 200 });
    }

    const results = [];

    for (const profile of profiles) {
      // 2. Buscar dados relevantes do periodo para este usuario
      const since = new Date(Date.now() - (digestType === "weekly" ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString();

      // Tarefas do usuario
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, status, project_name, due_date")
        .eq("owner_id", profile.id)
        .gte("updated_at", since);

      // Projetos ativos do usuario
      const { data: projects } = await supabase
        .from("projects")
        .select("name, status, client, value")
        .eq("owner_id", profile.id)
        .not("status", "in", '("finalizado","cancelado")');

      // Deals em andamento
      const { data: deals } = await supabase
        .from("crm_deals")
        .select("name, stage, company, value")
        .eq("owner_id", profile.id)
        .not("stage", "in", '("fechado_ganho","fechado_perdido")');

      // Tarefas pendentes com prazo proximo
      const threeDaysAhead = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data: upcomingTasks } = await supabase
        .from("tasks")
        .select("title, due_date, project_name")
        .eq("owner_id", profile.id)
        .eq("status", "pendente")
        .lte("due_date", threeDaysAhead)
        .order("due_date");

      // Notificacoes nao lidas
      const { count: unreadNotifs } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("read", false);

      // 3. Montar conteudo do digest
      const tarefasConcluidas = tasks?.filter((t: any) => t.status === "concluida").length || 0;
      const tarefasPendentes = tasks?.filter((t: any) => t.status === "pendente").length || 0;
      const tarefasAndamento = tasks?.filter((t: any) => t.status === "em_andamento").length || 0;
      const periodo = digestType === "weekly" ? "Sua Semana" : "Seu Dia";
      const formatDate = (d: Date) => d.toLocaleDateString("pt-BR");
      const today = new Date();

      const htmlDigest = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">

    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 28px; text-align: center;">
      <h1 style="color: #ff6b35; margin: 0; font-size: 20px;">📋 ${periodo} na TBO</h1>
      <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">
        Ola, ${profile.full_name?.split(" ")[0] || "voce"}! ${formatDate(today)}
      </p>
    </div>

    <div style="padding: 20px;">

      <!-- Resumo rapido -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <div style="flex:1; background: #f0fdf4; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${tarefasConcluidas}</div>
          <div style="font-size: 11px; color: #6b7280;">Concluidas</div>
        </div>
        <div style="flex:1; background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${tarefasAndamento}</div>
          <div style="font-size: 11px; color: #6b7280;">Em Andamento</div>
        </div>
        <div style="flex:1; background: #fefce8; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${tarefasPendentes}</div>
          <div style="font-size: 11px; color: #6b7280;">Pendentes</div>
        </div>
      </div>

      <!-- Projetos ativos -->
      <h3 style="font-size: 13px; color: #374151; margin: 16px 0 8px;">🏗️ Projetos Ativos (${projects?.length || 0})</h3>
      ${projects && projects.length > 0 ? projects.slice(0, 5).map((p: any) => `
        <div style="padding: 8px; border-left: 3px solid #ff6b35; margin-bottom: 6px; background: #fafafa; border-radius: 0 6px 6px 0;">
          <strong style="font-size: 13px;">${p.name}</strong>
          <span style="font-size: 11px; color: #9ca3af; margin-left: 8px;">${p.client || ''}</span>
        </div>
      `).join('') : '<p style="font-size: 12px; color: #9ca3af;">Nenhum projeto ativo.</p>'}

      <!-- Tarefas urgentes -->
      ${upcomingTasks && upcomingTasks.length > 0 ? `
        <h3 style="font-size: 13px; color: #ef4444; margin: 16px 0 8px;">⚠️ Tarefas com Prazo Proximo</h3>
        ${upcomingTasks.map((t: any) => `
          <div style="padding: 6px 8px; font-size: 12px; border-left: 3px solid #ef4444; margin-bottom: 4px; background: #fef2f2; border-radius: 0 6px 6px 0;">
            ${t.title} <span style="color: #9ca3af;">· ${t.project_name || ''} · ${t.due_date}</span>
          </div>
        `).join('')}
      ` : ''}

      <!-- Deals em pipeline -->
      ${deals && deals.length > 0 ? `
        <h3 style="font-size: 13px; color: #374151; margin: 16px 0 8px;">💰 Deals em Pipeline (${deals.length})</h3>
        ${deals.slice(0, 5).map((d: any) => `
          <div style="padding: 6px 8px; font-size: 12px; margin-bottom: 4px; background: #fafafa; border-radius: 6px;">
            ${d.name} <span style="color: #9ca3af;">· ${d.company || ''}</span>
            <span style="float: right; font-weight: 600;">R$ ${(d.value || 0).toLocaleString("pt-BR")}</span>
          </div>
        `).join('')}
      ` : ''}

      <!-- Notificacoes -->
      ${(unreadNotifs || 0) > 0 ? `
        <div style="margin-top: 16px; padding: 12px; background: #fef3cd; border-radius: 8px; font-size: 12px;">
          🔔 Voce tem <strong>${unreadNotifs}</strong> notificacao(oes) nao lida(s).
        </div>
      ` : ''}

    </div>

    <div style="padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 11px; color: #9ca3af;">
      <a href="https://tbo-dashboard-main.vercel.app" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Abrir TBO OS →</a>
    </div>
  </div>
</body>
</html>`;

      // 4. Enviar email se configurado
      if (RESEND_API_KEY && profile.email) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "TBO OS <noreply@agenciatbo.com.br>",
              to: profile.email,
              subject: `📋 ${periodo} na TBO — ${formatDate(today)}`,
              html: htmlDigest
            })
          });
          results.push({ user: profile.full_name, email: profile.email, status: res.ok ? "sent" : "failed" });
        } catch (e) {
          results.push({ user: profile.full_name, email: profile.email, status: "error", error: e.message });
        }
      }

      // 5. Salvar no digest_logs
      await supabase.from("digest_logs").insert({
        type: digestType,
        recipient_email: profile.email || "",
        recipient_name: profile.full_name,
        subject: `${periodo} na TBO — ${formatDate(today)}`,
        content_html: htmlDigest,
        snapshot: { tarefasConcluidas, tarefasPendentes, tarefasAndamento, projetos: projects?.length, deals: deals?.length, unreadNotifs },
        status: RESEND_API_KEY ? "sent" : "pending"
      });
    }

    return new Response(JSON.stringify({ success: true, digestType, results }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
