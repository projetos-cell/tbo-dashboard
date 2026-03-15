import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface SuggestSubtasksRequest {
  title: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SuggestSubtasksRequest;
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Titulo obrigatorio" },
        { status: 400 }
      );
    }

    const systemPrompt = `Voce e um assistente de gestao de projetos de uma agencia de publicidade (TBO).
Dada uma tarefa, sugira de 3 a 6 subtarefas praticas e acionaveis para completa-la.
Responda APENAS com um JSON array de strings, sem explicacao. Exemplo:
["Subtarefa 1", "Subtarefa 2", "Subtarefa 3"]
Regras:
- Cada subtarefa deve ser curta (max 80 chars)
- Subtarefas devem ser especificas e acionaveis
- Ordem logica de execucao
- Sem numeracao no texto`;

    const userContent = description
      ? `Tarefa: "${title}"\nDescricao: "${description}"`
      : `Tarefa: "${title}"`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";

    let subtasks: string[] = [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        subtasks = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      subtasks = [];
    }

    return NextResponse.json({ subtasks });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
