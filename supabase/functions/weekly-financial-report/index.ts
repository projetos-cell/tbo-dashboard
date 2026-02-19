// ============================================================================
// TBO OS — Edge Function: Weekly Financial Report
// Envia relatorio financeiro semanal para marco@ e ruy@agenciatbo.com.br
// Trigger: pg_cron toda segunda-feira 8h OU chamada manual via REST
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const RECIPIENTS = [
  { email: "marco@agenciatbo.com.br", name: "Marco Andolfato" },
  { email: "ruy@agenciatbo.com.br", name: "Ruy Lima" }
];

serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Buscar resumo financeiro da semana
    const { data: financial } = await supabase
      .from("v_weekly_financial_summary")
      .select("*")
      .single();

    // 2. Buscar resumo de projetos
    const { data: projects } = await supabase
      .from("v_weekly_project_summary")
      .select("*")
      .single();

    // 3. Deals ganhos na semana (detalhes)
    const { data: dealsGanhos } = await supabase
      .from("crm_deals")
      .select("name, company, value, owner_name")
      .eq("stage", "fechado_ganho")
      .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("value", { ascending: false })
      .limit(10);

    // 4. Deals perdidos na semana
    const { data: dealsPerdidos } = await supabase
      .from("crm_deals")
      .select("name, company, value, owner_name")
      .eq("stage", "fechado_perdido")
      .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    // 5. Projetos finalizados na semana
    const { data: projetosFinalizados } = await supabase
      .from("projects")
      .select("name, client, value")
      .eq("status", "finalizado")
      .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    // 6. Montar HTML do email
    const today = new Date();
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toLocaleDateString("pt-BR");
    const formatCurrency = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px; text-align: center;">
      <h1 style="color: #ff6b35; margin: 0; font-size: 24px;">📊 Relatorio Financeiro Semanal</h1>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">
        ${formatDate(weekStart)} — ${formatDate(today)}
      </p>
    </div>

    <!-- KPIs -->
    <div style="padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #22c55e;">${financial?.deals_ganhos_semana || 0}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Deals Ganhos</div>
        <div style="font-size: 14px; font-weight: 600; color: #16a34a; margin-top: 4px;">
          ${formatCurrency(financial?.valor_ganho_semana)}
        </div>
      </div>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #ef4444;">${financial?.deals_perdidos_semana || 0}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Deals Perdidos</div>
      </div>
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${financial?.deals_em_pipeline || 0}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Em Pipeline</div>
        <div style="font-size: 14px; font-weight: 600; color: #2563eb; margin-top: 4px;">
          ${formatCurrency(financial?.valor_pipeline)}
        </div>
      </div>
      <div style="background: #fefce8; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${projects?.projetos_ativos || 0}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Projetos Ativos</div>
        <div style="font-size: 14px; font-weight: 600; color: #d97706; margin-top: 4px;">
          ${formatCurrency(projects?.valor_projetos_ativos)}
        </div>
      </div>
    </div>

    <!-- Valor Ponderado -->
    <div style="padding: 0 24px 16px;">
      <div style="background: linear-gradient(135deg, #ff6b35, #f43f5e); border-radius: 8px; padding: 16px; text-align: center; color: #fff;">
        <div style="font-size: 12px; opacity: 0.9;">Valor Ponderado do Pipeline</div>
        <div style="font-size: 28px; font-weight: 700; margin-top: 4px;">
          ${formatCurrency(financial?.valor_ponderado_pipeline)}
        </div>
      </div>
    </div>

    <!-- Deals Ganhos -->
    ${(dealsGanhos && dealsGanhos.length > 0) ? `
    <div style="padding: 0 24px 16px;">
      <h3 style="font-size: 14px; color: #374151; margin: 0 0 8px;">✅ Deals Ganhos esta Semana</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="background: #f9fafb;">
          <th style="text-align: left; padding: 8px; color: #6b7280;">Deal</th>
          <th style="text-align: left; padding: 8px; color: #6b7280;">Empresa</th>
          <th style="text-align: right; padding: 8px; color: #6b7280;">Valor</th>
        </tr>
        ${dealsGanhos.map((d: any) => `
        <tr style="border-top: 1px solid #f3f4f6;">
          <td style="padding: 8px;">${d.name}</td>
          <td style="padding: 8px; color: #6b7280;">${d.company || '-'}</td>
          <td style="padding: 8px; text-align: right; font-weight: 600; color: #22c55e;">${formatCurrency(d.value)}</td>
        </tr>`).join('')}
      </table>
    </div>` : ''}

    <!-- Projetos Finalizados -->
    ${(projetosFinalizados && projetosFinalizados.length > 0) ? `
    <div style="padding: 0 24px 16px;">
      <h3 style="font-size: 14px; color: #374151; margin: 0 0 8px;">🏁 Projetos Finalizados</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${projetosFinalizados.map((p: any) => `
        <tr style="border-top: 1px solid #f3f4f6;">
          <td style="padding: 8px;">${p.name}</td>
          <td style="padding: 8px; color: #6b7280;">${p.client || '-'}</td>
          <td style="padding: 8px; text-align: right;">${formatCurrency(p.value)}</td>
        </tr>`).join('')}
      </table>
    </div>` : ''}

    <!-- Footer -->
    <div style="padding: 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af;">
      <p>Gerado automaticamente pelo <strong>TBO OS</strong></p>
      <p>Acesse o dashboard: <a href="https://tbo-dashboard-main.vercel.app" style="color: #ff6b35;">tbo-dashboard-main.vercel.app</a></p>
    </div>
  </div>
</body>
</html>`;

    // 7. Enviar emails via Resend (ou logar se nao configurado)
    const results = [];

    for (const recipient of RECIPIENTS) {
      if (RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "TBO OS <noreply@agenciatbo.com.br>",
            to: recipient.email,
            subject: `📊 Relatorio Semanal TBO — ${formatDate(weekStart)} a ${formatDate(today)}`,
            html: htmlEmail
          })
        });
        const resData = await res.json();
        results.push({ email: recipient.email, status: res.ok ? "sent" : "failed", data: resData });
      } else {
        results.push({ email: recipient.email, status: "skipped", reason: "RESEND_API_KEY not configured" });
      }

      // 8. Registrar no digest_logs
      await supabase.from("digest_logs").insert({
        type: "financial",
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        subject: `Relatorio Semanal TBO — ${formatDate(weekStart)} a ${formatDate(today)}`,
        content_html: htmlEmail,
        snapshot: { financial, projects, dealsGanhos, dealsPerdidos, projetosFinalizados },
        status: RESEND_API_KEY ? "sent" : "pending"
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
