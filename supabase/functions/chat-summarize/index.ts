// Edge Function: chat-summarize
// #45 — "O que perdi?" — summarize recent channel messages with Claude

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { channel_id, since, limit = 100 } = await req.json() as {
      channel_id: string;
      since?: string;
      limit?: number;
    };

    if (!channel_id) {
      return new Response(JSON.stringify({ error: "channel_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch channel name
    const { data: channel } = await supabase
      .from("chat_channels")
      .select("name")
      .eq("id", channel_id)
      .single();

    // Fetch recent messages
    let query = supabase
      .from("chat_messages")
      .select("content, sender_id, created_at, profiles(full_name)")
      .eq("channel_id", channel_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 200));

    if (since) {
      query = query.gte("created_at", since);
    }

    const { data: messages } = await query;
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ summary: null, message_count: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format messages for the LLM (oldest first)
    const sorted = [...messages].reverse();
    const transcript = sorted
      .map((m: Record<string, unknown>) => {
        const name = (m.profiles as Record<string, unknown> | null)?.full_name ?? "Desconhecido";
        const time = new Date(m.created_at as string).toLocaleString("pt-BR");
        const content = (m.content as string ?? "").replace(/<[^>]+>/g, "").trim();
        return `[${time}] ${name}: ${content}`;
      })
      .join("\n");

    const prompt = `Analise as últimas ${sorted.length} mensagens do canal "#${channel?.name ?? channel_id}" e gere um resumo estruturado em português brasileiro.

MENSAGENS:
${transcript}

Gere um JSON com exatamente esta estrutura (sem markdown, JSON puro):
{
  "topics": ["lista de tópicos principais discutidos"],
  "decisions": ["decisões tomadas ou acordos fechados"],
  "action_items": ["tarefas, pendências ou próximos passos mencionados"],
  "highlights": ["momentos importantes ou informações-chave"],
  "period_label": "período coberto (ex: 'últimas 2 horas', 'hoje', 'ontem até agora')"
}`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      throw new Error(`Anthropic error: ${await anthropicRes.text()}`);
    }

    const aiData = await anthropicRes.json() as { content: Array<{ text: string }> };
    const rawText = aiData.content[0]?.text ?? "{}";

    let summary: unknown;
    try {
      summary = JSON.parse(rawText);
    } catch {
      summary = { highlights: [rawText], topics: [], decisions: [], action_items: [], period_label: "" };
    }

    return new Response(
      JSON.stringify({ summary, message_count: sorted.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("chat-summarize error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
