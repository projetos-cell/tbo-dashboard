import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

interface BlogGenerateRequest {
  topic: string;
  tone: "ruy" | "marco" | "tbo";
  additionalInstructions?: string;
}

const TONE_PROFILES: Record<string, string> = {
  ruy: `Tom do Ruy Lima (CEO da TBO):
- Visao estrategica de negocio e gestao de agencia
- Foco em resultados, metricas e performance comercial
- Linguagem executiva, direta, sem firulas
- Referencia mercado imobiliario + comunicacao + branding
- Abordagem de quem lidera operacao e negocia com C-level de incorporadoras
- Posts no LinkedIn: insights de gestao, cases de sucesso, visao de mercado, lideranca`,

  marco: `Tom do Marco Andolfato (Diretor Criativo da TBO):
- Visao de diretor criativo: estetica, narrativa visual, archviz, branding
- Foco em como a comunicacao visual transforma a percepcao de valor de empreendimentos
- Linguagem consultiva, densa, com profundidade estrategica
- Referencia: direction de arte, identidade visual, campanhas de lancamento imobiliario
- Abordagem de quem define a linguagem visual e criativa para incorporadoras de alto padrao
- Posts no LinkedIn: tendencias visuais, bastidores criativos, frameworks de branding, archviz`,

  tbo: `Tom institucional da TBO (agencia):
- Equilibrio entre estrategia comercial e excelencia criativa
- Posicionamento como parceira estrategica de incorporadoras, nao fornecedora
- Linguagem profissional mas acessivel, com autoridade de mercado
- Referencia: cases, metodologia proprietaria, resultados comprovados
- Abordagem educativa: ensinar o mercado, elevar o padrao do setor`,
};

const SYSTEM_PROMPT = `Voce e o redator senior da TBO, agencia de comunicacao, branding e visualizacao arquitetonica (archviz) de Curitiba/PR, especializada no mercado imobiliario brasileiro.

Seu papel e gerar artigos de blog de alta qualidade que posicionem a TBO como referencia no mercado.

CONTEXTO DA TBO:
- Agencia full-service para incorporadoras e construtoras
- Servicos: branding de empreendimentos, direção criativa, archviz (renders 3D), campanhas de lancamento, naming, identidade visual
- Publico: diretores de marketing de incorporadoras, CEOs de construtoras, profissionais do mercado imobiliario
- Diferenciais: integracao entre estrategia e estetica, qualidade visual Apple-level, abordagem consultiva

REGRAS DE ESCRITA:
- Escreva em portugues brasileiro
- Tom consultivo e denso — sem "chatgptizacao" (nada de "no mundo atual", "em suma", "e importante ressaltar")
- Pargrafos curtos (2-4 linhas)
- Use subtitulos (h2, h3) para estruturar
- Inclua insights acionaveis, nao apenas teoria
- Faca analogias com outros mercados de alto padrao (moda, luxo, hotelaria, tech)
- Evite cliches do mercado imobiliario ("sonho da casa propria", "investimento seguro")
- Nivel editorial: Harvard Business Review Brasil, nao blog generico
- Tamanho: 800-1500 palavras

FORMATO DE SAIDA:
- Retorne APENAS o HTML do corpo do artigo (sem <html>, <body>, etc.)
- Use tags: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <blockquote>
- NAO use <h1> (o titulo ja existe separado)
- NAO inclua o titulo no corpo — ele sera definido separadamente
- NAO use markdown — apenas HTML puro`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY nao configurada" },
        { status: 500 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = (await request.json()) as BlogGenerateRequest;
    const { topic, tone, additionalInstructions } = body;

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: "Tema do artigo e obrigatorio" },
        { status: 400 },
      );
    }

    // Fetch existing blog posts as reference material
    let existingPostsContext = "";
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("title, excerpt, tags, body")
        .eq("status", "publicado")
        .order("published_at", { ascending: false })
        .limit(10);

      if (posts?.length) {
        existingPostsContext = `\n\nARTIGOS JA PUBLICADOS NO BLOG DA TBO (use como referencia de tom, temas e profundidade):
${posts
  .map(
    (p: { title: string; excerpt: string | null; tags: string[] | null; body: string }) =>
      `- "${p.title}"${p.excerpt ? ` — ${p.excerpt}` : ""}${p.tags?.length ? ` [Tags: ${p.tags.join(", ")}]` : ""}\n  Trecho: ${(p.body ?? "").replace(/<[^>]+>/g, "").slice(0, 300)}...`,
  )
  .join("\n")}`;
      }
    }

    const toneProfile = TONE_PROFILES[tone] ?? TONE_PROFILES.tbo;

    const userPrompt = `${toneProfile}
${existingPostsContext}

TEMA DO ARTIGO: ${topic}
${additionalInstructions ? `\nINSTRUCOES ADICIONAIS: ${additionalInstructions}` : ""}

Gere o artigo completo. Alem do corpo HTML, inclua no inicio da resposta uma linha com o titulo sugerido no formato:
TITULO: [titulo aqui]
EXCERPT: [resumo de 1-2 frases]
TAGS: [tag1, tag2, tag3]

Depois, uma linha em branco e o HTML do corpo.`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse structured response
    const titleMatch = text.match(/TITULO:\s*(.+)/);
    const excerptMatch = text.match(/EXCERPT:\s*(.+)/);
    const tagsMatch = text.match(/TAGS:\s*(.+)/);

    const suggestedTitle = titleMatch?.[1]?.trim() ?? "";
    const suggestedExcerpt = excerptMatch?.[1]?.trim() ?? "";
    const suggestedTags = tagsMatch?.[1]
      ?.split(",")
      .map((t: string) => t.trim())
      .filter(Boolean) ?? [];

    // Extract HTML body (everything after the metadata lines)
    const htmlStart = text.indexOf("<");
    const htmlBody = htmlStart >= 0 ? text.slice(htmlStart).trim() : text;

    return NextResponse.json({
      title: suggestedTitle,
      excerpt: suggestedExcerpt,
      tags: suggestedTags,
      body: htmlBody,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao gerar artigo";
    console.error("[blog-generate] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
