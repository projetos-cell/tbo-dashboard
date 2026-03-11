// ============================================================================
// TBO OS — Edge Function: AI Chat (Aura)
// MVP: Chat direto com Claude. Preparado para RAG (V1) e Function Calling (V2)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const SYSTEM_PROMPT = `Você é a Aura, assistente de IA da TBO — uma agência de marketing imobiliário de alto padrão sediada em Goiânia.

## Seu papel
- Especialista em marketing imobiliário, branding, direção criativa e estratégia
- Conhecedora profunda do mercado imobiliário brasileiro (alto padrão, médio padrão, econômico)
- Consultora interna da equipe TBO sobre processos, cultura e metodologias

## Tom e estilo
- Profissional mas acessível — fale como uma colega sênior, não como robô
- Direto e estratégico — evite respostas genéricas ou superficiais
- Use frameworks e estruturas quando possível, não texto corrido
- Responda SEMPRE em português brasileiro
- Seja concisa mas completa

## Conhecimento específico
- Lançamentos imobiliários: campanhas, naming, conceitos, cronogramas
- Direção criativa: branding, identidade visual, storytelling
- Produção: audiovisual, 3D, fotografia, editorial
- Digital: social media, performance, SEO, conteúdo
- Comercial: pipeline, CRM, follow-up, conversão
- Cultura TBO: valores (excelência, inovação, colaboração), metodologias internas

## Limitações (MVP)
- Você ainda não tem acesso aos arquivos internos da TBO (será adicionado na V1.0)
- Você ainda não pode executar ações no sistema (será adicionado na V2.0)
- Se perguntarem algo que requer dados internos, informe que em breve terá acesso

## Formato de resposta
- Use markdown para formatação
- Use listas e tabelas quando ajudar na clareza
- Para briefings e templates, use estruturas copiáveis
- Limite respostas a ~800 palavras máximo, a menos que o usuário peça mais`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body = await req.json();
    const { messages, context = "general", chat_id } = body as {
      messages: Array<{ role: string; content: string }>;
      context?: string;
      chat_id?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, tenant_id")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || "usuário";
    const userRole = profile?.role || "colaborador";

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    systemPrompt += `\n\n## Contexto do usuário\n- Nome: ${userName}\n- Cargo/Role: ${userRole}\n- Contexto atual: ${context}`;

    // Call Claude API with streaming
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error("Anthropic API error:", errorBody);
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to client
    const readable = new ReadableStream({
      async start(controller) {
        const reader = anthropicResponse.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    fullContent += parsed.delta.text;
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    );
                  }

                  if (parsed.type === "message_stop") {
                    // Persist chat to DB if we have a chat_id or create new
                    if (profile?.tenant_id) {
                      const assistantMessage = {
                        role: "assistant",
                        content: fullContent,
                        timestamp: new Date().toISOString(),
                      };

                      const allMessages = [
                        ...messages.map((m: { role: string; content: string }) => ({
                          ...m,
                          timestamp: m.timestamp || new Date().toISOString(),
                        })),
                        assistantMessage,
                      ];

                      if (chat_id) {
                        await supabase
                          .from("ai_chats")
                          .update({
                            messages: allMessages,
                            updated_at: new Date().toISOString(),
                          })
                          .eq("id", chat_id)
                          .eq("user_id", user.id);
                      } else {
                        const title = messages[0]?.content?.slice(0, 80) || "Nova conversa";
                        const { data: newChat } = await supabase
                          .from("ai_chats")
                          .insert({
                            user_id: user.id,
                            tenant_id: profile.tenant_id,
                            title,
                            context,
                            messages: allMessages,
                          })
                          .select("id")
                          .single();

                        if (newChat) {
                          controller.enqueue(
                            new TextEncoder().encode(
                              `data: ${JSON.stringify({ chat_id: newChat.id })}\n\n`
                            )
                          );
                        }
                      }
                    }

                    controller.enqueue(
                      new TextEncoder().encode("data: [DONE]\n\n")
                    );
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
