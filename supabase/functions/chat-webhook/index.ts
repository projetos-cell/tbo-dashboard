// Edge Function: chat-webhook
// #46 — Receives POST requests from external systems and posts bot messages to a channel

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-webhook-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Token can be in header or query param
    const url = new URL(req.url);
    const token =
      req.headers.get("x-webhook-token") ??
      url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Look up webhook by token
    const { data: webhook, error: whErr } = await supabase
      .from("chat_webhooks")
      .select("id, channel_id, tenant_id, name, is_active")
      .eq("token", token)
      .single();

    if (whErr || !webhook || !webhook.is_active) {
      return new Response(JSON.stringify({ error: "Invalid or inactive webhook" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse payload
    const body = await req.json() as {
      text?: string;
      content?: string;
      username?: string;
    };

    const content = (body.text ?? body.content ?? "").trim();
    if (!content) {
      return new Response(JSON.stringify({ error: "Empty message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = body.username ?? webhook.name ?? "Bot";

    // Insert message as a bot message (no sender_id = bot/webhook)
    const { data: message, error: msgErr } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: webhook.channel_id,
        content,
        message_type: "bot",
        metadata: { webhook_id: webhook.id, bot_name: senderName },
      } as never)
      .select("id")
      .single();

    if (msgErr) throw msgErr;

    return new Response(JSON.stringify({ ok: true, message_id: message.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chat-webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
